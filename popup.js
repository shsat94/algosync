document.getElementById("save").addEventListener("click", () => {

    chrome.storage.sync.set({

        token: document.getElementById("token").value,
        owner: document.getElementById("owner").value,
        repo: document.getElementById("repo").value

    }, () => {

        alert("Saved!");

    });

});