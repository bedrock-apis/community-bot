const loaders: {[k: string]:(k: {[K: string]: string | boolean | number})=>Promise<false | number>} = {
    async "static-variables"(n){
        if(typeof n?.variables !== "object") false;
        return false;
    },
    async "resources"(n){
        if(typeof n?.images === "object") {
            
        };
        return false;
    },
    async "manifest-templates"(n){
        if(typeof n?.files === "object") {
            
        }
        return false;
    },
    async "script-resources"(n){
        return false;
    },
    async "fqa"(n){
        //files is array
        return false;
    }
};
async function LoadContents(repo: string, relativeURLPath: string){

}