chrome.runtime.onMessage.addListener((message) => {

    if (message.type === "LEETCODE_SUBMISSION") {

        console.log("=================================");
        console.log("Accepted Submission Received");
        console.log(message.payload);
        console.log("=================================");

    }

});

chrome.storage.sync.get(
    ["token", "owner", "repo"],
    (result) => {

        console.log(result);

    }
);