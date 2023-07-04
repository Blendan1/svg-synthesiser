# svg-synthesiser 

### Intro

Greetings, you're probably asking what ist this and why?

#### Let's start with the what:

This is a project that allows you to create a wav from SVGs, 
that, when played back with an Oscilloscope/Vectorscope (or a simulator), 
will display the inputted images.

#### Now the why: 

why not?

### Getting started

Currently, theirs no npm repository available, but im planning to add that in future

#### Requirements

- Node (tested on 18)
- Optional for direct blender integration: 

    - Blender (3.1+)
    - Blender folder added to PATH
    - Python (tested on 3.11)

#### Installation

Download the repository (from master for "stable" and develop for cutting edge), unpack it,
open the console in the folder and run:

````shell
npm i
npm i . -g
````

Now you have access to the `svs-cli` command from anywhere


If you want to use this project to build something on top of it
I recommend waiting for the npm version, otherwise just co py the folder into your project in the meantime

#### Usage

Now that everything is installed you can start creating, first you need a folder with your SVGs, lets say its here:

```
 ./svgs
    | 1.svg
    | 2.svg
    | 3.svg
    | 4.svg
    | ...
```

Then you can start the console at `./` and run the following script:

```shell
svs-cli folder ./svgs
```

this will create an `./out.wav` file that can then be played back.

for virtual playback I recommend [kritzikratzi/Oscilloscope](https://github.com/kritzikratzi/Oscilloscope/releases)

For more options and settings you can always run an command with `--help`:

```shell
svs-cli folder --help

Usage: svs-cli folder [options] <file path>

Arguments:
  file path                  path to the folder

Options:
  -o, --out <path>           Out path for wav file (default: "./out.wav")
  --fps <number>             Frames per second (default: "24")
  -m, --multiplier <number>  Value used to multiple frameSpeed and sampleRate, will reduce flickering if higher (default: "1")
  --threads <number>         use multiple threads for better performance (default: "1")
  --watch                    watches for file changes and reruns on changes
  -r, --read [path]          read a config file and use that as options (default: path + /svs.config.json)
  -w, --write [path]         writes a config file to be used as options, will stop after writing file (default: path + /svs.config.json)
  -h, --help                 display help for command
```

#### Information

- The multiplier will render the same frame multiple times to reduce flickering, a good value is like 2-5
- I recommend using threads when having larger SVGs (or many) as it will speed up render-time, how many depends on your system so just try it out


### Blender Integration

I'm planing on making a plugin so all this can be directly started in blender but until then:


To use it, we have a `./test.blend` file and run the following command:

```shell
svs-cli blender ./test.blend
```

this will create all the SVGs for the object named "Cube" (to change this use the `-s <string>` option)
and save them into an folder at `./vector-uvs` (to auto delete the folder after running use the `-c` flag)

Then it will create the `./out.wav` file

#### More options:

```shell
Usage: svs-cli blender [options] <file path>

Arguments:
  file path                    path to the .blend file

Options:
  -s, --selection <object id>  the blender object to convert to vector uvs (default: "Cube")
  -t, --temp <path>            Path to folder of temp svg files (default: "./vector-uvs")
  -o, --out <path>             Out path for wav file (default: "./out.wav")
  --fps <number>               Frames per second (Default is value from blend file)
  -m, --multiplier <number>    Value used to multiple frameSpeed and sampleRate, will reduce flickering if higher (default: "1")
  --threads <number>           use multiple threads for better performance (default: "1")
  -c, --cleanup                use flag to remove temp files after wav build
  --watch                      watches for file changes and reruns on changes
  -r, --read [path]            read a config file and use that as options (default: path to .blend file + .json => ./test.blend => ./test.blend.json)
  -w, --write [path]           writes a config file to be used as options, will stop after writing file (default: path to .blend file + .json => ./test.blend => ./test.blend.json)
  -h, --help                   display help for command

```