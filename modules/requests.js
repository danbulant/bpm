const http = require("http");
const https = require("https");
/**
 * @param {String} path
 */
module.exports = (path) => {
    return new Promise((res, rej) => {
        if(path.startsWith("http://")){
            var handler = http;
        } else if(path.startsWith("https://")){
            var handler = https;
        } else {
            rej(Error("Unsupported protocol"));
        }

        handler.get(path, (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                res(data);
            });

        }).on("error", (err) => {
            rej(err);
        });
    });
}