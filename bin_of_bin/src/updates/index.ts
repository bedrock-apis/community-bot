//import npmRun from "./npm_packages";
import bdsRun from "./bds_releases";

//export const npmTask = npmRun;
export const bdsTask = bdsRun;
export type TaskModule<args extends any[] = []> = (callBack: (...param: args)=>(Promise<void> | void),interval?: number)=>(ReturnType<typeof setInterval>);