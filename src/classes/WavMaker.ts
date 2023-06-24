import {SvgLoader} from "./SvgLoader";
import {WaveFile} from "wavefile";
import {Point} from "svg-path-properties/dist/types/types";
import ProgressBar from "progress";
import {WavMakerOptions} from "../interfaces/WavMakerOptions";
import * as fs from "fs";
import {WavMakerHelper} from "./helper/WavHelper";

export class WavMaker {

    public defaultOptions: WavMakerOptions = {fps: 24, sampleRate: 41000, frameSpeed: 1}

    constructor(private svgList: SvgLoader[]) {
    }


    public make(options: WavMakerOptions) {
        const wav = new WaveFile();

        options = {...this.defaultOptions, ...options};

        if(options.multiplier) {
            options.sampleRate = options.sampleRate! * options.multiplier;
            options.frameSpeed = options.frameSpeed! * options.multiplier;
        }


        const helper = new WavMakerHelper(options);

        const samples: { l: number[], r: number[] } = {
            l: [],
            r: []
        };

        const timePerFrame = 1 / options.fps!;
        const timePerSample = 1 / options.sampleRate!;

        let time = 0;

        const points: { time: number, point: Point }[] = [];
        let biggestX = 0, biggestY = 0;

        const progress = new ProgressBar(":bar :percent :eta s", {total: this.svgList.length});

        this.svgList.forEach((svg, i) => {
            let frameTime = time % timePerFrame;
            const frame = svg.loadSvg();

            while (frameTime < timePerFrame) {
                let percent = ((frameTime / timePerFrame) * options.frameSpeed!);

                // makes it loop and reverse 0 -> 1 -> 0 -> 1 -> ...
                percent = Math.floor(percent) % 2 ? percent % 1 : 1 - (percent % 1);

                const point = frame.getPointAtPercent(percent);

                points.push({point, time});

                if (point.x > biggestX) {
                    biggestX = point.x;
                }

                if (point.y > biggestY) {
                    biggestY = point.y;
                }

                time += timePerSample;
                frameTime += timePerSample;
            }

            svg.dispose();
            progress.tick();
        });

        const dividerX = helper.normalizeScale(biggestX);
        const dividerY = helper.normalizeScale(biggestY);

        let lastX: Point, lastY: Point;
        points.forEach(({time, point}) => {
            if (lastX && lastY && false) {
                samples.l.push(helper.frequencyToSample(helper.calculateBetweenFrequency(lastX, {
                    x: point.x,
                    y: time
                }, dividerX)));
                samples.r.push(-helper.frequencyToSample(helper.calculateBetweenFrequency(lastY, {
                    x: point.y,
                    y: time
                }, dividerY)));
            } else {
                samples.l.push(helper.calculateSample(point.x, time, dividerX));
                samples.r.push(-helper.calculateSample(point.y, time, dividerY));
            }

            lastX = {
                x: point.x,
                y: time
            };

            lastY = {
                x: point.y,
                y: time
            };
        });

        wav.fromScratch(2, options.sampleRate!, "16", [
            samples.l,
            samples.r,
        ]);
        const buffer = wav.toBuffer();
        if (options.outPath) {
            fs.writeFileSync(options.outPath, buffer);
        }

        return buffer;
    }
}
