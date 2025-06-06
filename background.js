// background.js
// 后台服务工作者，处理消息传递和翻译请求

const BACKEND_URL = "http://127.0.0.1:5000/translate"; // 替换为你的Python后端地址

// 监听来自 popup.js 或 content.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: request.text,
        source_lang: request.source_lang,
        target_lang: request.target_lang
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.translatedText) {
        sendResponse({ translatedText: data.translatedText });
      } else if (data.error) {
        sendResponse({ error: data.error });
      } else {
        sendResponse({ error: "未知错误" });
      }
    })
    .catch(error => {
      sendResponse({ error: "请求后端服务失败：" + error.message });
    });
    return true; // 表示我们将异步发送响应
  }
});

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translateSelectionToChinese",
    title: "翻译选中文本 (英译汉)",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "translateSelectionToEnglish",
    title: "翻译选中文本 (汉译英)",
    contexts: ["selection"]
  });
});

// 监听右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translateSelectionToChinese" || info.menuItemId === "translateSelectionToEnglish") {
    const selectedText = info.selectionText;
    if (selectedText) {
      const sourceLang = (info.menuItemId === "translateSelectionToChinese") ? "en" : "zh-CN";
      const targetLang = (info.menuItemId === "translateSelectionToChinese") ? "zh-CN" : "en";

      fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: selectedText,
          source_lang: sourceLang,
          target_lang: targetLang
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.translatedText) {
          // 将翻译结果发送回 content.js，以便在页面上显示（例如，通过弹出框或通知）
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showTranslationResult,
            args: [data.translatedText]
          });
        } else if (data.error) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: showTranslationResult,
            args: ["翻译失败：" + data.error]
          });
        }
      })
      .catch(error => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: showTranslationResult,
          args: ["请求后端服务失败：" + error.message]
        });
      });
    }
  }
});

// 这个函数将被注入到页面中，用于显示翻译结果
function showTranslationResult(result) {
    // 可以在这里创建一个简单的浮动提示框或使用 alert
    alert("翻译结果:\n" + result);
    // 或者更复杂的UI：
    /*
    let existingDiv = document.getElementById('chromeTranslatorResultDiv');
    if (existingDiv) {
        existingDiv.remove();
    }
    let resultDiv = document.createElement('div');
    resultDiv.id = 'chromeTranslatorResultDiv';
    resultDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #f9f9f9;
        border: 1px solid #ccc;
        padding: 10px;
        z-index: 9999;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        max-width: 300px;
        word-wrap: break-word;
        border-radius: 5px;
    `;
    resultDiv.innerHTML = `<strong>翻译结果:</strong><br>${result}`;
    document.body.appendChild(resultDiv);
    setTimeout(() => {
        resultDiv.remove();
    }, 5000); // 5秒后自动消失
    */
}
