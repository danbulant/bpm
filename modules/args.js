var args = process.argv;

if(args[2] == "--bat"){
    args.splice(0, 3);
}

var con = [];

args.forEach((a, i) => {
    if(a.startsWith("--")){
        return con[i] = {
            type: "flag",
            variant: "long",
            content: a.substr(2)
        };
    }
    if(a.startsWith("-")){
        return con[i] = {
            type: "flag",
            variant: "short",
            content: a.substr(1)
        };
    }
    return con[i] = {
        type: "content",
        content: a
    }
});

var flags = {};
var contents = [];
var skipNext = false;

con.forEach((a, i) => {
    if(skipNext)return skipNext = false;

    if(a.type == "flag"){
        var next = con[i + 1];
        if(next){
            if(next.type == "content"){
                skipNext = true;
                return flags[a.content] = next.content;
            }
        }
        return flags[a.content] = true;
    }
    contents.push(a.content);
});

module.exports = {
    args: con,
    flags,
    contents
};