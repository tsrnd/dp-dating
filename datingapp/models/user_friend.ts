import { Model, INTEGER, STRING, TEXT, TIME, SMALLINT } from 'sequelize';
import DB from '../util/db';

const sequelize = DB;

export class UserFriends extends Model { }
UserFriends.init({
        id: {
            type: STRING,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: INTEGER,
            allowNull: false,
        },
        friend_id: {
            type: INTEGER,
            allowNull: false,
        },
        status: {
            type: SMALLINT,
            defaultValue: 0
        },
        created_at: {
            type: TIME
        },
        updated_at: {
            type: TIME
        },
        deleted_at: {
            type: TIME
        }
    },
    { sequelize, modelName: 'user_friends' }
);

