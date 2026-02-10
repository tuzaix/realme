const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 2501;
const CARDS_FILE = path.join(__dirname, '../frontend/data/cards.json');
const CONFIG_FILE = path.join(__dirname, 'config.json');

app.use(cors());
app.use(bodyParser.json());

// 管理员登录
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        if (username === config.admin.username && password === config.admin.password) {
            res.json({ success: true, token: 'fake-jwt-token-for-demo' });
        } else {
            res.status(401).json({ success: false, message: '用户名或密码错误' });
        }
    } catch (error) {
        console.error('读取配置失败:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 获取所有卡密
app.get('/api/cards', (req, res) => {
    try {
        if (!fs.existsSync(CARDS_FILE)) {
            return res.json([]);
        }
        const data = fs.readFileSync(CARDS_FILE, 'utf8');
        res.json(JSON.parse(data || '[]'));
    } catch (error) {
        console.error('读取卡密失败:', error);
        res.status(500).json({ error: '读取数据失败' });
    }
});

// 保存卡密
app.post('/api/cards', (req, res) => {
    try {
        const cards = req.body;
        const dir = path.dirname(CARDS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2), 'utf8');
        res.json({ success: true });
    } catch (error) {
        console.error('保存卡密失败:', error);
        res.status(500).json({ error: '保存数据失败' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
