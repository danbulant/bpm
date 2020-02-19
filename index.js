const args = require("./modules/args");
const Package = require("./modules/package");
const Console = require("./modules/console");
var console = new Console;
var pkg = new Package;
const VERSION = "0.1"

global.args = args;

process.on('uncaughtException', function (err) {
    console.error("Uncaught exception:", err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', function (reason, p) {
    console.warn("Possibly Unhandled Rejection, reason:", reason);
});

if(!args.contents[0]){
    return console.output(`BPM v${VERSION}\nMade by Daniel Bulant`);
}

switch(args.contents[0]){
    case "get":
    case "info":
    case "view":
        pkg.get(args.contents[1]).catch(console.error);
        break;
    case "bin":
        console.log(__dirname);
        break;
    case "ping":
        pkg.ping();
        break;
    case "init":
        pkg.init();
        break;
    case "i":
    case "install":
    case "peerInstall":
    case "ls":
    case "help":
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