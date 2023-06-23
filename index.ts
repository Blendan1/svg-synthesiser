import {WavMaker} from "./src/classes/WavMaker";
import {SvgLoader} from "./src/classes/SvgLoader";


new WavMaker(SvgLoader.RegisterFolder("./test/vector-uvs"))
    .make({
        fps: 24,
        sampleRate: 41000 * 2,
        frameSpeed: 5,
        outPath: "./out.wav",
    })

