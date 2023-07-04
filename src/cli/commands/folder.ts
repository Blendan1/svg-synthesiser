import {CliCommand} from "../../interfaces/cli/CliCommand";
import {BlenderLoader, SvgLoader, WavMaker} from "../../classes";
import * as fs from "fs";
import {ConfigLoader, LoadableConfig} from "./helper/ConfigLoader";
import path from "path";

const filewatcher = require('filewatcher');

export const Folder: CliCommand = {
    Call(folder: string, options: FolderOptions) {
        let isRunning = false;

        const configLoader = new ConfigLoader(() => {
            return path.join(folder, "svs.config.json");
        }, options, ["watch"]);

        if (configLoader.write()) {
            process.exit();
        }

        options = configLoader.load();

        async function Run() {
            isRunning = true;

            await new WavMaker(SvgLoader.RegisterFolder(folder))
                .make({
                    multiplier: parseFloat(options.multiplier),
                    threads: parseInt(options.threads),
                    outPath: options.out,
                    fps: parseInt(options.fps!),
                });
            console.log(`[WavMaker] ${options.out} created`);

            isRunning = false;
        }

        if (options.watch) {
            console.log("[FileWatcher] Started")
            const watcher = filewatcher();
            watcher.add(folder);
            watcher.on('change', function (file: string, stat: any) {
                console.log("[FileWatcher] Changes Found")
                Run();
            });
        }
        Run();
    },

    Name: "folder",

    Arguments: [
        {type: "<file path>", description: "path to the folder"},
    ],
    Options: [
        {
            type: "-o, --out <path>",
            description: "Out path for wav file",
            default: "./out.wav"
        },

        {
            type: "--fps <number>",
            description: "Frames per second",
            default: "24"
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
            type: "--watch",
            description: "watches for file changes and reruns on changes"
        },

        {
            type: "-r, --read [path]",
            description: "read a config file and use that as options (default: path + /svs.config.json)"
        },
        {
            type: "-w, --write [path]",
            description: "writes a config file to be used as options, will stop after writing file (default: path + /svs.config.json)"
        }

    ],
}

interface FolderOptions extends LoadableConfig {
    out: string;
    fps?: string;
    multiplier: string;
    watch: boolean;
    threads: string;
}