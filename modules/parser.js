const Console = require("./console");
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

        return json;
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