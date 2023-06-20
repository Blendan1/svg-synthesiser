export interface GroupPoint {
    x: number;
    y: number;
    moveTo?: boolean;
}

export interface GroupData {
    data: GroupPoint[],
    Index: number
}

export type TDirection = "r" | "l" | "t" | "b";