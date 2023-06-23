import {Properties} from "svg-path-properties/src/types";
import {svgPathProperties} from "svg-path-properties";
export class Svg {
    private readonly properties: Properties;
    constructor(public svgPath: string) {
        this.properties = new svgPathProperties(svgPath) as Properties;
    }

    public getPointAtPercent(percent: number) {
        let properties = this.properties;

        const length = properties.getTotalLength();
        return properties.getPointAtLength(percent == 0 ? 0 : length * percent);
    }

}