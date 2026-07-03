let submission = null;

const notesEl   = document.getElementById("notes");
const notesCnt  = document.getElementById("asrNotesCount");
const timeEl    = document.getElementById("time");
const spaceEl   = document.getElementById("space");
const dropzone  = document.getElementById("asrDropzone");
const imagesEl  = document.getElementById("images");
const previews  = document.getElementById("asrPreviews");
const uploadBtn = document.getElementById("upload");
const backdrop  = document.getElementById("asrBackdrop");
const card      = document.getElementById("asrCard");
const closeBtn  = document.getElementById("asrClose");

const complexityPattern = /^O\(.+\)$/i;

chrome.runtime.sendMessage({
    type: "GET_SUBMISSION"
}, (data) => {

    submission = data;

    document.getElementById("problemName").innerText =
        formatTitle(submission.slug);

    document.getElementById("language").innerText =
        submission.language;

    animateStat("runtime", submission.runtime, submission.runtimePercentile);
    animateStat("memory", submission.memory, submission.memoryPercentile);

});

document.getElementById("upload").addEventListener("click", async () => {

    if (uploadBtn.classList.contains("asr-loading") || uploadBtn.classList.contains("asr-success")) return;

    uploadBtn.classList.add("asr-ripple");
    setTimeout(() => uploadBtn.classList.remove("asr-ripple"), 500);
    uploadBtn.classList.add("asr-loading");

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

    uploadBtn.classList.remove("asr-loading");
    uploadBtn.classList.add("asr-success");
    card.classList.add("asr-glow");

    setTimeout(() => {
        window.close();
    }, 850);

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

function animateStat(id, text, percentile) {
    const el = document.getElementById(id);
    const fillEl = document.querySelector(`[data-fill="${id}"]`);
    const match = text ? text.match(/[\d.]+/) : null;

    if (!match) {
        el.innerText = text || "--";
    } else {
        const target = parseFloat(match[0]);
        const suffix = text.slice(match.index + match[0].length);
        const start = performance.now();
        const duration = 700;

        (function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.innerText = (target * eased).toFixed(target % 1 !== 0 ? 1 : 0) + suffix;
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    }

    requestAnimationFrame(() => {
        if (fillEl) fillEl.style.width = (percentile ?? 60) + "%";
    });
}

notesEl.addEventListener("input", () => {
    const len = notesEl.value.length;
    notesCnt.textContent = `${len} / 400`;
    notesCnt.style.color = len > 400 ? "var(--invalid)" : "var(--muted)";
});

function validateComplexity(input) {
    const field = input.closest(".asr-field");
    const value = input.value.trim();
    field.classList.remove("asr-valid", "asr-invalid");
    if (!value) return;
    field.classList.add(complexityPattern.test(value) ? "asr-valid" : "asr-invalid");
}

[timeEl, spaceEl].forEach((input) => {
    input.addEventListener("input", () => validateComplexity(input));
});

let selectedFiles = [];

function renderPreviews() {
    previews.innerHTML = "";
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const thumb = document.createElement("div");
            thumb.className = "asr-thumb";
            thumb.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <button type="button" aria-label="Remove image">&times;</button>
            `;
            thumb.querySelector("button").addEventListener("click", () => {
                selectedFiles.splice(index, 1);
                syncFileInput();
                renderPreviews();
            });
            previews.appendChild(thumb);
        };
        reader.readAsDataURL(file);
    });
}

function syncFileInput() {
    const dt = new DataTransfer();
    selectedFiles.forEach((f) => dt.items.add(f));
    imagesEl.files = dt.files;
}

imagesEl.addEventListener("change", () => {
    selectedFiles = Array.from(imagesEl.files);
    renderPreviews();
});

["dragenter", "dragover"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.add("asr-dragover");
    });
});

["dragleave", "drop"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.remove("asr-dragover");
    });
});

dropzone.addEventListener("drop", (e) => {
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    selectedFiles = selectedFiles.concat(dropped);
    syncFileInput();
    renderPreviews();
});

function closePopup() {
    card.classList.add("asr-closing");
    backdrop.style.transition = "opacity 0.25s ease";
    backdrop.style.opacity = "0";
    setTimeout(() => window.close(), 260);
}

closeBtn.addEventListener("click", closePopup);

backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closePopup();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
});