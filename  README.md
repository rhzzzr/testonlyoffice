
## 环境搭建

首先需要部署OnlyOffice Document Server：

```bash
# 使用Docker部署
docker run -i -t -d -p 80:80 --restart=always \
  -v /app/onlyoffice/DocumentServer/logs:/var/log/onlyoffice \
  -v /app/onlyoffice/DocumentServer/data:/var/www/onlyoffice/Data \
  onlyoffice/documentserver
```

## 基础集成代码

创建HTML页面集成编辑器：

```html
<!DOCTYPE html>
<html>
<head>
    <title>OnlyOffice Editor</title>
    <script src="http://localhost/web-apps/apps/api/documents/api.js"></script>
</head>
<body>
    <div id="placeholder"></div>
    
    <script>
        var docEditor = new DocsAPI.DocEditor("placeholder", {
            "document": {
                "fileType": "docx",
                "key": "document-key-123",
                "title": "Example Document.docx",
                "url": "http://localhost:8080/documents/template.docx"
            },
            "documentType": "word",
            "editorConfig": {
                "callbackUrl": "http://localhost:8080/callback",
                "mode": "edit"
            },
            "height": "600px",
            "width": "100%"
        });
    </script>
</body>
</html>
```

## 通过API插入内容的方法

### 1. 使用Document Builder API

OnlyOffice提供Document Builder API用于程序化操作文档：

```javascript
// 连接到编辑器
docEditor.attachToDocument({
    "token": "your-token",
    "document": {
        "key": "document-key-123"
    }
});

// 插入文本内容
function insertText(text) {
    var script = `
        var oDocument = Api.GetDocument();
        var oParagraph = Api.CreateParagraph();
        oParagraph.AddText("${text}");
        oDocument.Push(oParagraph);
    `;
    
    docEditor.executeMethod("insertText", [script]);
}

// 插入表格
function insertTable(rows, cols) {
    var script = `
        var oDocument = Api.GetDocument();
        var oTable = Api.CreateTable(${cols}, ${rows});
        oDocument.Push(oTable);
    `;
    
    docEditor.executeMethod("insertTable", [script]);
}
```

### 2. 使用Editor Events

监听编辑器事件并插入内容：

```javascript
var docEditor = new DocsAPI.DocEditor("placeholder", {
    // ... 配置
    "events": {
        "onDocumentReady": function() {
            console.log("文档已准备就绪");
            // 可以在此时插入初始内容
            insertInitialContent();
        },
        "onRequestInsertImage": function(event) {
            // 处理图片插入请求
            insertImage(event);
        }
    }
});

function insertInitialContent() {
    // 插入标题
    insertText("这是通过API插入的标题");
    
    // 插入段落
    insertText("这是通过API插入的段落内容");
}
```

### 3. 服务端API集成

创建后端API来处理文档操作：

```javascript
// Node.js Express示例
const express = require('express');
const app = express();

// 插入内容的API端点
app.post('/api/insert-content', (req, res) => {
    const { documentKey, content, type } = req.body;
    
    // 根据类型插入不同内容
    switch(type) {
        case 'text':
            insertTextToDocument(documentKey, content);
            break;
        case 'table':
            insertTableToDocument(documentKey, content);
            break;
        case 'image':
            insertImageToDocument(documentKey, content);
            break;
    }
    
    res.json({ success: true });
});

function insertTextToDocument(key, text) {
    // 使用Document Builder API插入文本
    const builderScript = `
        var oDocument = Api.GetDocument();
        var oParagraph = Api.CreateParagraph();
        oParagraph.AddText("${text}");
        oDocument.Push(oParagraph);
    `;
    
    // 执行脚本
    executeBuilderScript(key, builderScript);
}
```

### 4. 实时内容插入

实现实时向文档插入内容的功能：

```javascript
// 前端调用
function addContentToDocument(content) {
    fetch('/api/insert-content', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            documentKey: 'document-key-123',
            content: content,
            type: 'text'
        })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            // 刷新编辑器或发送消息通知更新
            docEditor.refreshHistory();
        }
    });
}

// 使用WebSocket实现实时同步
const socket = new WebSocket('ws://localhost:8080');

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if(data.type === 'insert-content') {
        // 在编辑器中插入接收到的内容
        insertText(data.content);
    }
};
```

## 高级功能

### 插入复杂内容

```javascript
// 插入带格式的文本
function insertFormattedText(text, formatting) {
    var script = `
        var oDocument = Api.GetDocument();
        var oParagraph = Api.CreateParagraph();
        var oRun = Api.CreateRun();
        oRun.AddText("${text}");
        
        // 应用格式
        ${formatting.bold ? 'oRun.SetBold(true);' : ''}
        ${formatting.italic ? 'oRun.SetItalic(true);' : ''}
        ${formatting.fontSize ? `oRun.SetFontSize(${formatting.fontSize});` : ''}
        
        oParagraph.AddElement(oRun);
        oDocument.Push(oParagraph);
    `;
    
    docEditor.executeMethod("insertFormattedText", [script]);
}

// 插入图片
function insertImage(imageUrl) {
    var script = `
        var oDocument = Api.GetDocument();
        var oParagraph = Api.CreateParagraph();
        var oDrawing = Api.CreateImage("${imageUrl}", 60 * 36000, 35 * 36000);
        oParagraph.AddDrawing(oDrawing);
        oDocument.Push(oParagraph);
    `;
    
    docEditor.executeMethod("insertImage", [script]);
}
```

这样您就可以通过OnlyOffice Developer Edition的API实现向文档中动态插入各种类型的内容了。关键是要正确配置Document Server，然后使用Document Builder API或编辑器事件来操作文档内容。