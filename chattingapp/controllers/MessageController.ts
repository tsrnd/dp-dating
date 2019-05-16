import { Request, Response } from 'express';
import * as Http from '../util/http';
import Utils from '../util/utils';
import * as config from 'config';
import { User } from '../models/User';
import { Room } from '../models/Room';
import { Types } from 'mongoose';
import { Message } from '../models/Message';
import { validationResult } from 'express-validator/check';

export class MessageController {
    public async getMessage(req: Request, res: Response, next: any) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Http.BadRequestResponse(res, { errors: errors.array() });
        }
        const token = Utils.getToken(req);
        const decoded = Utils.jwtVerify(token);
        const roomID = req.params.roomID;
        const limit = req.query.limit;
        const sinceID = req.query.since_id;
        try {
            const user = await User.findOne({ id: decoded.id }).select('_id');
            const room = await Room.findOne({ _id: roomID, 'user_rooms._id': user._id });
            if (!room) {
                return Http.NotFoundResponse(res, { message: 'Room is not found' });
            }
            let cond = {};
            if (sinceID <= 0) {
                cond = { id: { $gt: parseInt(sinceID) } };
            } else {
                cond = { id: { $lt: parseInt(sinceID) } };
            }
            const messages = await Message.aggregate([
                {
                    $match: {
                        $and: [
                            { room_id: Types.ObjectId(roomID) },
                            cond
                        ]
                    }
                },
                {
                    $project: {
                        message: 1,
                        user_id: 1,
                        id: 1,
                        created_at: 1,
                    }
                },
                {
                    $lookup:
                    {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user_info'
                    }
                },
                {
                    $project: {
                        message: 1,
                        created_at: 1,
                        id: 1,
                        'user_info._id': 1,
                        'user_info.nickname': 1,
                        'user_info.avatar_url': {
                            $ifNull: [
                                '$avatar_url',
                                config.get('dating_app.default_user_avatar')
                            ]
                        }
                    }
                },
                {
                    $unwind: "$user_info"
                },
                {
                    $limit: parseInt(limit)
                },
                {
                    $sort: { created_at: -1 }
                }
            ]);
            return Http.SuccessResponse(res, messages);
        } catch (error) {
            return Http.InternalServerResponse(res);

        }
    }
}
