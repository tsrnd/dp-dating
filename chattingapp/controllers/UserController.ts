import { Request, Response } from 'express';
import * as Http from '../util/http';
import Utils from '../util/utils';
import { User } from '../models/User';
import { Room } from '../models/Room';
import * as config from 'config';

export class UserController {
    public async getDirectRooms(req: Request, res: Response, next: any) {
        const token = Utils.getToken(req);
        const decoded = Utils.jwtVerify(token);
        const user = await User.findOne({ id: decoded.id }).select('id');
        const userID = user.id;
        try {
            const rooms = await Room.find({
                $and: [
                    {
                        'user_rooms': userID
                    },
                    {
                        'type': 0
                    },
                ]
            }).select('_id user_rooms');
            return Http.SuccessResponse(res, rooms);
        } catch (error) {
            return Http.InternalServerResponse(res);
        }
    }
}
