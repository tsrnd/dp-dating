import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserRoomSchema = new Schema({
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    user_id: [],
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

export const UserRoom = mongoose.model('user_room', UserRoomSchema);
