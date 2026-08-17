import { askQuestion as askQuestionApi } from "../services/api.js";

function QuestionInput({
    uploaded,
    question,
    setQuestion,
    asking,
    setAsking,
    queryError,
    setQueryError,
    handleQueryResult
}) {
    const askQuestion = async () => {
        if (!uploaded) {
            setQueryError("Please upload a PDF first");
            return;
        }

        if (question.trim() === "") {
            setQueryError("Please ask a question");
            return;
        }

        setQueryError("");
        setAsking(true);

        try {
            const data = await askQuestionApi(question);

            handleQueryResult(data);

            setQuestion("");

            // console.log(data);

        } catch (error) {
            setQueryError(error.message);
            // console.log("Query failed:", error);

        } finally {
            setAsking(false);
        }
    };

    return (
        <div>
            <h2>Ask a Question</h2>

            <label htmlFor="question">
                Ask a question about the document:
            </label>

            <input
                id="question"
                type="text"
                value={question}
                maxLength={500}
                disabled={!uploaded || asking}
                onChange={(event) => {
                    setQuestion(event.target.value);
                }}
                placeholder="Ask something about the document..."
            />

            <p>
                Characters: {question.length} / 500
            </p>

            <button
                onClick={askQuestion}
                disabled={!uploaded || asking}
            >
                {asking ? "Asking..." : "Ask Question"}
            </button>

            {queryError && (
                <p>
                    Error: {queryError}
                </p>
            )}
        </div>
    );
}

export default QuestionInput;