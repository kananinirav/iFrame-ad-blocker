let blockedCount = 0;

function safelyAccessChromeAPI(callback) {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.runtime) {
    console.log('Chrome APIs not available');
    return false;
  }

  try {
    chrome.runtime.id;
    return callback();
  } catch (e) {
    console.log('Extension context invalidated or error occurred:', e);
    return false;
  }
}

function blockIframeAds() {
  if (!safelyAccessChromeAPI(() => true)) {
    return;
  }

  try {
    chrome.storage.sync.get('enabled', function(data) {
      try {
        const isEnabled = data.enabled !== undefined ? data.enabled : true;

        if (!isEnabled) {
          return;
        }

        const iframes = document.getElementsByTagName('iframe');

        for (let i = 0; i < iframes.length; i++) {
          const iframe = iframes[i];

          if (!iframe.hasAttribute('sandbox')) {
            iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
            console.log('Blocked ad in iframe:', iframe);
            blockedCount++;

            safelyAccessChromeAPI(() => {
              chrome.storage.sync.get('blockedCount', function(data) {
                try {
                  const totalCount = (data.blockedCount || 0) + 1;
                  chrome.storage.sync.set({blockedCount: totalCount});
                } catch (e) {
                  console.log('Error updating blockedCount:', e);
                }
              });
              return true;
            });
          }
        }
      } catch (e) {
        console.log('Error in get callback:', e);
      }
    });
  } catch (e) {
    console.log('Error in blockIframeAds:', e);
  }
}

function initialize() {
  if (!safelyAccessChromeAPI(() => true)) {
    return;
  }

  try {
    blockIframeAds();

    const observer = new MutationObserver(function(mutations) {
      blockIframeAds();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('unload', function() {
      observer.disconnect();
    });
  } catch (e) {
    console.log('Error initializing extension:', e);
  }
}

if (document.body) {
  initialize();
} else {
  window.addEventListener('DOMContentLoaded', function() {
    initialize();
  });
}
