export interface CliCommand {
    Name: string;
    Call: Function;
    Description?: string;
    Arguments: ArgObj[];
    Options: OpOption[]
}

interface OpOption extends ArgObj {
    default?: string,
}

interface ArgObj {
    type: string;
    description: string;
}