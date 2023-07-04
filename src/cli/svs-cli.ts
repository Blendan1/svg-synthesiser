#! /usr/bin/env node

import {program} from 'commander';
import {Blender} from "./commands/blender";
import {Folder} from "./commands/folder";

const commands = [
    Blender,
    Folder
];

program.name("svs-cli");


for (let command of commands) {
    const cmd = program.command(command.Name);

    for (let argument of command.Arguments) {
        cmd.argument(argument.type, argument.description);
    }

    for (let option of command.Options) {
        cmd.option(option.type, option.description, option.default);
    }

    cmd.action(command.Call as any);
}

program.parse();
