import { useState } from "react";

import DocumentUpload from "./components/DocumentUpload";
import QuestionInput from "./components/QuestionInput";
import Answer from "./components/Answer";
import Sources from "./components/Sources";
import "./App.css";

function App() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [uploadError, setUploadError] = useState("");
    const [uploaded, setUploaded] = useState(false);

    const [question, setQuestion] = useState("");
    const [asking, setAsking] = useState(false);
    const [answer, setAnswer] = useState("");
    const [queryError, setQueryError] = useState("");
    const [sources, setSources] = useState([]);

    const handleNewDocument = () => {
        setAnswer("");
        setSources([]);
        setQueryError("");
        setQuestion("");
        setResult(null);
        setUploaded(false);
    };

    const handleUploadResult = (data) => {
        setResult(data);
        setUploaded(true);
        setFile(null);
    };

    const handleQueryResult = (data) => {
        setAnswer(data.answer);
        setSources(data.sources ?? []);
    };

    return (
        <div className="app">

            <header className="header">
                <h1>RAG DOCUMENT Q&A</h1>
                <p>Upload a document and ask questions about it.</p>
            </header>

            <main className="container">

                <section className="card">
                    <DocumentUpload
                        file={file}
                        setFile={setFile}
                        uploaded={uploaded}
                        uploadError={uploadError}
                        setUploadError={setUploadError}
                        result={result}
                        handleNewDocument={handleNewDocument}
                        handleUploadResult={handleUploadResult}
                    />
                </section>

                <section className="card">
                    <QuestionInput
                        uploaded={uploaded}
                        question={question}
                        setQuestion={setQuestion}
                        asking={asking}
                        setAsking={setAsking}
                        queryError={queryError}
                        setQueryError={setQueryError}
                        handleQueryResult={handleQueryResult}
                    />
                </section>

                <section className="card">
                    <Answer
                        answer={answer}
                    />
                </section>

                <section className="card">
                    <Sources
                        answer={answer}
                        sources={sources}
                    />
                </section>

            </main>

        </div>
    );
}

export default App;