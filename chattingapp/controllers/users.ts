import { Request, Response } from 'express';
import { Room } from '../models/Room';
import { User } from '../models/User';
import { Types } from 'mongoose';
import * as config from 'config';
import * as Http from '../util/http';
import Utils from '../util/utils';

const getFriendsList = async (req: Request, res: Response) => {
    const token = Utils.getToken(req);
    const decoded = Utils.jwtVerify(token);
    const user = await User.findOne({ id: decoded.id }).select('_id');
    const userID = user._id;
    try {
        const rooms = await Room.aggregate([
            {
                $match: {
                    $and: [
                        {
                            'user_rooms': { $elemMatch: { '_id': Types.ObjectId(userID) } }
                        },
                        {
                            'type': 0
                        },
                    ]
                }

            },
            {
                $project: {
                    _id: 1,
                    type: 1,
                    user_rooms: {
                        $filter: {
                            input: '$user_rooms',
                            as: 'user_room',
                            cond: {
                                $ne: ['$$user_room._id', Types.ObjectId(userID)]
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_rooms._id',
                    foreignField: '_id',
                    as: 'user_rooms'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    'user_rooms._id': 1,
                    'user_rooms.nickname': 1,
                    'user_rooms.img_url': {
                        $ifNull: [
                            '$img_url',
                            config.get('dating_app.default_user_avatar')
                        ]
                    }
                }
            }
        ]);
        const data = await getRoomsAndCheckReadFriendList(rooms, userID);
        const users: any = [];
        for (let index = 0; index < rooms.length; index++) {
            users.push(data[index].user_rooms[0]);
        }
        return Http.SuccessResponse(res, users);

    } catch (error) {
        return Http.InternalServerResponse(res);
    }
};


const getRoomsAndCheckReadFriendList = async (data: any, userID: string) => {
    try {
        for (const index of data.keys()) {
            const room = await Room.aggregate([
                {
                    $match: { _id: Types.ObjectId(data[index]._id) }
                },
                {
                    $project: {
                        _id: 1,
                        type: 1,
                        user_rooms: {
                            $filter: {
                                input: '$user_rooms',
                                as: 'user_room',
                                cond: {
                                    $eq: ['$$user_room._id', Types.ObjectId(userID)]
                                }
                            }
                        }
                    }
                }
            ]);
            if (room.length >= 1) {
                data[index].user_rooms[0].id_room = room[0]._id;
                data[index].user_rooms[0].is_unread = room[0].user_rooms[0].is_unread;
            }
        }
        return data;
    } catch (error) {
        return Http.InternalServerResponse(error);
    }
};

export { getFriendsList };
