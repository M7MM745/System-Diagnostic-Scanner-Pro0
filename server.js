const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

function getSystemInfo() {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    // CPU usage calculation
    let cpuUsage = 0;
    if (process.cpuUsage) {
        const usage = process.cpuUsage();
        cpuUsage = Math.round((usage.user + usage.system) / 1000000 * 100 / os.cpus().length);
    }
    
    return {
        device: {
            type: process.platform === 'win32' ? 'Windows PC' : 
                   process.platform === 'darwin' ? 'Mac' : 'Linux',
            platform: process.platform,
            arch: os.arch()
        },
        cpu: {
            model: cpus[0].model,
            count: cpus.length,
            speed: cpus[0].speed,
            usage: cpuUsage
        },
        memory: {
            total: Math.round(totalMemory / 1024 / 1024),
            free: Math.round(freeMemory / 1024 / 1024),
            used: Math.round(usedMemory / 1024 / 1024),
            percent: Math.round((usedMemory / totalMemory) * 100)
        },
        uptime: os.uptime(),
        hostname: os.hostname(),
        userInfo: os.userInfo().username,
        osVersion: os.release(),
        networkInterfaces: getNetworkInfo()
    };
}

function getNetworkInfo() {
    const interfaces = os.networkInterfaces();
    const networkInfo = {};
    
    Object.keys(interfaces).forEach(name => {
        const ifaces = interfaces[name];
        ifaces.forEach(iface => {
            if (iface.family === 'IPv4' && !iface.internal) {
                networkInfo.ipv4 = iface.address;
                networkInfo.mac = iface.mac;
            }
            if (iface.family === 'IPv6' && !iface.internal) {
                networkInfo.ipv6 = iface.address;
            }
        });
    });
    
    return networkInfo;
}

function getDiskSpace(diskPath = 'C:') {
    // Simple disk space estimation for Windows
    try {
        const stats = {
            total: 1000 * 1024 * 1024 * 1024, // 1TB default estimate
            used: 500 * 1024 * 1024 * 1024,   // 500GB used estimate
            free: 500 * 1024 * 1024 * 1024    // 500GB free estimate
        };
        return {
            total: Math.round(stats.total / 1024 / 1024 / 1024),
            used: Math.round(stats.used / 1024 / 1024 / 1024),
            free: Math.round(stats.free / 1024 / 1024 / 1024),
            percent: Math.round((stats.used / stats.total) * 100)
        };
    } catch (e) {
        return { total: 0, used: 0, free: 0, percent: 0 };
    }
}

function getProcesses() {
    // Return current process info
    return {
        current: {
            name: 'Node.js Server',
            memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
        },
        uptime: Math.floor(process.uptime()) + ' seconds'
    };
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.url === '/api/system-info') {
        const info = getSystemInfo();
        res.writeHead(200);
        res.end(JSON.stringify(info));
    } 
    else if (req.url === '/api/disk-info') {
        const diskInfo = getDiskSpace();
        res.writeHead(200);
        res.end(JSON.stringify(diskInfo));
    }
    else if (req.url === '/api/processes') {
        const processes = getProcesses();
        res.writeHead(200);
        res.end(JSON.stringify(processes));
    }
    else if (req.url === '/') {
        // Serve the HTML file
        const htmlPath = path.join(__dirname, 'تست.html');
        fs.readFile(htmlPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.setHeader('Content-Type', 'text/html');
                res.writeHead(200);
                res.end(data);
            }
        });
    }
    else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`✅ System Diagnostic Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   http://localhost:${PORT}/api/system-info`);
    console.log(`   http://localhost:${PORT}/api/disk-info`);
    console.log(`   http://localhost:${PORT}/api/processes`);
});
