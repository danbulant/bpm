const Console = require("./console");
const config = require("./config")();
var console = new Console;

module.exports = class PackageParser {
    load(path){
        if(!path) path = process.cwd() + "/package.json";

        if (!fs.existsSync(path)) throw Error("Package.json doesn't exists!");

        try {
            var json = JSON.parse(fs.readFileSync(path));
        } catch (e) {
            throw Error("Invalid JSON file");
        }

        this.pkg = json;

        this.verify();

        return json;
    }

    verify(){
        var pkg = this.pkg;
        
        if(global.args.flags.supressChecking || global.args.flags.sch)return;
        
        if(!pkg.name)console.warn("No name present in package.json");
        if(!pkg.description)console.warn("No description present in package.json")
        if(!pkg.repository)console.warn("Repository not specified")
        if(!pkg.license)console.warn("License not selected")
        if(!pkg.author)console.warn("Author not set")
        if(!pkg.version)console.warn("Version not set. Some commands may not work.")
        if(!pkg.keywords)console.warn("Add keywords to your package.json");
    }

    install(dev = false){
        var deps = {};
        
        Object.assign(deps, this.getDependencies());
        if(dev){
            Object.assign(deps, this.getDependencies(true));
        }

        for(var peer in this.getPeerDependencies()){
            console.warn("Peer dependency found. Install peer dependencies yourself: " + peer);
        }


    }
    
    getName(){
        if(this.pkg.name)return this.pkg.name;
        throw Error("Name isn't specified in the package.json");
    }

    getDescription() {
        if (this.pkg.description) return this.pkg.description;
        throw Error("Description isn't specified in the package.json");
    }

    getDependencies(dev = false){
        if(dev){
            var deps = this.pkg.devDependencies;
        } else {
            var deps = this.pkg.dependencies;
        }
        if(!deps) return {};

        return deps;
    }

    getPeerDependencies(){
        if (this.pkg.peerDependencies) return this.pkg.peerDependencies;
        return {};
    }

    getOptionalDependencies(){
        if (this.pkg.optionalDependencies) return this.pkg.optionalDependencies;
        return {};
    }
}