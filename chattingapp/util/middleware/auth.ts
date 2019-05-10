import { Request, Response } from 'express';
import Utils from '../utils';
import { Client } from '../../models/Client';
import { User } from '../../models/User';
import * as Http from '../http';
import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export class AuthMiddleWare {
    public async authorizationClient(req: Request, res: Response, next: any) {
        let token;
        try {
            token = Utils.getToken(req);
        } catch (err) {
            return Http.UnauthorizedResponse(res);
        }

        let decoded;
        try {
            decoded = Utils.jwtVerify(token);
        } catch (err) {
            return Http.UnauthorizedResponse(res);
        }

        try {
            const client = await Client.findOne({ '_id': decoded.id });
            if (!client) {
                return Http.UnauthorizedResponse(res);
            }
            next();
        } catch (err) {
            return Http.InternalServerResponse(res);
        }
    }
    public async authorizationUser(req: Request, res: Response, next: any) {
        let token;
        try {
            token = Utils.getToken(req);
        } catch (err) {
            return Http.UnauthorizedResponse(res);
        }

        let decoded;
        try {
            decoded = Utils.jwtVerify(token);
        } catch (err) {
            return Http.UnauthorizedResponse(res);
        }
        try {
            const user = await User.findOne({ id: decoded.id });
            if (!user) {
                return Http.UnauthorizedResponse(res);
            }
            next();
        } catch (err) {
            console.log(err);
            return Http.InternalServerResponse(res);
        }
    }
}
