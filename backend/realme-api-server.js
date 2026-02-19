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

// 获取系统配置
app.get('/api/config', (req, res) => {
    try {
        if (!fs.existsSync(CONFIG_FILE)) {
            return res.json({ system: { enableCardAuth: true } });
        }
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        // 只返回公开的配置，不返回管理员密码
        res.json({ system: config.system || { enableCardAuth: true } });
    } catch (error) {
        console.error('读取配置失败:', error);
        res.status(500).json({ error: '读取配置失败' });
    }
});

// 更新系统配置
app.post('/api/config', (req, res) => {
    try {
        const { system } = req.body;
        if (!fs.existsSync(CONFIG_FILE)) {
            return res.status(404).json({ error: '配置文件不存在' });
        }
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        
        // 更新 system 配置
        config.system = { ...config.system, ...system };
        
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
        res.json({ success: true, system: config.system });
    } catch (error) {
        console.error('更新配置失败:', error);
        res.status(500).json({ error: '更新配置失败' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
