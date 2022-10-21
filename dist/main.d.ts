import type { Compiler } from 'webpack';
interface CountType {
    [key: string]: number;
}
interface Options {
    path: string | string[] | Record<string, string[]>;
    isExportExcel?: boolean;
    outputDir?: string;
    percentageByMime: string[];
}
export declare class CountComponentsWebpackPlugin {
    options: Options;
    projectFiles: string[];
    trait: Record<string, {
        components: CountType;
        percentage: Record<string, string>;
        total: number;
    }>;
    constructor(options: Options);
    maintainKind(branch: string, identifierName: string): void;
    toExcel(): void;
    toLog(): void;
    apply(compiler: Compiler): void;
}
export {};
