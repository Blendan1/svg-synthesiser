import {SvgLoader} from "./SvgLoader";
import {WaveFile} from "wavefile";
import {Point} from "svg-path-properties/dist/types/types";
import ProgressBar from "progress";

export class WavMaker {
    constructor(private svgList: SvgLoader[]) {
    }

    private calculateSample(cord: number, time: number, divider: number) {
        if (time == 0) {
            return 0;
        }

        const value = ((cord / divider) - 1) * divider;
        return (((Math.pow(2, 16) - 1)) * Math.sin( (Math.PI * 2) * value / 41000)) * 5
        //return (Math.asin(value) + Math.asin(value));
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

    public make({fps = 24, sampleRate = 41000}: {
        fps?: number,
        sampleRate?: number,
    }) {
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

        const progress = new ProgressBar(":bar :percent :eta s", {total: this.svgList.length});

        this.svgList.forEach((svg) => {
            let frameTime = time % timePerFrame;
            const frame = svg.loadSvg();
            while (frameTime < timePerFrame) {
                const percent = frameTime / timePerFrame;
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

            progress.tick();
        });

        const dividerX = this.normalizeScale(biggestX);
        const dividerY = this.normalizeScale(biggestY);

        points.forEach(({time, point}) => {
            samples.l.push(this.calculateSample(point.x, time, dividerX));
            samples.r.push(-this.calculateSample(point.y, time, dividerY));
        });

        wav.fromScratch(2, sampleRate, "16", this.normalizeSamples([
            samples.l,
            samples.r,
        ], sampleRate / 2));

        return wav.toBuffer();
    }

    private normalizeSamples(samples: number[][], max = 10000): number[][] {
        let maxSample = 0;
        const out: number[][] = []

        samples.forEach(p => p.forEach(s => {
            if (Math.abs(s) > maxSample) {
                maxSample = Math.abs(s);
            }
        }));

        samples.forEach(p => {
            out.push([]);
            p.forEach(s => {
                const percent = s / maxSample;
                out[out.length - 1].push(percent * max);
            });
        });

        console.log(maxSample)

        return samples;
    }

}