// Initialize default extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    enabled: true,
    blockedCount: 0
  });

  chrome.tabs.create({
    url: 'popup/welcome.html'
  });
});
