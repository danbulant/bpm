const fs = require("fs");
const path = require("path");
const request = require("./requests");
const Console = require("./console");
const config = require("./config")();
const console = new Console;
const REPO = config.repository;
const Parser = require("./parser");
var parser = new Parser;

module.exports = class Package {
    pkg = {};

    get(pkg){
        return new Promise((res, rej) => {
            if(!pkg){
                if(!fs.existsSync("./package.json"))return rej("There's no package.json in this directory.");
                var js = parser.load("./package.json");
                if(!js.name)return rej("Package.json doesn't contain name property, which is required for this command to work");
                pkg = parser.getName();
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

    ping(){
        return new Promise((res, rej) => {
            console.log(console.colors.FgMagenta + "HTTP PING" + console.colors.Reset + " " + REPO);
            const t = process.hrtime();
            const NS_PER_SEC = 1e9;
            request(REPO).catch().then(()=>{
                var diff = process.hrtime(t);
                var time = (diff[0] * NS_PER_SEC + diff[1]) / NS_PER_SEC * 1000;
                console.log(console.colors.FgMagenta + "HTTP PONG" + console.colors.Reset + " " + time + "ms");
                res();
            })
        })
    }

    init(){
        if(fs.existsSync(process.cwd() + "/package.json")){
            return console.error("Package.json already exists, cannot continue");
        }
        console.log("Creating default package.json");

        var pkg = {
            name: process.cwd().split(path.sep).pop(),
            version: "1.0.0",
            description: "",
            main: "index.js",
            scripts: {
                start: "node index.js",
                test: "echo \"No test specified!\""
            },
            keywords: [],
            author: "",
            license: "ISC"
        }
        var data = JSON.stringify(pkg, null, 2);
        fs.writeFileSync(process.cwd() + "/package.json", data);
        console.log("Done");
    }

    async install(flags, packages){
        parser.load();
        await parser.addDependencies(packages);
        parser.install((flags.dev | false));
        parser.saveChanges();
    }

    run(args){
        
    }
}