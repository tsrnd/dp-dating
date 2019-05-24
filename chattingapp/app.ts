import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import * as morgan from 'morgan';
import APIRouter from './routers/api';
import DBConnection from './util/db';
import * as cors from 'cors';

class App {
    private app: express.Application;

    constructor() {
        // create expressjs application
        this.app = express();

        // configure application
        this.config();
        this.setupRouter();
        const db = new DBConnection().connect();
    }

    private config = () => {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(
            '/static',
            express.static(path.join(__dirname, '/../assets'), {
                maxAge: 31557600000
            })
        );
        this.app.use(morgan('combined'));
        this.app.use(cors());
    };

    private setupRouter = () => {
        this.app.use('/api', APIRouter.getRouter());
    };

    public getApp() {
        return this.app;
    }
}

export default new App();
