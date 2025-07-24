# OnlyOffice 界面简化配置 🎨

## ✅ 已隐藏的界面元素

根据用户需求，已通过配置隐藏以下OnlyOffice编辑器界面元素：

### 🚫 隐藏的面板：
1. **左侧面板** - 搜索、评论、导航等功能面板
2. **右侧面板** - 表格、图表、书签等功能面板  
3. **底部状态栏** - 页数、字数统计、语言设置等

## 🔧 实现方法

### 1. OnlyOffice 配置参数：
```javascript
"customization": {
    "toolbar": {
        "layout": {
            "leftMenu": false,      // 隐藏左侧菜单
            "rightMenu": false,     // 隐藏右侧菜单
            "statusBar": false      // 隐藏状态栏
        }
    },
    "leftMenu": { "mode": false },
    "rightMenu": { "mode": false },
    "hideLeftPanel": true,
    "hideRightPanel": true,
    "hideRightMenu": true,
    "hideRulers": true
}
```

### 2. CSS 强制隐藏：
```css
/* 强制隐藏左侧面板 */
#editor_sdk .left-panel,
#editor_sdk .left-menu,
.left-panel,
.left-menu {
    display: none !important;
}

/* 强制隐藏右侧面板 */
#editor_sdk .right-panel,
#editor_sdk .right-menu, 
.right-panel,
.right-menu {
    display: none !important;
}

/* 强制隐藏底部状态栏 */
#editor_sdk .statusbar,
#editor_sdk .status-bar,
.statusbar,
.status-bar {
    display: none !important;
}
```

## 🎯 效果预览

现在的OnlyOffice编辑器界面将显示：
- ✅ **保留**: 顶部工具栏（文字格式、段落等核心编辑功能）
- ✅ **保留**: 主要编辑区域（文档内容区域）
- ❌ **隐藏**: 左侧功能面板
- ❌ **隐藏**: 右侧功能面板  
- ❌ **隐藏**: 底部状态栏

## 🚀 使用方法

### 访问简化界面：
```
http://localhost:8080/api-integration.html
```

### 预期结果：
1. ✅ 界面更加简洁，专注于文档编辑
2. ✅ 减少了界面干扰元素
3. ✅ 提供更大的编辑区域
4. ✅ 保留了所有核心编辑功能

## 🔄 如需恢复界面元素

如果后续需要显示某些面板，可以修改以下配置：

### 显示左侧面板：
```javascript
"leftMenu": { "mode": true },
"hideLeftPanel": false,
```

### 显示右侧面板：
```javascript  
"rightMenu": { "mode": true },
"hideRightPanel": false,
```

### 显示状态栏：
```javascript
"toolbar": {
    "layout": {
        "statusBar": true
    }
}
```

## ✨ 配置完成

界面简化配置已完成！刷新浏览器页面即可看到简化后的OnlyOffice编辑器界面。🎉