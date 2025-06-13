// Handle connection requests from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONNECT_REQUEST') {
    // Handle connection request
    // In a real implementation, this would interact with the wallet
    sendResponse({
      success: true,
      address: '0x...' // This would be the actual wallet address
    });
  }
  return true; // Required to use sendResponse asynchronously
}); 