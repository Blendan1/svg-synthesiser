import {SvgLoader} from "./SvgLoader";
import {WaveFile} from "wavefile";
import {Point} from "svg-path-properties/dist/types/types";
import * as fs from "fs";

export class WavMaker {
    constructor(private svgList: SvgLoader[]) {
    }

    private calculateSample(cord: number, time: number, divider: number) {
        if (time == 0) {
            return 0;
        }

        const value = (cord / divider) - 1;
        // f * time
        const result = (Math.asin(value) / 2 * Math.PI);
        const sample = result * (divider * 10)
        return parseFloat(sample.toFixed(8));
    }

    /**
     * Normalizes a scale to values from 0 to 2
     * @param max
     * @private
     */
    private normalizeScale(max: number) {
        let value = max, divider = 0;
        while (value > 2) {
            divider++;
            value = max / divider;
        }

        return divider
    }

    public make(sampleRate = 41000, fps = 24) {
        const wav = new WaveFile();

        const samples: { l: number[], r: number[] } = {
            l: [],
            r: []
        };

        const timePerFrame = 1 / fps;
        const timePerSample = 1 / sampleRate;

        let time = 0;

        const points: { time: number, point: Point }[] = [];
        let biggestX = 0, biggestY = 0;

        this.svgList.forEach((svg, i) => {
            let frameTime = 0;
            while (frameTime < timePerFrame) {
                const percent = frameTime / timePerFrame;
                const point = svg.getPointAtPercent(percent);

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
        });

        const dividerX = this.normalizeScale(biggestX);
        const dividerY = this.normalizeScale(biggestY);


        points.forEach(({time, point}) => {
            samples.l.push(this.calculateSample(point.x, time, dividerX));
            samples.r.push(-this.calculateSample(point.y, time, dividerY));
        });

        console.log(samples.l[12]);
        wav.fromScratch(2, sampleRate, "16", [
            samples.l,
            samples.r,
        ]);

        return wav.toBuffer();
    }

}