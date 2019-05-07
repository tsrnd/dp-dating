import { Response } from 'express';

export let InternalServerResponse = (
    res: Response,
    data: any = {message: 'Internal Server Error'}
) => {
    res.status(500).end(JSON.stringify(data));
};

export let BadRequestResponse = (
    res: Response,
    data: any = {message: 'Bad Request'}
) => {
    res.status(400).end(JSON.stringify(data));
};

export let UnauthorizedResponse = (
    res: Response,
    data: any = {message: 'Unauthorized'}
) => {
    res.status(401).end(JSON.stringify(data));
};

export let ForbiddenResponse = (
    res: Response,
    data: any = {message: 'Forbidden'}
) => {
    res.status(403).end(JSON.stringify(data));
};

export let SuccessResponse = (res: Response, data: any = undefined) => {
    res.status(200).end(JSON.stringify(data));
};

export let NotFoundResponse = (
    res: Response,
    data: any = {message: 'Not Found'}
) => {
    res.status(400).end(JSON.stringify(data));
};
