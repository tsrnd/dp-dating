import { Request, Response } from 'express';
import Room from '../models/room';
import User from '../models/user';
import { Types } from 'mongoose';
import * as config from 'config';



const getFriendsList = async (req: Request, res: Response) => {
    var userID = req.params.userID
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
                    'user_friends.avatar_url': {
                        $ifNull: [
                            '$avatar_url',
                            config.get('default_user_avatar')
                        ]
                    }
                }
            }
        ]);
        const data = await getRoomsAndCheckReadFriendList(users[0])
        // return res.status(200).end(JSON.stringify(data.user_friends));
        return data.user_friends
    } catch (error) {
        console.error(error);
    }
};
const getRoomsAndCheckReadFriendList = async (data: any) => {
    try {
        for (const index of data.user_friends.keys()) {
            var room = await Room.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                "user_rooms": { $elemMatch: { "_id": Types.ObjectId(data._id) } }
                            },
                            {
                                "user_rooms": { $elemMatch: { "_id": Types.ObjectId(data.user_friends[index]._id.toString()) } }
                            },
                            {
                                "type": 1
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
            ])
            if (room) {
                data.user_friends[index].room_id = room[0]._id;
                data.user_friends[index].is_unread = room[0].user_rooms[0].is_unread;
            }
        }
        return data;
    } catch (error) {
        console.error(error);
    }
};

export { getFriendsList };
