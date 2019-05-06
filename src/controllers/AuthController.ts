import { Request, Response } from 'express';
import { Client } from '../models/Client';
import { Md5 } from 'md5-typescript';
import { validationResult } from 'express-validator/check';
import * as jwt from 'jsonwebtoken';
import * as config from 'config';
export class AuthController {
    public async clientLogin(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }).end();
        }
        const params = req.body;
        try {
            const client =  await Client.findOne({
                'account': params.account,
                'secret_key': Md5.init(params.secret_key)
            }).select('_id');
            if (!client) {
                return res.status(404).end();
            }

            // Generate token
            const configJwt = config.get('jwt');
            const token = jwt.sign({id: client._id}, configJwt.secret_key, {
                expiresIn: configJwt.expired
            });
            res.json({token: token}).end();
        } catch {
            return res.status(500).end();
        }
    }
}
