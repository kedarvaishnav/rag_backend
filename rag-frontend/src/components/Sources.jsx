function Sources({ answer, sources }) {
    if (!answer) {
        return null;
    }

    if (sources.length === 0) {
        return (
            <p>
                No sources were returned.
            </p>
        );
    }

    return (
        <div>
            <h2>Sources</h2>

            <p>
                Sources: {sources.length}
            </p>

            <ul>
                {sources.map((source, index) => (
                    <li key={source.id}>
                        <p>
                            <strong>
                                Source {index + 1}
                            </strong>
                        </p>

                        <p>
                            Relevance: {source.score}
                        </p>

                        <p>
                            Chunk: {source.payload.chunkIndex}
                        </p>

                        <p>
                            {source.payload.text}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Sources;