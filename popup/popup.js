document.addEventListener('DOMContentLoaded', function() {
  const enabledCheckbox = document.getElementById('enabled');
  const statusText = document.getElementById('statusText');
  const countElement = document.getElementById('count');

  chrome.storage.sync.get(['enabled', 'blockedCount'], function(data) {
    const isEnabled = data.enabled !== undefined ? data.enabled : true;
    enabledCheckbox.checked = isEnabled;
    statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';

    countElement.textContent = data.blockedCount || 0;
  });

  enabledCheckbox.addEventListener('change', function() {
    const isEnabled = this.checked;
    chrome.storage.sync.set({enabled: isEnabled}, function() {
      statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';

      const reloadMsg = document.createElement('div');
      reloadMsg.textContent = 'Reloading page to apply changes...';
      reloadMsg.style.color = '#FF5722';
      reloadMsg.style.fontSize = '12px';
      reloadMsg.style.marginTop = '5px';
      document.getElementById('status').appendChild(reloadMsg);

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });
});
