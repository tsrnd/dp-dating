import { Request, Response } from 'express';
import * as Http from '../util/http';
import { validationResult } from 'express-validator/check';
import Utils from '../util/utils';
import { User } from '../models/User';
import { Room } from '../models/Room';
import { Message } from '../models/Message';
import * as config from 'config';
import { Types } from 'mongoose';

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
            const room = await Room.findOne({ _id: roomID, 'user_rooms': decoded.id });
            if (!room) {
                return Http.NotFoundResponse(res, { message: 'Room is not found' });
            }
            const message = new Message({
                message: contentMessage,
                user_id: decoded.id,
                room_id: roomID
            });
            message.save();
            return Http.SuccessResponse(res);
        } catch (error) {
            return Http.InternalServerResponse(res);
        }
    }
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
            const room = await Room.findOne({ _id: roomID, 'user_rooms': decoded.id });
            if (!room) {
                return Http.NotFoundResponse(res, { message: 'Room is not found' });
            }
            let cond = {};
            if (sinceID == 0) {
                cond = { id: { $gt: parseInt(sinceID) } };
            } else {
                cond = { id: { $lt: parseInt(sinceID) } };
            }
            const messages = await Message.find({
                $and: [
                    { room_id: Types.ObjectId(roomID) },
                    cond
                ]
            }).limit(parseInt(limit)).sort({ created_at: -1 }).select('-_id message user_id id');
            return Http.SuccessResponse(res, messages);
        } catch (error) {
            return Http.InternalServerResponse(res);

        }
    }
}
