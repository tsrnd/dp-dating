import * as express from 'express';
import { Rules } from '../util/rules';
import { ClientController } from '../controllers/ClientController';
class APIRouter {
    private router: express.Router;
    private ClientController: ClientController;
    constructor() {
        this.router = express.Router();
        this.ClientController = new ClientController;
        this.setupHandler();
    }

    private setupHandler = () => {
        this.router.get('/', (req, res) => {
            res.end(JSON.stringify({ msg: 'welcome' }));
        });
        this.router.post('/auth/register', Rules.createClient, this.ClientController.create);
    };

    getRouter = () => {
        return this.router;
    };
}

export default new APIRouter();
