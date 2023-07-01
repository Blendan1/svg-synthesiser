#! /usr/bin/env node

import {program} from 'commander';
import {Watch} from "./commands/watch";

const commands = [
    Watch
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
