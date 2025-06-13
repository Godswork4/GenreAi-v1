// This script is injected into web pages
const injectScript = () => {
  try {
    window.genreAI = {
      isInstalled: true,
      version: '1.0.0',
      // Add any methods that should be exposed to the webpage
      connect: () => {
        return new Promise((resolve) => {
          window.postMessage({ type: 'GENRE_AI_CONNECT' }, '*');
          window.addEventListener('message', function handler(event) {
            if (event.data.type === 'GENRE_AI_CONNECTED') {
              window.removeEventListener('message', handler);
              resolve(event.data.payload);
            }
          });
        });
      }
    };

    console.log('GenreAI: Inpage script loaded');
  } catch (error) {
    console.error('GenreAI: Failed to inject inpage script:', error);
  }
};

injectScript(); 