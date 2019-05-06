import * as jwt from 'jsonwebtoken';
import * as config from 'config';
import { Request, Response } from 'express';
import { Client } from '../../models/Client';

export class AuthMiddleWare {
    public async authorizationClient(req: Request, res: Response, next: any) {
        const token = req.headers.token;
        if (token == undefined) {
            res.status(401).end();
        }
        try {
            const configJwt = config.get('jwt');
            const decoded = jwt.verify(token, configJwt.secret_key);
            const client = await Client.findOne({ '_id': decoded.id });
            if (!client) {
                res.status(401).end();
            }
            next();
        } catch (err) {
            res.status(500).end();
        }
    }
}
