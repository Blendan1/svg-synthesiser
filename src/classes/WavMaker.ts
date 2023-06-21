import {SvgLoader} from "./SvgLoader";
import {WaveFile} from "wavefile";
import {Point} from "svg-path-properties/dist/types/types";
import ProgressBar from "progress";
import {WavMakerOptions} from "../interfaces/WavMakerOptions";

export class WavMaker {

    public defaultOptions: WavMakerOptions = {fps: 24, sampleRate: 41000, frameSpeed: 1}

    constructor(private svgList: SvgLoader[]) {
    }


    public make(options: WavMakerOptions) {
        const wav = new WaveFile();

        options = {...this.defaultOptions, ...options};

        const {fps = 24, sampleRate = 41000, frameSpeed = 1} = options;

        const helper = new WavMakerHelper(options);

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
                const percent = ((frameTime / timePerFrame) * frameSpeed) % 1;
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

        const dividerX = helper.normalizeScale(biggestX);
        const dividerY = helper.normalizeScale(biggestY);

        let lastX: Point, lastY: Point;
        points.forEach(({time, point}) => {
            if (lastX && lastY && false) {
                samples.l.push(helper.frequencyToSample(helper.calculateBetweenFrequency(lastX, {x: point.x, y: time}, dividerX)));
                samples.r.push(-helper.frequencyToSample(helper.calculateBetweenFrequency(lastY, {x: point.y, y: time}, dividerY)));
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

        wav.fromScratch(2, sampleRate, "16", [
            samples.l,
            samples.r,
        ]);

        return wav.toBuffer();
    }
}

class WavMakerHelper {

    public constructor(private options: WavMakerOptions) {
    }

    public calculateSample(cord: number, time: number, divider: number) {
        if (time == 0) {
            return 0;
        }

        return this.frequencyToSample(((cord / divider) - 1) * divider);
    }


    public frequencyToSample(value: number) {
        return (((Math.pow(2, 16) - 1)) * Math.sin((Math.PI * 2) * value / this.options.sampleRate!)) * 5
    }

    public calculateBetweenFrequency(a: Point, b: Point, divider: number) {
        a.x = ((a.x / divider) - 1);
        b.x = ((b.x / divider) - 1);
        const distance = Math.hypot(b.x - a.x, b.y - a.y);
        const speed = distance / (b.x - a.x);
        const period = distance / speed;
        return 1 / period;
    }

    /**
     * Normalizes a scale to values from 0 to 2
     * @param max
     * @private
     */
    public normalizeScale(max: number) {
        let value = max, divider = 0;
        while (value > 2) {
            divider++;
            value = max / divider;
        }

        return divider
    }

}