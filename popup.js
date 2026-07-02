document.getElementById("save").addEventListener("click", () => {

    const token = document.getElementById("token").value.trim();
    const owner = document.getElementById("owner").value.trim();
    const repo = document.getElementById("repo").value.trim();

    chrome.storage.sync.set({
        token,
        owner,
        repo
    }, () => {
        alert("Saved Successfully!");
    });

});