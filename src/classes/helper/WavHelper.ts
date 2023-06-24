import {WavMakerOptions} from "../../interfaces/WavMakerOptions";
import {Point} from "svg-path-properties/dist/types/types";

export class WavMakerHelper {
    public constructor(private options: WavMakerOptions) {
    }

    public calculateSample(cord: number, time: number, divider: number) {
        if (time == 0) {
            return 0;
        }

        return this.frequencyToSample(((cord / divider) - 1) * divider);
    }


    public frequencyToSample(value: number) {
        return (((Math.pow(2, 16) - 1)) * Math.sin((Math.PI * 2) * value / this.options.sampleRate!)) * 10
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