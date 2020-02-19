const fs = require("fs");
const request = require("./requests");
const Console = require("./console");
const console = new Console;
const REPO = "https://registry.npmjs.org/";

module.exports = class Package {
    pkg = {};

    load(path){
        if(!fs.existsSync(path))throw Error("Path doesn't exists!");

        try {
            var json = JSON.parse(fs.readFileSync(path));
        } catch(e){
            throw Error("Invalid JSON file");
        }

        this.pkg = json;

        return json;
    }

    get(pkg){
        return new Promise((res, rej) => {
            if(!pkg)return rej("No package name given");

            request(REPO + pkg + "/").then((r) => {
                var o = JSON.parse(r);
                if(o.error == "Not found"){
                    console.log("The package providen couldn't be found on the NPM repository");
                    return rej(404);
                }
                
                console.log(o.name);
                console.log(console.colors.Dim + o.description + console.colors.Reset);
                res();
            }).catch(e => {
                console.warn(e);
                rej(e);
            })
        });
    }
}