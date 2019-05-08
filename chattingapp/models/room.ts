import * as mongoose from 'mongoose';

export interface IRoom extends mongoose.Document {
    type: Number;
    user_rooms?: any;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

const schema: any = new mongoose.Schema({
    type: {
        type: Number,
        required: true,
        default: 0
    },
    user_rooms: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            is_unread: Number
        }
    ],
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

export default mongoose.model<IRoom>('Room', schema);
