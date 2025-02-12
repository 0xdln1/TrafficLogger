document.addEventListener("DOMContentLoaded", function() {
    let serverUrlInput = document.getElementById("serverUrl");
    let saveBtn = document.getElementById("saveBtn");
    let toggleLogging = document.getElementById("toggleLogging");

    // Load saved settings
    chrome.storage.sync.get(["serverUrl", "loggingEnabled"], (data) => {
        if (data.serverUrl) serverUrlInput.value = data.serverUrl;
        if (typeof data.loggingEnabled !== "undefined") toggleLogging.checked = data.loggingEnabled;
    });

    // Save server URL
    saveBtn.addEventListener("click", () => {
        let serverUrl = serverUrlInput.value.trim();
        if (serverUrl) {
            chrome.runtime.sendMessage({ type: "updateServer", serverUrl }, (response) => {
                if (response.status === "success") alert("Server URL Updated!");
            });
        }
    });

    // Toggle logging
    toggleLogging.addEventListener("change", () => {
        chrome.runtime.sendMessage({ type: "toggleLogging", enabled: toggleLogging.checked });
    });
});
