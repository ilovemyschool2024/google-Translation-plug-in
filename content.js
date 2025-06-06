// content.js
// 注入到网页中，用于获取选中的文本并创建右键菜单项

// 监听鼠标抬起事件，用于捕获选中的文本
document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        // 可以选择在这里做一些UI上的提示，或者直接通过background.js发送消息
        // 例如：
        // console.log("Selected text:", selectedText);
    }
});

// 创建右键菜单项
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "createContextMenu") {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            chrome.runtime.sendMessage({
                action: "contextMenuData",
                text: selectedText
            });
        }
    }
});
