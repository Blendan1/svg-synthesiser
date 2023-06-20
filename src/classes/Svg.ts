import {Properties} from "svg-path-properties/src/types";

export class Svg {
    constructor(private properties: Properties) {

    }

    public getPointAtPercent(percent: number) {
        const length = this.properties.getTotalLength();
        return this.properties.getPointAtLength(percent == 0 ? 0 : length * percent);
    }
}