import { Model, INTEGER, STRING, TEXT } from 'sequelize';
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
    }
},
    { sequelize, modelName: 'users' }
);

