"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.dataFound = dataFound;
exports.noData = noData;
exports.failed = failed;
exports.servError = servError;
exports.invalidInput = invalidInput;
exports.notFound = notFound;
exports.invalidCredentials = invalidCredentials;
exports.sentData = sentData;
exports.Unauthorized = Unauthorized;
exports.created = created;
exports.updated = updated;
exports.deleted = deleted;
function success(res, message = 'Done!', data = [], others = {}) {
    return res.status(200).json({
        data,
        message,
        success: true,
        others: { ...others },
    });
}
function dataFound(res, data = [], message = 'Data Found', others = {}) {
    return res.status(200).json({
        data,
        message,
        success: true,
        others: { ...others },
    });
}
function noData(res, message = 'No data', others = {}) {
    return res.status(200).json({
        data: [],
        message,
        success: true,
        others: { ...others },
    });
}
function failed(res, message = 'Something Went Wrong! Please Try Again', others = {}) {
    return res.status(400).json({
        data: [],
        message,
        success: false,
        others: { ...others },
    });
}
function servError(e, res, message = 'Request Failed', others = {}) {
    const req = res.req;
    const safeBody = { ...(req?.body ?? {}) };
    for (const key of ['password', 'token', 'otp']) {
        if (key in safeBody)
            safeBody[key] = '[redacted]';
    }
    const durationMs = res.locals.startedAt
        ? Number(process.hrtime.bigint() - res.locals.startedAt) / 1e6
        : undefined;
    console.error({
        level: 'error',
        msg: 'request_failed',
        method: req?.method,
        url: req?.originalUrl,
        baseUrl: req?.baseUrl,
        route: req?.route?.path || '',
        params: req?.params,
        query: req?.query,
        body: safeBody,
        stack: e.stack,
        actualError: e,
    });
    return res.status(500).json({
        success: false,
        data: [],
        message,
        others: {
            ...others,
            requestId: res.locals.requestId,
            durationMs,
            Error: e,
        },
    });
}
function invalidInput(res, message = 'Invalid request', others = {}) {
    return res.status(400).json({
        data: [],
        message,
        success: false,
        others: { ...others },
    });
}
function notFound(res, message = 'Not Found', others = {}) {
    return res.status(200).json({
        data: [],
        message,
        success: false,
        others: { ...others },
    });
}
function invalidCredentials(res, message = 'Invalid credentials', others = {}) {
    return res.status(401).json({
        data: [],
        message,
        success: false,
        others: { ...others },
    });
}
function sentData(res, data = [], others = {}) {
    if (data.length > 0) {
        dataFound(res, data, 'Data Found', others);
    }
    else {
        noData(res, 'No data', others);
    }
}
function Unauthorized(res, message = 'Invalid request', others = {}) {
    return res.status(400).json({
        data: [],
        message,
        success: false,
        others: { ...others },
    });
}
function created(res, data, message = 'Created', others = {}) {
    return res.status(201).json({
        data: [data],
        message,
        success: true,
        others: { ...others },
    });
}
function updated(res, data, message = 'Changes saved', others = {}) {
    return res.status(data ? 200 : 204).json({
        data: [data],
        message,
        success: true,
        others: { ...others },
    });
}
function deleted(res, message = 'Deleted', others = {}) {
    return res.status(200).json({
        data: [],
        message,
        success: true,
        others: { ...others },
    });
}
