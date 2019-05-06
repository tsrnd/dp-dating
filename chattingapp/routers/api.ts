import * as express from 'express';
import DBConnection from '../util/db';

class APIRouter {
    private router: express.Router;

    constructor() {
        this.router = express.Router();

        this.setupHandler();
    }

    private setupHandler = () => {
        this.router.get('/', (req, res) => {
            res.end(JSON.stringify({ msg: 'welcome' }));
        });
    };

    getRouter = () => {
        return this.router;
    };
}

export default new APIRouter();
