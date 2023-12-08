
export function uuidv4(): string

export async function DownloadContent(url: string, header?:{[K: string]: string}): Promise<Buffer>;
export async function SafeDownloadContent(url: string, header?:{[K: string]: string}): Promise<{ data?: Buffer, error?:any }>;
export function margeColors(color1: number, color2: number, alpha: number): number;
export function getLine(text: string, length: number): [number, number];