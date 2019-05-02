import { Request, Response } from 'express';
import * as Http from '../../util/http';

const index = (req: Request, res: Response) => {
    return Http.SuccessResponse(res, JSON.stringify({ msg: 'welcome' }));
};

export { index };
