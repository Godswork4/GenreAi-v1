// This script injects the inpage script into the webpage
try {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('src/extension/inpage/index.js');
  script.type = 'text/javascript';
  script.async = true;
  
  const container = document.head || document.documentElement;
  container.appendChild(script);
  
  // Handle messages from the inpage script
  window.addEventListener('message', (event) => {
    if (event.data.type === 'GENRE_AI_CONNECT') {
      // Handle connection request
      chrome.runtime.sendMessage({ type: 'CONNECT_REQUEST' }, (response) => {
        window.postMessage({
          type: 'GENRE_AI_CONNECTED',
          payload: response
        }, '*');
      });
    }
  });

  console.log('Enkrypt: Hello from IN');
} catch (error) {
  console.error('Failed to inject GenreAI script:', error);
} 