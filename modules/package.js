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
            if(!pkg){
                if(!fs.existsSync("./package.json"))return rej("There's no package.json in this directory.");
                var js = this.load("./package.json");
                if(!js.name)return rej("Package.json doesn't contain name property, which is required for this command to work");
                pkg = js.name;
            }

            request(REPO + pkg + "/").then((r) => {
                var o = JSON.parse(r);
                if(o.error == "Not found"){
                    return rej("The package providen couldn't be found on the NPM repository");
                }
                
                var cyan = console.colors.FgCyan;
                var magenta = console.colors.FgMagenta;
                var yellow = console.colors.FgYellow;
                var reset = console.colors.Reset;
                var red = console.colors.FgRed;

                var length = 0;
                var dependencies = [];
                for (var dependency in o.versions[o["dist-tags"].latest].dependencies){
                    dependencies[length] = cyan + dependency + reset + "@" + magenta + o.versions[o["dist-tags"].latest].dependencies[dependency] + reset;
                    length++;
                };

                console.output("\n" + cyan + o.name + reset + " | " + magenta + (o.license || reset + red + "Proprietary") + reset + " | dependencies: " + cyan + (length) +  reset);
                if(o.description) console.output(o.description);
                if(o.homepage) console.output(yellow + o.homepage + reset);
                console.output("");
                if(o["dist-tags"])if(o["dist-tags"].latest) console.output("Latest release: " + cyan + o["dist-tags"].latest + reset);
                
                console.output(yellow + "\nMaintainers:" + reset);
                o.maintainers.forEach(m => {
                    console.output(" -" + cyan + m.name + " " + magenta + m.email + reset);
                })

                console.output("");
                console.output(yellow + "Dependencies:" + reset);
                console.outputArray(dependencies);

                console.output("");
                res();
            }).catch(e => {
                console.warn(e);
                rej(e);
            })
        });
    }
}