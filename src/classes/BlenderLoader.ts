import * as child_process from "child_process";
import path from "path";

export class BlenderLoader {
    static Run(file: string, objName: string = "Cube", svgOut: string = "./vector-uvs") {
        const scriptPath = path.join(__dirname, "../../addon/to_vector_uv.py")

        const buffer = child_process.execSync(`blender --background "${file}" --python "${scriptPath}" -- "${svgOut.replace(/^\.\//, "//")}" ${objName}`);
        const output = buffer.toString();
        const matchFrames = output.match(/Frames:\s(?<fStart>\d+);\s(?<fEnd>\d+)/);
        const matchFps = output.match(/Fps:\s(?<fps>\d+\.?\d*)/);

        if(/RESULT GOOD/gm.test(output) &&
            matchFps?.groups?.["fps"] && matchFrames?.groups) {
            return {
                fps: parseFloat(matchFps?.groups?.["fps"]),
                start: parseInt(matchFps?.groups?.["fStart"]),
                end: parseInt(matchFps?.groups?.["fEnd"]),
            }
        }

        throw new Error("Error Running python script: \n" + output);
    }
}