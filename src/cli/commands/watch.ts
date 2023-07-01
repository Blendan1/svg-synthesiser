import {CliCommand} from "../../interfaces/cli/CliCommand";
import {BlenderLoader, SvgLoader, WavMaker} from "../../classes";
import * as fs from "fs";

const filewatcher = require('filewatcher');

export const Watch: CliCommand = {
    Call(file: string, options: WatchOptions) {
        let isRunning = false;
        console.log(options)
        function Run() {
            isRunning = true;

            //TODO read fps from blend file
            BlenderLoader.Run(file, options.selection, options.temp);
            new WavMaker(SvgLoader.RegisterFolder(options.temp))
                .make({
                    multiplier: parseFloat(options.multiplier),
                    outPath: options.out
                });


            if(options.cleanup) {
                fs.rmSync(options.temp, {recursive: true});
            }

            isRunning = false;
        }

        const watcher = filewatcher();
        watcher.add(file);
        watcher.on('change', function (file: string, stat: any) {
            if (stat && !isRunning) {
                Run();
            }
        });
        Run();
    },

    Name: "watch",

    Arguments: [
        {type: "<file path>", description: "path to the .blend file to watch"},
    ],
    Options: [
        {
            type: "-s, --selection <object id>",
            description: "the blender object to convert to vector uvs",
            default: "Cube"
        },
        {
            type: "-t, --temp <path>",
            description: "Path to folder of temp svg files",
            default: "./vector-uvs"
        },

        {
            type: "-o, --out <path>",
            description: "Out path for wav file",
            default: "./out.wav"
        },

        {
            type: "--fps <number>",
            description: "Frames per second (Default is value from blend file)",
        },
        {
            type: "-m, --multiplier <number>",
            description: "Value used to multiple frameSpeed and sampleRate, will reduce flickering if higher",
            default: "1"
        }

        ,
        {
            type: "-c, --cleanup",
            description: "use flag to remove temp files after wav build",
        }

    ],
}

interface WatchOptions {
    selection: string;
    temp: string;
    out: string;
    fps?: string;
    multiplier: string;
    cleanup: boolean;
}