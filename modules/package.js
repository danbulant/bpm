const fs = require("fs");

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
}