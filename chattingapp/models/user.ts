import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    nickname: String;
    active_status: Boolean;
    user_friends?: any;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

const schema: any = new mongoose.Schema({
    nickname: {
        type: String,
        required: true
    },
    active_status: {
        type: Boolean,
        enum: [[true, false], 'Type of status not valid'],
        default: false
    },
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
    deleted_at: Date
});

export default mongoose.model<IUser>('User', schema);
