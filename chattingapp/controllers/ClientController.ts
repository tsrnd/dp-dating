import { Client } from '../models/Client';
import { validationResult } from 'express-validator/check';
import { Md5 } from 'md5-typescript';
import { Request, Response } from 'express';

export class ClientController {
    public async create(req: Request, res: Response, next: any) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }).end();
        }
        const params = req.body;
        const client = await Client.findOne({ name: params.name });
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
            const response = {
                name: params.name,
                account: params.account
            };
            return res.json(response).end();
        } catch (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}
