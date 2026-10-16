
const http = require("http");
const path = require("path");
const fs = require("fs");
const os = require("os");

const server = http.createServer((req, res) => {
    // Serve the homepage
    if (req.method === "GET" && req.url === "/") {
        const filepath = path.join(__dirname, "public", "index.html");

        fs.readFile(filepath, "utf8", (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end("Unable to load homepage.");
                return;
            }

            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(data);
        });

        return;
    }

    // Serve CSS and JavaScript
    if (req.method === "GET" &&
        (req.url === "/style.css" || req.url === "/app.js")) {

        const filename = req.url === "/style.css" ? "style.css" : "app.js";
        const filepath = path.join(__dirname, "public", filename);
        const contentType = filename === "style.css"
            ? "text/css"
            : "application/javascript";

        fs.readFile(filepath, "utf8", (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end("Unable to load resource.");
                return;
            }

            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        });

        return;
    }

    // Create a file
    if (req.method === "POST" && req.url === "/api/createFile") {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {
            let data;

            try {
                data = JSON.parse(body);
            } catch {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify({
                    success: false,
                    message: "Invalid JSON request."
                }));
                return;
            }

            const fileName = data.fileName;
            const fileContent = data.fileContent;

            if (
                typeof fileName !== "string" ||
                !fileName.trim() ||
                typeof fileContent !== "string" ||
                path.basename(fileName) !== fileName ||
                fileName.includes("/") ||
                fileName.includes("\\")
            ) {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify({
                    success: false,
                    message: "Invalid filename or file content."
                }));
                return;
            }

            const filePath = path.join(__dirname, "data", fileName);

            fs.writeFile(filePath, fileContent, (err) => {
                if (err) {
                    res.writeHead(500, {
                        "Content-Type": "application/json"
                    });
                    res.end(JSON.stringify({
                        success: false,
                        message: "Could not create the file."
                    }));
                    return;
                }

                res.writeHead(201, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify({
                    success: true,
                    message: "File created successfully."
                }));
            });
        });

        return;
    }

    // Return filenames
    if (req.method === "GET" && req.url === "/api/showFiles") {
        const dataPath = path.join(__dirname, "data");

        fs.readdir(dataPath, { withFileTypes: true }, (err, entries) => {
            if (err) {
                res.writeHead(500, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify({
                    error: "Could not read the files."
                }));
                return;
            }

            const files = entries
                .filter((entry) => entry.isFile())
                .map((entry) => entry.name);

            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify(files));
        });

        return;
    }

    // Return system information
    if (req.method === "GET" && req.url === "/api/getSystemInfo") {
        const systemInfo = {
            platform: os.platform(),
            architecture: os.arch(),
            hostname: os.hostname(),
            nodeVersion: process.version,
            cpu: os.cpus().map((cpu) => ({
                model: cpu.model,
                speed: cpu.speed
            })),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem()
        };

        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify(systemInfo));

        return;
    }

    // Unknown route
    res.writeHead(404, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
        error: "Route not found."
    }));
});

server.listen(3002, () => {
    console.log("Server is running at port 3000");
});
