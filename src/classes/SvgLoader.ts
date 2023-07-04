import * as fs from "fs";
import SVGParser from "convertpath"
import {toPath, toPoints} from "svg-points";
import {Point} from "svg-path-properties/dist/types/types";
import {Svg} from "./Svg";
import {GroupData, GroupPoint, TDirection} from "../interfaces/GroupPoint";
import path from "path";
import {Worker} from "worker_threads";
import ProgressBar from "progress";

export class SvgLoader {

    private static LastPoint: GroupPoint;
    private _loaded?: Svg;

    constructor(private src?: string) {
    }

    public static RegisterFolder(folderPath: string, startFrame?: number, endFrame?: number) {
        const folder = fs.readdirSync(folderPath);
        const svgList: SvgLoader[] = []
        for (const file of folder) {
            if (/\.svg$/i.test(file)) {
                svgList.push(new SvgLoader(path.join(folderPath, file)));
            }
        }

        if (startFrame != null) {
            const firstFrame = !!folder[0] && parseInt(folder[0].split("_")[1]);

            if (firstFrame != startFrame) {
                let diff = 0;
                if (firstFrame === false) {
                    if (endFrame != null) {
                        diff = endFrame - startFrame;
                        endFrame = undefined;
                    }
                } else {
                    diff = firstFrame - startFrame;
                }

                for (let i = 0; i < diff; i++) {
                    svgList.unshift(new SvgLoader());
                }
            }
        }

        if (endFrame != null) {
            const lastFrame = parseInt(folder[folder.length - 1].split("_")[1]);

            const diff = endFrame - lastFrame;
            for (let i = 0; i < diff; i++) {
                svgList.push(new SvgLoader());
            }
        }

        return svgList;
    }


    loadSvg() {
        if (this._loaded) {
            return this._loaded;
        }

        if (!this.src) {
            return this._loaded = new Svg("M0 0");
        }


        const svgFile = SVGParser.parse(this.src, {
            plugins: [
                {
                    convertShapeToPath: true,
                },
                {
                    removeGroups: true,
                },
                {
                    convertTransformforPath: false,
                }
            ]
        });

        const svgPath = SvgLoader.ConvertToSinglePath(svgFile.toSimpleSvg());

        try {
            return this._loaded = new Svg(svgPath);
        } catch (e) {
            fs.writeFileSync("error.svg", SvgLoader.ToSvgFile(svgPath));
            throw e
        }
    }

    public static async LoadAsync(svgs: SvgLoader[], progress: ProgressBar) {
        return new Promise<void>((r, e) => {
            const worker = new Worker(path.join(__dirname, "worker/SvgWorker.js"), {
                workerData: {
                    src: svgs.map(s => s.src),
                }
            });
            worker.on("message", ({paths, done}) => {
                if (!done) {
                    progress.tick()
                } else {
                    svgs.forEach((s, i) => {
                        s._loaded = new Svg(paths[i]);
                    })
                    r();
                }
            });
        })
    }

    dispose() {
        delete this._loaded;
    }


