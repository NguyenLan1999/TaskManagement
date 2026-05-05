const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Phục vụ các file HTML, CSS, JS

// API Lấy danh sách task
app.get('/api/tasks', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Không thể đọc file dữ liệu' });
        }
        res.json(JSON.parse(data || '[]'));
    });
});

// API Lưu danh sách task
app.post('/api/tasks', (req, res) => {
    const tasks = req.body;
    fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 4), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Không thể ghi vào file dữ liệu' });
        }
        res.json({ message: 'Đã lưu dữ liệu thành công!' });
    });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
