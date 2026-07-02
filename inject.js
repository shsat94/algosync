let submission = {};

const originalFetch = window.fetch;

window.fetch = async (...args) => {
    const [resource, config] = args;
    const url = resource.toString();

    if (url.includes("/submit/")) {
        console.log("Detected Submit");

        try {
            if (config && config.body) {
                const body = JSON.parse(config.body);

                submission = {
                    language: body.lang,
                    code: body.typed_code,
                    questionId: body.question_id,
                    slug: window.location.pathname.split("/")[2],
                    url: window.location.href,
                    accepted: false,
                    runtime: null,
                    memory: null,
                    submissionId: null,
                    submittedAt: new Date().toISOString()
                };

                console.log("Captured Submit Data:", submission);
            }
        } catch (err) {
            console.error("Submit Parse Error:", err);
        }
    }

    const response = await originalFetch(...args);
    if (url.includes("/check/")) {
        console.log("✅ Detected Check");

        try {
            const clone = response.clone();
            const data = await clone.json();
            submission.accepted = data.status_msg === "Accepted";
            submission.runtime = data.status_runtime;
            submission.memory = data.status_memory;
            submission.submissionId = data.submission_id;
            submission.status = data.status_msg;
            submission.runtimePercentile = data.runtime_percentile;
            submission.memoryPercentile = data.memory_percentile;
            submission.finishedAt = data.task_finish_time;
            console.log("Updated Submission:", submission);
            if (submission.accepted) {
                window.dispatchEvent(
                    new CustomEvent("leetcodeSubmission", {
                        detail: submission
                    })
                );
            }
        } catch (err) {
            console.error("Check Parse Error:", err);
        }
    }

    return response;
};