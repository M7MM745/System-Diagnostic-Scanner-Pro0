const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');
const si = require('systeminformation'); // تم استدعاء المكتبة بنجاح

const PORT = process.env.PORT || 3000;

// ... (دوال getSystemInfo و getNetworkInfo كما هي)

// دالة جلب بيانات القرص الحقيقية
async function getDiskSpace() {
    try {
        const disks = await si.fsSize(); // جلب البيانات الفعلية
        const mainDisk = disks[0]; 
        return {
            total: Math.round(mainDisk.size / (1024 ** 3)), // تحويل لـ جيجابايت
            used: Math.round(mainDisk.used / (1024 ** 3)),
            free: Math.round((mainDisk.size - mainDisk.used) / (1024 ** 3)),
            percent: Math.round(mainDisk.use)
        };
    } catch (e) {
        return { total: 0, used: 0, free: 0, percent: 0 };
    }
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.url === '/api/system-info') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(getSystemInfo()));
    } 
    else if (req.url === '/api/disk-info') {
        const diskInfo = await getDiskSpace(); // استدعاء البيانات الحقيقية
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(diskInfo));
    }
    else if (req.url === '/') {
        const htmlPath = path.join(__dirname, 'index.html');
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
    console.log(`✅ Server running on port ${PORT}`);
});