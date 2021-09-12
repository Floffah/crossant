export type If<T extends boolean, A, B = undefined> = T extends true
    ? A
    : T extends false
    ? B
    : A | B;

export type ValueOf<T> = T[keyof T];
