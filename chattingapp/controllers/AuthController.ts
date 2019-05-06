import { Request, Response } from 'express';
import { Client } from '../models/Client';
import { Md5 } from 'md5-typescript';
import { validationResult } from 'express-validator/check';
import * as jwt from 'jsonwebtoken';
import * as config from 'config';
import * as Http from '../util/http';

export class AuthController {
    public async clientLogin(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Http.BadRequestResponse(res, { errors: errors.array() });
        }
        const params = req.body;
        try {
            const client =  await Client.findOne({
                'account': params.account,
                'secret_key': Md5.init(params.secret_key)
            }).select('_id');
            if (!client) {
                return Http.UnauthorizedResponse(res);
            }

             // Generate token
            const configJwt = config.get('jwt');
            const token = jwt.sign({id: client._id}, configJwt.secret_key, {
                expiresIn: configJwt.expired
            });
            return Http.SuccessResponse(res, {token: token});
        } catch {
            return Http.InternalServerResponse(res);
        }
    }
}
