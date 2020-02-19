const fs = require("fs");
const request = require("./requests");

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

            request(REPO + pkg + "/").then((res) => {
                var o = JSON.parse(res);
                if(o.error == "Not found"){
                    console.log("The package providen couldn't be found on the NPM repository");
                    return rej(404);
                }

                res("found");
            }).catch(e => {
                console.warn(e);
                rej(e);
            })
        });
    }
}