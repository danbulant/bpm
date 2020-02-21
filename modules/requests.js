const http = require("http");
const https = require("https");
/**
 * @param {String} path
 */
module.exports = (path, options = { method: "GET" }) => {
    return new Promise((res, rej) => {
        if(path.startsWith("http://")){
            var handler = http;
        } else if(path.startsWith("https://")){
            var handler = https;
        } else {
            return rej(Error("Unsupported protocol"));
        }

        handler.get(path, options, (resp) => {
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