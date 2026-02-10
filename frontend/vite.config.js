import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'realme-api-server',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          // 只处理 /api 开头的请求
          if (!req.url.startsWith('/api')) {
            return next()
          }

          const getBody = () => new Promise((resolve) => {
            let body = ''
            req.on('data', chunk => body += chunk)
            req.on('end', () => resolve(body))
          })

          try {
            // 1. 登录接口
            if (req.url === '/api/login' && req.method === 'POST') {
              const body = await getBody()
              const { username, password } = JSON.parse(body)
              
              // 读取后端配置
              const configPath = path.resolve(__dirname, '../backend/config.json')
              const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

              if (username === config.admin.username && password === config.admin.password) {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true, token: 'admin-token-' + Date.now() }))
              } else {
                res.statusCode = 401
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, message: '用户名或密码错误' }))
              }
            } 
            // 2. 卡密读写接口 (复用用户代码逻辑)
            else if (req.url === '/api/cards' && req.method === 'GET') {
              const filePath = path.resolve(__dirname, 'data/cards.json')
              if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf-8')
                res.setHeader('Content-Type', 'application/json')
                res.end(data)
              } else {
                res.setHeader('Content-Type', 'application/json')
                res.end('[]')
              }
            } 
            else if (req.url === '/api/cards' && req.method === 'POST') {
              const body = await getBody()
              const filePath = path.resolve(__dirname, 'data/cards.json')
              
              if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true })
              }
              
              fs.writeFileSync(filePath, body, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            }
            // 3. 导出接口 (对应用户代码逻辑)
            else if (req.url === '/api/export' && req.method === 'POST') {
              const body = await getBody()
              const { filename, content } = JSON.parse(body)
              const filePath = path.resolve(__dirname, 'data', filename)
              
              if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true })
              }
              
              fs.writeFileSync(filePath, content, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, path: filePath }))
            } 
            else {
              next()
            }
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: error.message }))
          }
        })
      }
    }
  ]
})
