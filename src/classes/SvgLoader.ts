import {readFileSync} from "fs";
import {optimize} from "svgo";
import {svgPathProperties} from "svg-path-properties";
import {Properties} from "svg-path-properties/src/types";
import * as fs from "fs";
import {SvgPathPoint} from "../interfaces/SvgPathPoint";

export class SvgLoader {
    private svgPath!: string;
    private properties: Properties;

    constructor(private src: string) {
        this._loadSvg();
    }

    public getPointAtPercent(percent: number) {
        const length = this.properties.getTotalLength();
        return this.properties.getPointAtLength(percent == 0 ? 0 : length * percent);
    }

    private _loadSvg() {
        const svgFile = readFileSync(this.src, {encoding: "utf8"})
        const svg = optimize(svgFile, {
            js2svg: {
                pretty: false,
            },
            multipass: false,
        }).data;

        if(this.src.includes("00100.")) {
            fs.writeFileSync("test1.svg", svg);
        }

        this.svgPath = SvgLoader.ConvertToSinglePath(svg);


        try {
            this.properties = new svgPathProperties(this.svgPath) as Properties;
        } catch (e) {
            fs.writeFileSync("error.svg", this.toSvgFile());
            throw e
        }
    }

    public toSvgFile() {
        return SvgLoader.ToSvgFile(this.svgPath);
    }

    public static ToSvgFile(path: string) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000">
                    <path fill="#CCC" fill-opacity="0" stroke="#FFF"
                          d="${path}"/>
                </svg>`;
    }

    public static ConvertToSinglePath(svg) {
        const match = /(?<=d=").+?"/gmi[Symbol.match](svg).map(v => {
            v = v.replace(/"$/, "");

            v = v.replace(/(?<first>\d*\.\d+)(?<next>\.\d+)/g, `$<first> $<next>`)

            if (/^m/.test(v)) {
                v = v.replace(/^m(?<cords>[-\s]?\d*\.?\d+[-\s]\d*\.?\d+)/, "M$<cords>m");
            }


            const split = v.split("z");

            const parts = [];
            split.forEach((part, i) => {
                if (!part) {
                    return;
                }
                if (split[i + 1] != null) {
                    try {

                        const cords = /^[Mm](?<cords>[-\s]?\d*\.?\d+[-\s]\d*\.?\d+)/[Symbol.match](part).groups["cords"];
                        if (cords.trim()) {
                            part += " L" + cords;
                        }
                        parts.push(part);
                    } catch (e) {
                        console.log(part, split)
                        throw e;
                    }
                }
            })

            if (parts.length > 0) {
                v = parts.join(" ");
            }

            v = v.replace(/z/gi, " ");

            return v;
        })

        return match.join(" ");
    }

    private static removeDuplicatePoints(pathString: string) {
        const cords = /[MmLl]?[-\s]?\d*\.\d+[-\s]?\d*\.\d+/g[Symbol.match](pathString);

        const path: SvgPathPoint[] = [];

        cords.forEach(cord => {
            const prefixRegex = /^[MmLl]/;
            const relativeRegex = /^[ml]/;

            const p: SvgPathPoint = {
                prefix: prefixRegex.test(cord) ? cord[0] : undefined ,
                isRelative: relativeRegex.test(cord),
                x: 0,
                y: 0
            };

            const match = cord.replace(prefixRegex, "").match(/[-\s]?\d*\.\d+/g);

            p.x = parseFloat(match[0]);
            p.y = parseFloat(match[1]);

            path.push(p);
        });

        let lastAbsolute: SvgPathPoint;
        path.forEach(p => {
            if(!p.isRelative) {
                lastAbsolute = p;
            } else if(lastAbsolute) {
                p.x += lastAbsolute.x;
                p.y += lastAbsolute.y;
                p.isRelative = false;
                p.prefix = p.prefix?.toUpperCase();

                lastAbsolute = p;
            } else if(path.indexOf(p) == 0) {
                p.isRelative = false;
                p.prefix = p.prefix?.toUpperCase();

                lastAbsolute = p;
            }
        });

        return path.map(p => `${p.prefix || ""} ${p.x} ${p.y}`).join(" ");
    }
}