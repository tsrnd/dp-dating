import { Model, INTEGER, STRING, TEXT, TIME } from 'sequelize';
import DB from '../util/db';
import { User } from './user';

const sequelize = DB;

export class DiscoverSetting extends Model {}
DiscoverSetting.init(
    {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: INTEGER,
            references: {
                model: User,
                key: 'id'
            }
        },
        request: {
            type: STRING
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
    { sequelize, modelName: 'discover_settings' }
);
