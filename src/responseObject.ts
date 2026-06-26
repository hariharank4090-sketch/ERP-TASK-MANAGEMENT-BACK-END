// responseHelpers.ts
import type { Response, Request } from 'express';

interface Others {
    [key: string]: any;
}

interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T[];
    others?: Others;
}

export function success<T = any>(
    res: Response,
    message = 'Done!',
    data: T[] = [],
    others: Others = {}
): Response<ApiResponse<T>> {
    return res.status(200).json({
        data,
        message,
        success: true,
        others: { ...others },
    });
}

export function dataFound<T = any>(
    res: Response,
    data: T[] = [],
    message = 'Data Found',
    others: Others = {}
): Response<ApiResponse<T>> {
    return res.status(200).json({
        data,
        message,
        success: true,
        others: { ...others },
    });
}

export function noData(
    res: Response,
    message = 'No data',
    others: Others = {}
): Response<ApiResponse> {
    return res.status(200).json({
        data: [],
        message,
        success: true,
        others: { ...others },
    });
}

export function failed(
    res: Response,
    message = 'Something Went Wrong! Please Try Again',
    others: Others = {}
): Response<ApiResponse> {
    return res.status(400).json({
        data: [],
        message,
        success: false,
        others: { ...others },
    });
}

export function servError(
    e: any,
    res: Response,
    message = 'Request Failed',
    others: Others = {}
): Response<ApiResponse> {
    const req: Request | undefined = res.req;

    const safeBody: Record<string, any> = { ...(req?.body ?? {}) };
    for (const key of ['password', 'token', 'otp']) {
        if (key in safeBody) safeBody[key] = '[redacted]';
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

export function invalidInput(
    res: Response,
    message = 'Invalid request',
    others: Others = {}
): Response<ApiResponse> {
    return res.status(400).json({
        data: [],
        message,
        success: false,
        others: { ...others },
    });
}

export function notFound(
    res: Response,
    message = 'Not Found',
    others: Others = {}
): Response<ApiResponse> {
    return res.status(404).json({
        data: [],
        message,
        success: false,
        others: { ...others },
    })
}

export function invalidCredentials(
    res: Response,
    message = 'Invalid credentials',
    others: Others = {}
): Response<ApiResponse> {
    return res.status(401).json({
        data: [],
        message,
        success: false,
        others: { ...others },
    })
}

export function sentData<T = any>(
    res: Response,
    data: T[] = [],
    others: Others = {}
): void {
    if (data.length > 0) {
        dataFound(res, data, 'Data Found', others);
    } else {
        noData(res, 'No data', others);
    }
}

export function Unauthorized(
    res: Response,
    message = 'Invalid request',
    others: Others = {}
): Response<ApiResponse> {
    return res.status(400).json({
        data: [],
        message,
        success: false,
        others: { ...others },
    });
}

export function created(
    res: Response,
    data?: any,
    message = 'Created',
    others: Others = {},
): Response<ApiResponse> {
    return res.status(201).json({
        data: [data],
        message,
        success: true,
        others: { ...others },
    });
}

export function updated(
    res: Response,
    data?: any,
    message: string = 'Changes saved',
    others: Others = {}
): Response<ApiResponse> {
    return res.status(data ? 200 : 204).json({
        data: [data],
        message,
        success: true,
        others: { ...others },
    });
}

export function deleted(
    res: Response,
    message = 'Deleted',
    others: Others = {}
): Response<ApiResponse> {
    return res.status(200).json({
        data: [],
        message,
        success: true,
        others: { ...others },
    });
}