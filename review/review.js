chrome.runtime.sendMessage({

    type: "GET_SUBMISSION"

}, (submission) => {

    if (!submission) {

        return;

    }

    document.getElementById("problemName").innerText = formatTitle(submission.slug);

    document.getElementById("language").innerText = submission.language;

    document.getElementById("runtime").innerText = submission.runtime;

    document.getElementById("memory").innerText = submission.memory;

});


document
    .getElementById("upload")
    .addEventListener("click", () => {

        const notes =
            document.getElementById("notes").value;

        const time =
            document.getElementById("time").value;

        const space =
            document.getElementById("space").value;

        const files =
            document.getElementById("images").files;

        console.log(notes);

        console.log(time);

        console.log(space);

        console.log(files);

    });

function formatTitle(slug) {
    return slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}