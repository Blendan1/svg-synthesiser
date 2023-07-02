import {CliCommand} from "../../interfaces/cli/CliCommand";
import {BlenderLoader, SvgLoader, WavMaker} from "../../classes";
import * as fs from "fs";
import {ConfigLoader, LoadableConfig} from "./helper/ConfigLoader";

const filewatcher = require('filewatcher');

export const Blender: CliCommand = {
    Call(file: string, options: WatchOptions) {
        let isRunning = false;

        const configLoader = new ConfigLoader(() => {
            return file + ".json";
        }, options, ["watch"]);

        if (configLoader.write()) {
            process.exit();
        }

        options = configLoader.load();
        async function Run() {
            isRunning = true;

            const blendOptions = BlenderLoader.Run(file, options.selection, options.temp);
            await new WavMaker(SvgLoader.RegisterFolder(options.temp))
                .make({
                    multiplier: parseFloat(options.multiplier),
                    threads: parseInt(options.threads),
                    outPath: options.out,
                    fps: options.fps ? parseInt(options.fps) : blendOptions.fps,
                });
            console.log(`[WavMaker] ${options.out} created`);


            if (options.cleanup) {
                fs.rmSync(options.temp, {recursive: true});
                console.log(`[INFO] ${options.temp} deleted`);
            }


            isRunning = false;
        }

        if (options.watch) {
            console.log("[FileWatcher] Started")
            const watcher = filewatcher();
            watcher.add(file);
            watcher.on('change', function (file: string, stat: any) {
                if (stat && !isRunning) {
                    console.log("[FileWatcher] Changes Found")
                    Run();
                }
            });
        }
        Run();
    },

    Name: "blender",

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
        },
        {
            type: "--threads <number>",
            description: "use multiple threads for better performance",
            default: "1"
        },


        {
            type: "-c, --cleanup",
            description: "use flag to remove temp files after wav build",
        },

        {
            type: "--watch",
            description: "watches for file changes and reruns on changes"
        },

        {
            type: "-r, --read [path]",
            description: "read a config file and use that as options (default: path to .blend file + .json => ./test.blend => ./test.blend.json)"
        },
        {
            type: "-w, --write [path]",
            description: "writes a config file to be used as options, will stop after writing file (default: path to .blend file + .json => ./test.blend => ./test.blend.json)"
        }

    ],
}

interface WatchOptions extends LoadableConfig {
    selection: string;
    temp: string;
    out: string;
    fps?: string;
    multiplier: string;
    cleanup: boolean;
    watch: boolean;
    threads: string;
}