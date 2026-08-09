const health = (req, res) => {
    res.json({
        status: "OK"
    });
};

const version = (req, res) => {
    res.json({
        version: "1.0.0"
    });
};

export { health, version };