import * as path from "path";
import * as fs from "fs";
import {SvgLoader} from "./src/classes/SvgLoader";
import {WavMaker} from "./src/classes/WavMaker";

const inputFolder = "./vector-uvs"

const folder = fs.readdirSync(inputFolder);

const svgList: SvgLoader[] = []
for (const file of folder) {
    if (/\.svg$/.test(file)) {
        svgList.push(new SvgLoader(path.join(inputFolder, file)));
    }
}
fs.writeFileSync("out.svg", svgList[100].toSvgFile())

if (svgList.length > 0) {
    const wavMaker = new WavMaker(svgList);

    fs.writeFileSync("out.wav", wavMaker.make());
}

