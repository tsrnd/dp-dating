import { Client } from '../models/Client';
import { validationResult } from 'express-validator/check';
import { Md5 } from 'md5-typescript';
import { Request, Response } from 'express';
import * as Http from '../util/http';
import Utils from '../util/utils';
import * as jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { UserRoom } from '../models/UserRoom';
import { Room } from '../models/Room';

export class ClientController {
    public async create(req: Request, res: Response, next: any) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Http.BadRequestResponse(res, { errors: errors.array() });
        }
        const params = req.body;
        const client = await Client.findOne({ account: params.account });
        if (client) {
            return Http.BadRequestResponse(res, {
                message: 'Account already exist'
            });
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
        let tokenClient: string;
        try {
            tokenClient = Utils.getTokenClient(req);
        } catch (err) {
            return Http.UnauthorizedResponse(res);
        }
        const decoded: any = jwt.decode(tokenClient, { complete: true });
        const clientID: string = decoded.payload.id;
        const userID: Number = req.body.id;
        try {
            const userLogin = await User.findOne({
                client_id: clientID,
                id: userID
            }).select('-_id client_id id nickname img_url');
            if (!userLogin) {
                return Http.NotFoundResponse(res, {
                    message: 'User not found'
                });
            }
            try {
                const tokenChat: string = Utils.jwtGenerateToken(
                    userLogin.toJSON()
                );
                return Http.SuccessResponse(res, { token: tokenChat });
            } catch (err) {
                return Http.InternalServerResponse(res);
            }
        } catch (err) {
            return Http.InternalServerResponse(res);
        }
    }

    public async createUser(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Http.BadRequestResponse(res, { errors: errors.array() });
        }
        let tokenClient: string;
        try {
            tokenClient = Utils.getTokenClient(req);
        } catch (err) {
            return Http.UnauthorizedResponse(res);
        }
        const decoded: any = jwt.decode(tokenClient, { complete: true });
        const clientID: string = decoded.payload.id;
        const params: any = req.body;
        try {
            const user = await User.findOne({
                client_id: clientID,
                id: params.id
            });
            if (user) {
                return Http.BadRequestResponse(res, {
                    message: 'User already exist'
                });
            }
            const userCreate = {
                client_id: clientID,
                id: params.id,
                nickname: params.nickname,
                img_url: params.img_url
            };
            await User.create(userCreate);

            const tokenChat: string = Utils.jwtGenerateToken(userCreate);
            return Http.SuccessResponse(res, { token: tokenChat });
        } catch (err) {
            return Http.InternalServerResponse(res);
        }
    }

    public async createUserRoom(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Http.BadRequestResponse(res, { errors: errors.array() });
        }
        let tokenClient: string;
        try {
            tokenClient = Utils.getTokenClient(req);
        } catch (err) {
            return Http.UnauthorizedResponse(res);
        }
        const room = await Room.findOne({ $or: [ { name: 'room' + req.body.user_id + req.body.friend_id  }, { name: 'room' + req.body.friend_id + req.body.user_id } ] });
        if (room) {
            return Http.SuccessResponse(res, {msg: 'Room has been created'});
        }
        try {
            const newRoom = await Room.create({'name': 'room' + req.body.user_id + req.body.friend_id});
            const userRoomCreate = {
                room_id: newRoom._id,
                user_id: [ req.body.user_id,  req.body.friend_id ]
            };
            const newUserRoom = await UserRoom.create(userRoomCreate);
        } catch (error) {
            return Http.InternalServerResponse(res);
        }
        // UserRoom.create(req.body);
        return Http.SuccessResponse(res);
    }
}
