import { User } from '../models/User';
import { Room } from '../models/Room';
import { Message } from '../models/Message';
import * as config from 'config';

const getAuth = async (id: any, clientID: any) => {
    try {
        const userLogin = await User.findOne({
            client_id: clientID,
            id: id
        }).select('-_id client_id id');
        if (!userLogin) {
            throw new Error('Not found.');
        }
        return userLogin;
    } catch (error) {
      throw new Error(error);
    }
};

const getRoomsOfUserById = async (id: any) => {
    try {
        const rooms = await Room.find({
            $and: [
                {
                    'user_rooms': id
                },
                {
                    'type': 0
                },
            ]
        }).select('_id');
        return rooms;
    } catch (error) {
        console.log(error);
        return [];
    }
};

const saveMessage = async data => {
    try {
        const msg = new Message({
            room_id: data.message.roomID,
            message: data.message.message,
            user_id: data.user.id
        });
        return await msg.save();
    } catch (error) {
        return new Error(error);
    }
};

export {
    getAuth,
    getRoomsOfUserById,
    saveMessage,
};
