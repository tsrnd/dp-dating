import { Model, INTEGER, STRING, TEXT, TIME, SMALLINT } from 'sequelize';
import DB from '../util/db';

const sequelize = DB;

export class User extends Model { }
User.init({
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: STRING,
            allowNull: false,
            unique: true,
        },
        nickname: {
            type: STRING
        },
        profile_picture: {
            type: STRING,
        },
        age: {
            type: SMALLINT
        },
        gender: {
            type: STRING
        },
        income_level: {
            type: STRING
        },
        location: {
            type: STRING
        },
        occupation: {
            type: STRING
        },
        ethnic: {
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
    { sequelize, modelName: 'users' }
);

