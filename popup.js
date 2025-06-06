document.addEventListener('DOMContentLoaded', () => {
  const textToTranslate = document.getElementById('textToTranslate');
  const translateToChineseBtn = document.getElementById('translateToChinese');
  const translateToEnglishBtn = document.getElementById('translateToEnglish');
  const translationResult = document.getElementById('translationResult');

  // 从当前活动标签页获取选中的文本
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: () => window.getSelection().toString()
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          textToTranslate.value = results[0].result;
        }
      }
    );
  });

  // 监听英译汉按钮点击
  translateToChineseBtn.addEventListener('click', () => {
    const text = textToTranslate.value;
    if (text) {
      sendTranslationRequest(text, 'en', 'zh-CN');
    } else {
      translationResult.textContent = "请输入或选中要翻译的文本。";
    }
  });

  // 监听汉译英按钮点击
  translateToEnglishBtn.addEventListener('click', () => {
    const text = textToTranslate.value;
    if (text) {
      sendTranslationRequest(text, 'zh-CN', 'en');
    } else {
      translationResult.textContent = "请输入或选中要翻译的文本。";
    }
  });

  function sendTranslationRequest(text, sourceLang, targetLang) {
    translationResult.textContent = "翻译中...";
    // 发送消息到 background.js
    chrome.runtime.sendMessage({
      action: "translate",
      text: text,
      source_lang: sourceLang,
      target_lang: targetLang
    }, (response) => {
      if (response && response.translatedText) {
        translationResult.textContent = response.translatedText;
      } else if (response && response.error) {
        translationResult.textContent = "翻译失败：" + response.error;
      } else {
        translationResult.textContent = "翻译请求无响应。";
      }
    });
  }
});
