const storage = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync)
    ? {
        get: (keys) => new Promise((resolve) => chrome.storage.sync.get(keys, resolve)),
        set: (obj) => new Promise((resolve) => chrome.storage.sync.set(obj, resolve)),
    }
    : (() => {
        const mem = {};
        return {
            get: (keys) => Promise.resolve({ [keys]: mem[keys] }),
            set: (obj) => { Object.assign(mem, obj); return Promise.resolve(); },
        };
    })();

const STORAGE_KEY = 'githubConnection';

chrome.runtime.onMessage.addListener(async (message) => {

    if (message.type !== "LEETCODE_SUBMISSION")
        return;

    const result = await storage.get(STORAGE_KEY);
    console.log(result);
    const saved = result[STORAGE_KEY];
    githubPipeline(saved.token, saved.owner, saved.repo, message);

});

const githubPipeline = async (token, owner, repo, message) => {

    if (!token || !owner || !repo) {
        console.error("GitHub credentials are missing.");
        return;
    }

    try {

        const payload = message.payload;

        const extensionMap = {
            java: "java",
            cpp: "cpp",
            c: "c",
            python: "py",
            python3: "py",
            javascript: "js",
            typescript: "ts",
            csharp: "cs",
            go: "go",
            kotlin: "kt",
            rust: "rs"
        };

        const ext = extensionMap[payload.language] || "txt";

        const folder =
            payload.questionId.padStart(4, "0") +
            "-" +
            payload.slug;

        const parentFolder = 'Solutions';

        const path = `${folder}/solution.${ext}`;

        const encoded = base64Encode(payload.code);

        await uploadFile(
            `${parentFolder}/${folder}/solution.${ext}`,
            payload.code,
            `Solved ${payload.slug}`,
            token,
            owner,
            repo
        );

        const metadata = {

            title: payload.slug
                .split("-")
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),

            slug: payload.slug,

            questionId: payload.questionId,

            language: payload.language,

            runtime: payload.runtime,

            memory: payload.memory,

            submissionId: payload.submissionId,

            solvedAt: payload.submittedAt,

            url: payload.url

        };

        await uploadFile(
            `${parentFolder}/${folder}/metadata.json`,
            JSON.stringify(metadata, null, 4),
            `Updated metadata for ${payload.slug}`,
            token,
            owner,
            repo
        );

        const readme = `# ${metadata.title}

                ## Information

                - Problem ID: ${metadata.questionId}
                - Language: ${metadata.language}
                - Runtime: ${metadata.runtime}
                - Memory: ${metadata.memory}
                - Solved At: ${metadata.solvedAt}

                ## LeetCode

                ${metadata.url}
                `;

        await uploadFile(
            `${parentFolder}/${folder}/README.md`,
            readme,
            `Updated README for ${payload.slug}`,
            token,
            owner,
            repo
        );

        function generateMainReadme() {

            return `# 🚀 LeetCode Solutions

                    ## Statistics

                    - Last Updated: ${new Date().toLocaleString()}

                    Generated automatically using my Chrome Extension.
                    `;

        }

        await uploadFile(
            "README.md",
            generateMainReadme(),
            "Updated main README",
            token,
            owner,
            repo
        );

    }
    catch (err) {

        console.error(err);

    }

};

function base64Encode(str) {

    return btoa(
        String.fromCharCode(
            ...new TextEncoder().encode(str)
        )
    );

}

async function uploadFile(path, content, message, token, owner, repo) {

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const existing = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json"
        }
    });

    let sha = null;

    if (existing.ok) {
        const file = await existing.json();
        sha = file.sha;
    }

    const body = {
        message,
        content: base64Encode(content)
    };

    if (sha) {
        body.sha = sha;
    }

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json"
        },
        body: JSON.stringify(body)
    });

    return await response.json();
}