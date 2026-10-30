function errorHandler(err, req, res , next) {
    console.error(err);
    const requestedStatus = Number(err.status || err.statusCode);
    const status = Number.isInteger(requestedStatus)
        && requestedStatus >= 400
        && requestedStatus < 500
        ? requestedStatus
        : 500;

    res.status(status).json({
        message: status === 500 ? "Internal server error" : err.message
    });
}

export default errorHandler;
