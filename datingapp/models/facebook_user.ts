import { Model, INTEGER, STRING, TEXT, TIME } from 'sequelize';
import DB from '../util/db';

const sequelize = DB;

export class FacebookUsers extends Model { }
FacebookUsers.init({
        id: {
            type: STRING,
            primaryKey: true,
        },
        access_token: {
            type: STRING,
            allowNull: false,
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
    { sequelize, modelName: 'facebook_users' }
);

