import { Model, INTEGER, STRING, TEXT, TIME } from 'sequelize';
import DB from '../util/db';
import { User } from './user';

const sequelize = DB;

export class UserDiscovers extends Model {}
UserDiscovers.init(
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
        user_discover_id: {
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
    { sequelize, modelName: 'user_discover' }
);
