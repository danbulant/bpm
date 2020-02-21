const Console = require("./console");
const fs = require("fs");
const request = require("./requests");
const semver = require("semver");
const path = require("path");
const http = require("http");
const https = require("https");
const targz = require('targz');
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

        this.path = path;
        this.pkg = json;

        this.verify();

        return json;
    }

    async addDependencies(deps){
        if(!deps)return;

        for(var i = 0; i < deps.length; i++){
            var depi = deps[i].split(/[a-z]@/gi);
            var dep = depi[0];
            var version = depi[1] || null;

            try {
                var pkg = JSON.parse(await request(global.config.repository + dep));
            } catch(e){
                console.error("An error occured during parsing information");
            }

            if(pkg.error)throw Error(pkg.error);

            if (!pkg["dist-tags"]) {
                console.warn("Couldn't install " + deps[i] + " - no published version");
                continue;
            }
            if (!pkg["dist-tags"].latest) {
                console.warn("Couldn't install " + deps[i] + " - no published version");
                continue;
            }

            if(!this.pkg.dependencies)this.pkg.dependencies = {};

            if(!version){
                this.pkg.dependencies[dep] = "^" + pkg["dist-tags"].latest;
            } else {
                this.pkg.dependencies[dep] = version;
            }
        }
    }

    saveChanges(){
        return fs.writeFileSync(this.path, JSON.stringify(this.pkg, null, 2) + "\n");
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

    async install(dev = false) {
        var deps = {};

        Object.assign(deps, this.getDependencies());
        if (dev) {
            Object.assign(deps, this.getDependencies(true));//merge devDependencies & dependencies
        }

        var dependencies = [];

        for (var peer in this.getPeerDependencies()) {
            console.warn("Peer dependency found. Install peer dependencies yourself: " + peer);
        }


        for (var dep in deps) {
            dependencies.push({
                name: dep,
                version: deps[dep],
                type: "required"
            })
        }

        var optional = this.getOptionalDependencies();

        if (global.flags["no-optional"]) optional = {};

        for (var dep in optional) {
            dependencies.push({
                name: dep,
                version: optional[dep],
                type: "optional"
            });
        }

        dependencies.forEach((dep) => {
            this.installDependency(dep.name, dep.version);
        })
    }
    
    sanitizeName(pkg, version){
        var targetPath = '.' + path.posix.normalize('/' + pkg)
        return path.posix.resolve(config.packages + "/../packages/", targetPath + "/" + version)
    }

    installDependency(pkg, version) {
        return new Promise(async(res, rej)=>{

            console.time("installation time of " + pkg);
            
            var lock = {};
            lock.version = 1;
            
            lock.packages = {};


            var deps = await this.getRequiredPackages(pkg, version);
            var pk = deps.pkg;

            if (fs.existsSync(this.sanitizeName(pk.name, deps.version))) {
                console.log("Already installed in " + this.sanitizeName(pk.name, deps.version));

                if (!fs.existsSync(process.cwd() + "/node_modules")) {
                    fs.mkdirSync(process.cwd() + "/node_modules");
                }

                if (!fs.existsSync(process.cwd() + "/node_modules/" + pk.name)) {
                    if (path.dirname(process.cwd() + "/node_modules/" + pk.name) != process.cwd() + "/node_modules/") {
                        if (!fs.existsSync(path.dirname(process.cwd() + "/node_modules/" + pk.name)))
                            fs.mkdirSync(path.dirname(process.cwd() + "/node_modules/" + pk.name));
                    }

                    //console.log("Creating symlink");
                    fs.symlinkSync(path.relative(process.cwd() + "/node_modules/" + pk.name, this.sanitizeName(pk.name, deps.version)), process.cwd() + "/node_modules/" + pk.name);
                }

                if(!global.flags.f && !global.flags["force-install"]){
                    console.timeEnd("installation time of " + pkg);
                    return res();
                }
            }
            
            var d = deps.deps;
            if(d){
                for(var v in d){
                    await this.installDependency(v, d[v]);
                }
            }
            
            if (!fs.existsSync(this.sanitizeName(pk.name, deps.version))) {
                //download
                console.log("Downloading " + pk.name + " from " + pk.dist.tarball + " to " + __dirname + "/../tars/" + path.basename(pk.dist.tarball));
                await this.download(pk.dist.tarball, __dirname + "/../tars/" + path.basename(pk.dist.tarball));

                targz.decompress({
                    src: __dirname + "/../tars/" + path.basename(pk.dist.tarball),
                    dest: this.sanitizeName(pk.name, deps.version)
                }, (e) => {
                    if(e)throw e;
                    
                    console.timeEnd("installation time of " + pkg);
                    res();
                })
            } else {
                console.timeEnd("installation time of " + pkg);
                res();
            }
        })
    }
    download(from, to){
        return new Promise((res, rej)=>{
            
            if(fs.existsSync(to)){
                return res();
            }

            if (from.startsWith("http://")) {
                var handler = http;
            } else if (from.startsWith("https://")) {
                var handler = https;
            } else {
                throw Error("Unsupported protocol");
            }
            const file = fs.createWriteStream(to);

            handler.get(from, (response) => {
                if (response.statusCode != 200) {
                    throw Error("Got status code " + response.statusCode);
                }

                response.pipe(file);

                response.on('end', ()=>{
                    file.close();
                    if(!response.complete) throw Error("Couldn't download whole file");
                    res();
                })
            });
        });
    }
    getRequiredPackages(pkg, version){
        return new Promise((res, rej)=>{
            request(global.config.repository + pkg).then((o) => {
                var p = JSON.parse(o);
                if(p.error)return rej("Requested package couldn't be found.");

                var versions = [];

                for(var v in p.versions){
                    versions.push(v);
                }

                versions = versions.filter((val) => {
                    return semver.satisfies(val, version);
                });

                var ver = versions[versions.length - 1];
                if(!ver){
                    throw Error("Cannot install - no supported version for package " + pkg + " that satisfies `" + version + "`");
                }

                res({
                    deps: p.versions[ver].dependencies,
                    version: ver,
                    pkg: p.versions[ver]
                });
            }).catch(rej);
        })
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