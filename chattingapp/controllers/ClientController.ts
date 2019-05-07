import { Client } from '../models/Client';
import { validationResult } from 'express-validator/check';
import { Md5 } from 'md5-typescript';
import { Request, Response } from 'express';
import * as Http from '../util/http';
import * as jwt from 'jsonwebtoken';
import { User } from '../models/User';
import * as config from 'config';

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

    public async userLogin(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Http.BadRequestResponse(res, { errors: errors.array() });
        }
        const tokenClient = req.headers.token;
        const userID = req.body.id;
        const clientID = jwt.decode(tokenClient, { complete: true }).payload.id;
        try {
            const userLogin = await User.findOne({id: userID}).select('-_id client_id id nickname img_url');
            if (!userLogin) {
                return Http.NotFoundResponse(res, {message: 'User not found'});
            }

            // Generate token
            const configJwt = config.get('chat_app.jwt');
            const tokenChat = jwt.sign(userLogin, configJwt.secret_key, {
                expiresIn: configJwt.expired
            });
            return Http.SuccessResponse(res, {token: tokenChat});
        } catch (err) {
            return Http.InternalServerResponse(res, err);
        }
    }

    public async createUser(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Http.BadRequestResponse(res, { errors: errors.array() });
        }
        const tokenClient = req.headers.token;
        const clientID = jwt.decode(tokenClient, { complete: true }).payload.id;
        const params = req.body;
        try {
            const user = await User.findOne({id: params.id});
            if (user) {
                return Http.BadRequestResponse(res, {message: 'User already exist'});
            }
            const userCreate = {
                client_id: clientID,
                id: params.id,
                nickname: params.nickname,
                img_url: params.img_url
            }
            await User.create(userCreate);

            // Generate token
            const configJwt = config.get('chat_app.jwt');
            const tokenChat = jwt.sign(userCreate, configJwt.secret_key, {
                expiresIn: configJwt.expired
            });
            return Http.SuccessResponse(res, {token: tokenChat});
        } catch (err) {
            return Http.InternalServerResponse(res);
        }
    }
}
