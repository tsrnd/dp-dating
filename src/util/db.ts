import * as mongoose from 'mongoose';

const CS_CS_DB_DRIVER = process.env.CS_CS_DB_DRIVER || 'mongodb';
const CS_DB_HOST = process.env.CS_DB_HOST || 'localhost';
const CS_DB_NAME = process.env.CS_DB_NAME || 'mydb';
const CS_DB_PORT = process.env.CS_DB_PORT || '27017';
const CS_DB_USER = process.env.CS_DB_USER || 'myuser';
const CS_DB_PASSWORD = process.env.CS_DB_PASSWORD || 'mypass';

class DBConnection {
    connect() {
        mongoose.connect(
            `${CS_CS_DB_DRIVER}://${CS_DB_USER}:${CS_DB_PASSWORD}@${CS_DB_HOST}:${CS_DB_PORT}/${CS_DB_NAME}`,
            {
                useNewUrlParser: true,
                useCreateIndex: true
            }
        );
        const db = mongoose.connection;
        db.on('error', (err: any) => {
            console.error('Connect error: ', err);
        });
        db.once('open', function () {
            console.log('Mongodb connected success.');
        });
    }
}

export default DBConnection;
