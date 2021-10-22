export interface IBuildsCache {
    [key: string]: {
        src?: string;
        lib?: string;
    };
}
