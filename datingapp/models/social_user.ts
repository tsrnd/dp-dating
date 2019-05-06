import { Model, INTEGER, STRING, TEXT, TIME } from 'sequelize';
import { User } from './user';
import DB from '../util/db';

const sequelize = DB;

export class SocialUser extends Model { }
SocialUser.init({
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        social_id: {
            type: STRING,
            allowNull: false,
        },
        social_type: {
            type: STRING,
            allowNull: false
        },
        user_id: {
            type: INTEGER,
            references: {
                model: User,
                key: 'id'
            }
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
    { sequelize, modelName: 'social_users' }
);

