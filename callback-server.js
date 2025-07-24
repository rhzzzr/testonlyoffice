const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const app = express();
const PORT = 8080;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 允许CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// 静态文件服务
app.use(express.static('.', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// 文档存储目录
const DOCS_DIR = path.join(__dirname, 'documents');
if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// OnlyOffice Callback Handler
app.post('/callback', (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`\n=== OnlyOffice 回调 [${timestamp}] ===`);
    console.log('请求头:', JSON.stringify(req.headers, null, 2));
    console.log('请求体:', JSON.stringify(req.body, null, 2));
    
    const { status, url, key, users } = req.body;
    
    try {
        console.log(`文档状态: ${status}, 文档键: ${key}`);
        
        switch (status) {
            case 0: // 无文档错误
                console.log('✅ 文档无错误');
                break;
                
            case 1: // 文档编辑中
                console.log('📝 文档正在编辑中');
                if (users && users.length > 0) {
                    console.log('编辑用户:', users);
                }
                break;
                
            case 2: // 文档保存完成
                console.log('💾 文档保存完成');
                if (url) {
                    console.log('文档下载URL:', url);
                    downloadDocument(url, key)
                        .then((filePath) => {
                            console.log('✅ 文档保存成功:', filePath);
                        })
                        .catch(err => {
                            console.error('❌ 文档保存失败:', err);
                        });
                } else {
                    console.log('⚠️ 没有提供文档下载URL');
                }
                break;
                
            case 3: // 文档保存错误但已关闭
                console.log('⚠️ 文档保存错误但已关闭');
                if (url) {
                    downloadDocument(url, key)
                        .then((filePath) => {
                            console.log('✅ 文档强制保存成功:', filePath);
                        })
                        .catch(err => {
                            console.error('❌ 文档强制保存失败:', err);
                        });
                }
                break;
                
            case 4: // 文档关闭，无更改
                console.log('🔒 文档关闭，无更改');
                break;
                
            case 6: // 文档编辑但需要保存
                console.log('📝 文档编辑但需要保存');
                if (url) {
                    downloadDocument(url, key)
                        .then((filePath) => {
                            console.log('✅ 文档自动保存成功:', filePath);
                        })
                        .catch(err => {
                            console.error('❌ 文档自动保存失败:', err);
                        });
                }
                break;
                
            case 7: // 强制保存时出错
                console.log('❌ 强制保存时出错');
                if (url) {
                    downloadDocument(url, key)
                        .then((filePath) => {
                            console.log('✅ 错误恢复保存成功:', filePath);
                        })
                        .catch(err => {
                            console.error('❌ 错误恢复保存失败:', err);
                        });
                }
                break;
                
            default:
                console.log('❓ 未知状态码:', status);
                break;
        }
        
        // 返回成功响应
        const response = { error: 0 };
        console.log('返回响应:', response);
        console.log('=== 回调处理完成 ===\n');
        res.json(response);
        
    } catch (error) {
        console.error('❌ 处理回调时出错:', error);
        const errorResponse = { error: 1, message: error.message };
        console.log('返回错误响应:', errorResponse);
        console.log('=== 回调处理失败 ===\n');
        res.json(errorResponse);
    }
});

// 下载文档函数
function downloadDocument(url, key) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(DOCS_DIR, `${key}.docx`);
        const file = fs.createWriteStream(filePath);
        
        const client = url.startsWith('https:') ? https : http;
        
        console.log('开始下载文档:', url);
        
        const request = client.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log('文档下载完成:', filePath);
                resolve(filePath);
            });
            
            file.on('error', (err) => {
                fs.unlink(filePath, () => {}); // 删除不完整的文件
                reject(err);
            });
        });
        
        request.on('error', (err) => {
            reject(err);
        });
        
        request.setTimeout(30000, () => {
            request.abort();
            reject(new Error('下载超时'));
        });
    });
}

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'OnlyOffice Callback Server is running',
        timestamp: new Date().toISOString()
    });
});

// 获取文档列表
app.get('/documents', (req, res) => {
    fs.readdir(DOCS_DIR, (err, files) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        const documents = files
            .filter(file => file.endsWith('.docx'))
            .map(file => {
                const filePath = path.join(DOCS_DIR, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    size: stats.size,
                    modified: stats.mtime,
                    key: path.basename(file, '.docx')
                };
            });
        
        res.json(documents);
    });
});

// 提供文档文件服务
app.get('/documents/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(DOCS_DIR, filename);
    
    console.log(`📄 请求文档: ${filename}`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ 文档不存在: ${filePath}`);
        return res.status(404).json({ error: 'Document not found' });
    }
    
    console.log(`✅ 提供文档: ${filePath}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(path.resolve(filePath));
});

// 测试页面路由
app.get('/', (req, res) => {
    res.redirect('/api-integration.html');
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`OnlyOffice Callback Server 运行在 http://localhost:${PORT}`);
    console.log(`Callback URL: http://localhost:${PORT}/callback`);
    console.log(`健康检查: http://localhost:${PORT}/health`);
    console.log(`文档列表: http://localhost:${PORT}/documents`);
    console.log(`演示页面: http://localhost:${PORT}/api-integration.html`);
    console.log(`OnlyOffice Document Server: http://localhost:8081`);
    console.log(``);
    console.log(`查看Docker日志: docker-compose logs -f`);
    console.log(`停止所有服务: ./stop.sh`);
    console.log(``);
    console.log(`按 Ctrl+C 停止所有服务`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n正在关闭服务器...');
    process.exit(0);
});