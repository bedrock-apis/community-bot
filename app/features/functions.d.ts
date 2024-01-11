
export function uuidv4(): string

export async function DownloadContent(url: string, header?:{[K: string]: string | number | boolean}): Promise<Buffer>;
export async function SafeDownloadContent(url: string, header?:{[K: string]: string}): Promise<{ data?: Buffer, error?:any }>;
export async function GetGithubContent(url: string): Promise<Buffer | null>;
export function margeColors(color1: number, color2: number, alpha: number): number;
export function getLine(text: string, length: number): [number, number];
export function searchFor(text: string, possibleResults: string[]);
export function getPaths(root: string, pathLike: string): string[];