    public static ToSvgFile(path: string) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000">
                    <path fill="#CCC" fill-opacity="0" stroke="#FFF"
                          d="${path}"/>
                </svg>`;
    }

    public static ConvertToSinglePath(svg: string) {
        const match = /(?<=d=").+?"/gmi[Symbol.match](svg)?.map(v => {
            v = v.replace(/"$/, "");

            v = v.replace(/(?<first>\d*\.\d+)(?<next>\.\d+)/g, `$<first> $<next>`)

            if (/^m/.test(v)) {
                v = v.replace(/^m(?<cords>[-\s]?\d*\.?\d+[-\s]\d*\.?\d+)/, "M$<cords>m");
            }


            const split = v.split("z");

            const parts: string[] = [];
            split.forEach((part, i) => {
                if (!part) {
                    return;
                }
                if (split[i + 1] != null) {
                    try {

                        const cords = /^[Mm](?<cords>[-\s]?\d*\.?\d+[-\s]\d*\.?\d+)/[Symbol.match](part)?.groups?.["cords"];
                        if (cords?.trim()) {
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

        return this.removeDuplicatePoints(match?.join(" ") || "");
    }

    private static getPointGroups(points: GroupPoint[]) {
        const groups: GroupData[] = [];
        points.forEach(p => {
            if (p.moveTo || groups.length == 0) {
                groups.push({data: [], Index: 0});
            }
            groups[groups.length - 1].data.push(p as any);
        });

        groups.forEach((g, i) => {
            g.Index = i;
        });

        return groups.filter(g => g.data.length > 0);
    }

    private static SortPointsByGroup(points: GroupPoint[], lastPoint?: GroupPoint, stack: number | false = 0): GroupPoint[] {
        const groups = this.getPointGroups(points);

        const pointsSorted: GroupPoint[] = [];

        function getDistance(a: GroupPoint, b: GroupPoint) {
            const x = Math.abs(a.x - b.x);
            const y = Math.abs(a.y - b.y);
            return Math.sqrt(x * x + y * y);
        }

        let closestGroup: GroupData | undefined = undefined, lastDirection: TDirection = "r";

        function addGroup(groups: GroupData[], now: GroupData, startGroup = false, direction: TDirection = "r") {
            let closest = Infinity;
            closestGroup = undefined;

            if (!startGroup) {
                const index = groups.findIndex(e => e.Index == now.Index);
                if (index < 0) {
                    throw new Error()
                } else {
                    groups.splice(index, 1);
                }
            }

            let zeroCount = [], isReverse = false;
            const last = now.data[now.data.length - 1];

            for (let group of groups) {
                const distance = getDistance(group.data[0], last);
                const reverseDistance = getDistance(group.data[group.data.length - 1], last)

                if (distance == 0 || reverseDistance == 0) {
                    if (distance == 0) {
                        isReverse = false;
                    } else if (reverseDistance == 0) {
                        isReverse = true;
                    }

                    zeroCount.push({group, isReverse});
                }

                if ((reverseDistance == 0 ? 0 : distance) < closest) {
                    closestGroup = group;
                    closest = reverseDistance == 0 ? 0 : distance;
                }
            }

            if (zeroCount.length > 1) {
                function isIndirection(g: GroupData, isReverse: boolean) {
                    const point = g.data[(!isReverse ? g.data.length - 1 : 0)];

                    switch (direction) {
                        case "r":
                            return point.x > last.x;
                        case "l":
                            return point.x < last.x;
                        case "t":
                            return point.y > last.y;
                        case "b":
                            return point.y < last.y;
                    }
                }

                const directionLoop: TDirection[] = ["r", "t", "l", "b"];

                while (!zeroCount.some(g => isIndirection(g.group, g.isReverse))) {
                    let index = directionLoop.indexOf(direction);
                    index++;

                    if (index >= directionLoop.length) {
                        index = 0;
                    }

                    direction = directionLoop[index];
                }

                let closest = Infinity;
                zeroCount.filter(g => isIndirection(g.group, g.isReverse))
                    .forEach(g => {
                        const point = g.group.data[(!g.isReverse ? g.group.data.length - 1 : 0)];

                        const distance = getDistance(last, point);

                        if (distance < closest) {
                            closest = distance;
                            closestGroup = g.group;
                            isReverse = g.isReverse;
                        }
                    });
            }

            if (closestGroup) {
                if (closest == 0 && !isReverse && !startGroup) {
                    closestGroup.data[0].moveTo = false;
                } else if (closest == 0 && isReverse) {
                    closestGroup.data[0].moveTo = false;
                    const index = groups.indexOf(closestGroup as any);
                    closestGroup.data = closestGroup.data.reverse();
                    if (startGroup) {
                        closestGroup.data[0].moveTo = true;
                    }
                    groups.splice(index, 1, closestGroup);
                }
            }

            if (!startGroup) {
                pointsSorted.push(...now.data);
            }

            lastDirection = direction;
            if (!closestGroup && stack === 0) {
                SvgLoader.LastPoint = last;
            }
        }

        if (!SvgLoader.LastPoint && !lastPoint) {
            closestGroup = groups[0];
        } else {
            closestGroup = {
                data: [lastPoint || SvgLoader.LastPoint],
                Index: -1,
            };
        }

        let startGroup = true;
        while (closestGroup) {
            addGroup(groups, closestGroup, startGroup, lastDirection);
            startGroup = false;
        }

        if (stack !== false && stack < 2) {
            const newGroups = this.getPointGroups(pointsSorted);
            for (let group of newGroups) {
                const last = group.data[group.data.length - 1];
                let zeroCount = 0;
                for (let g of newGroups) {
                    if (g == group) {
                        continue;
                    }

                    const distance = getDistance(g.data[0], last);
                    const reverseDistance = getDistance(g.data[g.data.length - 1], last);

                    if (distance == 0 || reverseDistance == 0) {
                        zeroCount++;
                    }
                }

                if (zeroCount == 1) {
                    if (this.LastPoint && stack == 0) {
                        return this.SortPointsByGroup(this.SortPointsByGroup(pointsSorted, group.data[0], stack + 1), this.LastPoint, false);
                    } else {
                        return this.SortPointsByGroup(pointsSorted, group.data[0], stack + 1);
                    }
                }
            }
        }

        return pointsSorted;
    }

    private static removeDuplicatePoints(pathString: string) {
        function compareCords(a: Point, b: Point) {
            return a.x === b.x && a.y === b.y;
        }

        function compareLines(a: Point[], b: Point[]): boolean {
            return (compareCords(a[0], b[0]) && compareCords(a[1], b[1]))
                || (compareCords(a[1], b[0]) && compareCords(a[0], b[1]))
        }

        const points: (Point & { moveTo: boolean })[] = toPoints({
            type: "path",
            d: pathString
        }) as any;

        const lines: GroupPoint[][] = [];
        let lastPoint: GroupPoint;
        const toRemove: GroupPoint[] = [];
        points.forEach(p => {
            if (!lastPoint || p.moveTo) {
                if (lastPoint?.moveTo) {
                    toRemove.push(lastPoint);
                }

                lastPoint = p;
            } else if (compareCords(lastPoint, p)) {
                toRemove.push(p);
            } else {
                const newCords = [lastPoint, p];
                const found = lines.find(v => compareLines(v, newCords));

                if (found) {
                    if (lastPoint.moveTo) {
                        toRemove.push(lastPoint);
                    }

                    p.moveTo = true;
                } else {
                    lines.push(newCords);
                }
                lastPoint = p;
            }
        })


        return toPath(this.SortPointsByGroup(points.filter(p => !toRemove.includes(p))) as any[]);
    }
}