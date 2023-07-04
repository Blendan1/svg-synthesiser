import * as fs from "fs";

export class ConfigLoader<T extends LoadableConfig> {
    constructor(private getDefaultPath: () => string, private options: T, private toSkip: string[] = []) {
    }

    load(): T {
        if (this.options.read) {
            let path = this.getDefaultPath();

            if (this.options.read !== true) {
                path = this.options.read;
            }

            try {
                const file = fs.readFileSync(path, {encoding: "utf8"});
                const options = JSON.parse(file) as T;

                for (let key of this.toSkip) {
                    (options as any)[key] = (this.options as any)[key];
                }

                return options;
            } catch {
                throw new Error("Error parsing config json at: " + path);
            }
        }

        return this.options;
    }

    write(): boolean {
        if (this.options.write) {
            const out: any = {};

            const skip = ["read", "write", ...this.toSkip];

            for (let key in this.options) {
                if (!skip.includes(key)) {
                    out[key] = (this.options as any)[key];
                }
            }

            let path = this.getDefaultPath();

            if (this.options.write !== true) {
                path = this.options.write;
            }

            fs.writeFileSync(path, JSON.stringify(out, null, 3));

            return true;
        }

        return false;
    }
}

export interface LoadableConfig {
    read: boolean | string;
    write: boolean | string;
}