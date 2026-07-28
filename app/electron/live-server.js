const { ipcMain, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const chokidar = require("chokidar");

let liveServer = null;
let wss = null;
let watcher = null;

ipcMain.handle("start-live-server", async (event, htmlPath) => {
    if (!fs.existsSync(htmlPath)) {
        return { error: "HTML file not found" };
    }

    if (liveServer) {
        return { error: "Live server already running" };
    }

    const root = path.dirname(htmlPath);
    const port = 3000;
    const wsPort = 3001;

    function inject(html) {
        const script = `
        <script>
            const ws = new WebSocket("ws://localhost:${wsPort}")
            ws.onmessage = () => location.reload()
        </script>
        `;
        return html.replace("</body>", script + "</body>");
    }

    liveServer = http.createServer((req, res) => {
        const filePath = path.join(root, req.url === "/" ? path.basename(htmlPath) : req.url);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                return res.end("Not found");
            }

            if (filePath.endsWith(".html")) {
                data = inject(data.toString());
            }

            res.writeHead(200);
            res.end(data);
        });
    });

    liveServer.listen(port);

    wss = new WebSocket.Server({ port: wsPort });

    watcher = chokidar.watch(root).on("change", () => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send("reload");
            }
        });
    });

    const url = `http://localhost:${port}`;

    shell.openExternal(url);

    return {
        success: true,
        url,
    };
});

ipcMain.handle("stop-live-server", async () => {
    if (!liveServer) {
        return { error: "Live server not running" };
    }

    try {
        if (watcher) {
            await watcher.close();
            watcher = null;
        }

        if (wss) {
            wss.close();
            wss = null;
        }

        liveServer.close();
        liveServer = null;

        return {
            success: true,
        };
    } catch (err) {
        return {
            error: err.message,
        };
    }
});
