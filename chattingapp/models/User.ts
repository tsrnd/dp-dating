import * as mongoose from 'mongoose';
import { Client } from './Client';

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
    img_url: {
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

UserSchema.pre('save', async function(next) {
    let client;
    try {
        client = await Client.findOne({ _id: this.client_id});
    } catch (err) {
        throw new Error('Client.findOne() error');
    }
    client.users.push(this);
    try {
        await client.save();
    } catch (err) {
        throw new Error('Client.save() error');
    }
    next();
});

export const User = mongoose.model('users', UserSchema);
