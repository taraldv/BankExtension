/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {


    function run(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {
          command: "go"
        });
    }
    /**
     * Get the active tab,
     * then call "run()"
     */
    if (e.target.classList.contains("testExtension")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(run)
    }
  });
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 */
browser.tabs.executeScript({file: "/content_scripts/bank.js"})
.then(listenForClicks);
