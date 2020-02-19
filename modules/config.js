const fs = require("fs");

module.exports = ()=>{
    if(!global.config)
        global.config = JSON.parse(fs.readFileSync(__dirname + "/../packages/config.json"));
    return global.config;
}