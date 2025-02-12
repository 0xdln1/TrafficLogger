let SERVER_URL = "http://localhost:3000"; // Default server URL
let isLoggingEnabled = true; // Toggle switch state
let activeTabs = {};

// Load settings from storage
chrome.storage.sync.get(["serverUrl", "loggingEnabled"], (data) => {
    if (data.serverUrl) SERVER_URL = data.serverUrl;
    if (typeof data.loggingEnabled !== "undefined") isLoggingEnabled = data.loggingEnabled;
});

// Listen for messages from popup UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "updateServer") {
        SERVER_URL = message.serverUrl;
        chrome.storage.sync.set({ serverUrl: SERVER_URL });
        sendResponse({ status: "success" });
    }

    if (message.type === "toggleLogging") {
        isLoggingEnabled = message.enabled;
        chrome.storage.sync.set({ loggingEnabled: isLoggingEnabled });
        sendResponse({ status: "success" });
    }
});

// Track active tab to store the page URL
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, tab => {
        if (tab && tab.url) activeTabs[activeInfo.tabId] = tab.url;
    });

    chrome.debugger.attach({ tabId: activeInfo.tabId }, "1.3", () => {
        chrome.debugger.sendCommand({ tabId: activeInfo.tabId }, "Network.enable");
    });
});

// Listen for network requests
chrome.debugger.onEvent.addListener((source, method, params) => {
    if (!isLoggingEnabled) return;

    if (method === "Network.requestWillBeSent") {
        let request = params.request;
        let tabId = source.tabId;
        if (!tabId || !request || !request.url) return;

        let pageUrl = activeTabs[tabId] || "Unknown";
        let entry = { pageUrl, request: { method: request.method, url: request.url } };

        sendHarEntry(entry);
    }
});

// Send HAR data to Flask server
function sendHarEntry(entry) {
    fetch(`${SERVER_URL}/capture-har`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
    }).catch(err => console.error("Failed to send HAR log:", err));
}
