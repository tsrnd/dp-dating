import { Request, Response } from 'express';
import * as Http from '../util/http';
import { validationResult } from 'express-validator/check';
import Utils from '../util/utils';
import { User } from '../models/User';
import { Room } from '../models/Room';
import { Message } from '../models/Message';

export class MessageController {
    public async sendMessage(req: Request, res: Response, next: any) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Http.BadRequestResponse(res, { errors: errors.array() });
        }
        const roomID = req.params.roomID;
        const token = Utils.getToken(req);
        const decoded = Utils.jwtVerify(token);
        const contentMessage = req.body.message;
        try {
            const user = await User.findOne({ id: decoded.id }).select('_id');
            const room = await Room.findOne({ _id: roomID, 'user_rooms._id': user._id });
            if (!room) {
                return Http.NotFoundResponse(res, { message: 'Room is not found' });
            }
            const message = new Message({
                message: contentMessage,
                user_id: user._id,
                room_id: roomID
            });
            message.save();
            return Http.SuccessResponse(res);
        } catch (error) {
            return Http.InternalServerResponse(res);
        }
    }
}
