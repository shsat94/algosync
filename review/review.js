let submission = null;

chrome.runtime.sendMessage({
    type: "GET_SUBMISSION"
}, (data) => {

    submission = data;

    document.getElementById("problemName").innerText =
        formatTitle(submission.slug);

    document.getElementById("language").innerText =
        submission.language;

    document.getElementById("runtime").innerText =
        submission.runtime;

    document.getElementById("memory").innerText =
        submission.memory;

});


document.getElementById("upload").addEventListener("click", async () => {

    const notes =
        document.getElementById("notes").value;

    const time =
        document.getElementById("time").value;

    const space =
        document.getElementById("space").value;

    const readme =
        generateReadme(submission, notes, time, space);

    chrome.runtime.sendMessage({

        type: "UPLOAD_REVIEW",

        submission,

        readme,

        notes,

        time,

        space

    });
    window.close();

});

function formatTitle(slug) {
    return slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function generateReadme(submission, notes, time, space) {

    return `# ${formatTitle(submission.slug)}

## Problem

${submission.url}

---

## Solution

**Language:** ${submission.language}

**Runtime:** ${submission.runtime}

**Memory:** ${submission.memory}

---

## Complexity

| Type | Value |
|------|-------|
| Time | ${time} |
| Space | ${space} |

---

## Notes

${notes}

---

Generated automatically using Algo Sync.
`;

}