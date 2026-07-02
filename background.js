chrome.runtime.onMessage.addListener(async (message) => {

    if (message.type !== "LEETCODE_SUBMISSION")
        return;

    chrome.storage.sync.get(
        ["token", "owner", "repo"],
        async ({ token, owner, repo }) => {

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

                const path = `${folder}/solution.${ext}`;

                const encoded = base64Encode(payload.code);

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

                    console.log("Existing file found.");

                }

                const body = {
                    message: `Solved ${payload.slug}`,
                    content: encoded
                };

                if (sha)
                    body.sha = sha;

                const upload = await fetch(url, {

                    method: "PUT",

                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/vnd.github+json"
                    },

                    body: JSON.stringify(body)

                });

                const result = await upload.json();

                console.log(result);

                if (upload.ok) {

                    console.log("✅ Uploaded Successfully");

                }
                else {

                    console.error(result);

                }

            }
            catch (err) {

                console.error(err);

            }

        });

});

function base64Encode(str) {

    return btoa(
        String.fromCharCode(
            ...new TextEncoder().encode(str)
        )
    );

}

