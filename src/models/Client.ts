import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const Client = new Schema({
    name: {
        type: String,
        required: [true, 'Missing name']
    },
    account: {
        type: String,
        minlength: [4, 'Account shout NOT be shooter than 4 characters'],
        maxlength: [16, 'Account shout NOT be longer than 16 characters']
    },
    secret_key: {
        type: String,
        required: [true, 'Missing secret_key']
    },
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
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
    }
});

export default Client;
