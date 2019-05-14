import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    type: {
        type: Number,
        required: true,
        default: 0
    },
    name: {
        type: String,
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

export const Room = mongoose.model('rooms', RoomSchema);
