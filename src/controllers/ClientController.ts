import { Client } from '../models/Client';
import { validationResult } from 'express-validator/check';
import { Md5 } from 'md5-typescript';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from '../models/User';
import * as config from 'config';

export class ClientController {
    public async create(req: Request, res: Response, next: any) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }).end();
        }
        var params = req.body;
        var client = await Client.findOne({ name: params.name });
        if (client) {
            return res.status(400).json({message: 'Name already exist'}).end();
        }
        try {
            await Client.create({
                name: params.name,
                account: params.account,
                email: params.email,
                secret_key: Md5.init(params.secret_key)
            });
            var response = {
                name: params.name,
                account: params.account
            }
            return res.json(response).end();
        } catch (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    public async userLogin(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }).end();
        }
        let tokenClient = req.headers.token;
        let userID = req.body.id;
        let clientID = jwt.decode(tokenClient, { complete: true }).payload.id;
        try {
            const user = await User.findOne({id: userID});
            if(!user) {
                res.status(404).json({message: 'User not found'});
            }

            // Generate token
            const configJwt = config.get('jwt');
            var tokenChat = jwt.sign({user: userID, client: clientID}, configJwt.secret_key, {
                expiresIn: configJwt.expired
            });
            res.json({token: tokenChat}).end();
        } catch (err) {
            res.status(500).json({message: 'Internal Server Error'});
        }
    }
}
