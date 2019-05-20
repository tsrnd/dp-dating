import * as mongoose from 'mongoose';
import { Counter } from '../models/Counter';

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        min: 1
    },
    message: {
        type: String,
        required: true,
    },
    name: {
        type: String,
    },
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    deleted_at: Date
});

MessageSchema.pre('save', function (next) {
    Counter.findByIdAndUpdate(
        'messages',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
        , (error: any, counter: any) => {
            if (error) {
                next(new mongoose.Error('Counter.findByIdAndUpdate() error'));
            }
            this.id = counter.seq;
            next();
        });
});

export const Message = mongoose.model('messages', MessageSchema);
