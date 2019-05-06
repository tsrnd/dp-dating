import { Client } from '../models/Client';
import { validationResult } from 'express-validator/check';
import { Md5 } from 'md5-typescript';
import { Request, Response } from 'express';
import * as Http from '../util/http';

export class ClientController {
    public async create(req: Request, res: Response, next: any) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Http.BadRequestResponse(res, { errors: errors.array() });
        }
        const params = req.body;
        const client = await Client.findOne({ account: params.account });
        if (client) {
            return Http.BadRequestResponse(res, {message: 'Account already exist'});
        }
        try {
            await Client.create({
                name: params.name,
                account: params.account,
                email: params.email,
                secret_key: Md5.init(params.secret_key)
            });
            const response = {
                name: params.name,
                account: params.account
            };
            return Http.SuccessResponse(res, response);
        } catch (err) {
            return Http.InternalServerResponse(res);
        }
    }
}
