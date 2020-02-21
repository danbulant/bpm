const got = require("got");

console.log("Trying to make request...");
got("http://google.com").then((r) => {
    console.log("Got request working!");
})