const got = require("got");
const chalk = require("chalk");

console.log("Trying to make request...");
got("http://google.com").then((r) => {
    console.log(chalk.blue("Got request working!"));
})