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
        const users = await User.aggregate([
            {
                $match: { _id: Types.ObjectId(userID) }
            },
            {
                $project: {
                    _id: 1,
                    nickname: 1,
                    user_friends: {
                        $filter: {
                            input: '$user_friends',
                            as: 'user_friend',
                            cond: {
                                $eq: ['$$user_friend.status', 1]
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_friends._id',
                    foreignField: '_id',
                    as: 'user_friends'
                }
            },
            {
                $project: {
                    _id: 1,
                    nickname: 1,
                    'user_friends._id': 1,
                    'user_friends.nickname': 1,
                    'user_friends.active_status': 1,
                    'user_friends.img_url': {
                        $ifNull: [
                            '$img_url',
                            config.get('dating_app.default_user_avatar')
                        ]
                    }
                }
            }
        ]);
        const data = await getRoomsAndCheckReadFriendList(users[0]);
        return Http.SuccessResponse(res, data.user_friends);
    } catch (error) {
        return Http.InternalServerResponse(res);
    }
};
const getRoomsAndCheckReadFriendList = async (data: any) => {
    try {
        for (const index of data.user_friends.keys()) {
            const room = await Room.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                'user_rooms': { $elemMatch: { '_id': Types.ObjectId(data._id) } }
                            },
                            {
                                'user_rooms': { $elemMatch: { '_id': Types.ObjectId(data.user_friends[index]._id.toString()) } }
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
                                    $eq: ['$$user_room._id', Types.ObjectId(data._id)]
                                }
                            }
                        }
                    }
                },
            ]);
            if (room.length >= 1) {
                data.user_friends[index].room_id = room[0]._id;
                data.user_friends[index].is_unread = room[0].user_rooms[0].is_unread;
            }
        }
        return data;
    } catch (error) {
        return Http.InternalServerResponse(error);
    }
};
export { getFriendsList };
