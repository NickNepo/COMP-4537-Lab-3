const http = require('http');
const url = require('url');
const utils = require('./modules/utils');
const strings = require('./lang/en/en.json');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;
class HttpServer{

    static start() {
        const server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;

            // Routing logic delegates to specific methods
            if (pathname.includes('/getDate/')) {
                this.handlePartB(req, res, parsedUrl);
            } else if (pathname.includes('/writeFile/') || pathname.includes('/readFile/')) {
                this.handlePartC(req, res, parsedUrl);
            } else {
                this.send404(res);
            }
        });

        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
    
    static handlePartB(req, res, parsedUrl) {
        const name = parsedUrl.query.name || "Guest";
        const currentTime = utils.getDate();
        const message = strings.greeting.replace("%1", name);
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<p style="color: blue;">${message} ${currentTime}</p>`);
    }

    static handlePartC(req, res, parsedUrl) {
        const pathname = parsedUrl.pathname;

        if (pathname.includes('/writeFile/')) {
            const text = parsedUrl.query.text;
            fs.appendFile('file.txt', text + '\n', (err) => {
                if (err) return this.sendError(res, "Write Error");
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(`Appended: ${text}`);
            });
        }else if (pathname.includes('/readFile/')) {
        const fileName = path.basename(pathname);

        // Security check: only allow reading of file.txt as per lab
        if (fileName === "file.txt") {
            fs.readFile(fileName, 'utf8', (err, data) => {
                if (err) return this.send404(res, `Error 404: File "${fileName}" not found.`);
                
                res.writeHead(200, { 'Content-Type': 'text/html' });
                // Wrapping in <pre> preserves the newlines from your file
                res.end(`<pre>${data}</pre>`); 
            }) 
        }else {
            this.send404(res);
        }
    }
    };
}

HttpServer.start();