console.log("Extension Loaded");
const url = window.location.href;
const match = url.match(/problems\/([^/]+)/);

if (match) {
    const slug = match[1];

    const title = slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}


document.addEventListener("click", (event) => {

    const button = event.target.closest("button");

    if (!button) return;

    if (button.innerText.trim() === "Submit") {
    }

});

const script = document.createElement("script");

script.src = chrome.runtime.getURL("inject.js");

script.onload = () => script.remove();

(document.head || document.documentElement).appendChild(script);

window.addEventListener("leetcodeSubmission", (event) => {

    chrome.runtime.sendMessage({
        type: "LEETCODE_SUBMISSION",
        payload: event.detail
    });

});