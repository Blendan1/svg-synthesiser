import * as child_process from "child_process";
import path from "path";

export class BlenderLoader {
    static Run(file: string, objName: string = "Cube", svgOut: string = "./vector-uvs") {
        const scriptPath = path.join(__dirname, "../../addon/to_vector_uv.py")

        const buffer = child_process.execSync(`blender --background "${file}" --python "${scriptPath}" -- "${svgOut.replace(/^\.\//, "//")}" ${objName}`);

        console.log(buffer.toString());
    }
}