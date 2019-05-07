import * as jwt from 'jsonwebtoken';
import * as config from 'config';
import { Request, Response } from 'express';
import { Client } from '../../models/Client';
import * as Http from '../../util/http';

 export class AuthMiddleWare {
    public async authorizationClient(req: Request, res: Response, next: any) {
        const token = req.headers.token;
        if (token == undefined) {
            return Http.UnauthorizedResponse(res);
        }
        try {
            const configJwt = config.get('chat_app.jwt');
            const decoded = jwt.verify(token, configJwt.secret_key);
            const client = await Client.findOne({ '_id': decoded.id });
            if (!client) {
                return Http.UnauthorizedResponse(res);
            }
            next();
        } catch (err) {
            return Http.InternalServerResponse(res);
        }
    }
}
