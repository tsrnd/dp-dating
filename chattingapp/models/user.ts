import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    client_id: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'Missing client_id']
    },
    id: {
        type: Number,
        required: [true, 'Missing id']
    },
    nickname: {
        type: String,
        required: [true, 'Missing nickname'],
        minlength: [4, 'Nickname NOT be less than 4 characters'],
        maxlength: [20, 'Nickname NOT be more than 20 characters']
    },
    avatar_url: {
        type: String,
    },
    active_status: {
        type: Boolean,
        enum: [[true, false], 'Type of status not valid'],
        default: false
    },
    rooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }],
    user_friends: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            status: Number
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
    deleted_at: {
        type: Date,
        default: undefined
    }
});

export const User = mongoose.model('users', UserSchema);