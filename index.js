const args = require("./modules/args");
const Package = require("./modules/package");
const Console = require("./modules/console");
var console = new Console;
var pkg = new Package;
const VERSION = "0.1"

if(!args.contents[0]){
    return console.output(`BPM v${VERSION}\nMade by Daniel Bulant`);
}

switch(args.contents[0]){
    case "i":
    case "install":
        console.warn("To be done");
        break;
    case "get":
    case "info":
        pkg.get(args.contents[1]).then(console.log);
        break;
    case "bin":
        console.log(__dirname);
        break;
    case "ls":
    case "help":
    case "ping":
    case "adduser":
    case "audit":
    case "bugs":
    case "build":
    case "cache":
    case "ci":
    case "completion":
    case "config":
    case "deprecate":
    case "dist-tag":
    case "docs":
    case "doctor":
    case "edit":
    case "explore":
    case "help-search":
    case "hook":
    case "init":
    case "install-ci-test":
    case "install-test":
    case "link":
    case "org":
    case "outdated":
    case "owner":
    case "prefix":
    case "profile":
    case "prune":
    case "publish":
    case "rebuild":
    case "repo":
    case "restart":
    case "root":
    case "run":
    case "run-script":
    case "search":
    case "shrinkwrap":
    case "star":
    case "stars":
    case "start":
    case "stop":
    case "team":
    case "test":
    case "uninstall":
    case "remove":
    case "unpublish":
    case "update":
    case "version":
    case "view":
    case "whoami":
        console.log("To be done");
        break;
    case "dedupe":
        console.log("This isn't needed when using BPM");
        break;

    default:
        console.error("The command specified doesn't exists.");
}