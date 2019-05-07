import * as express from 'express';
import { Rules } from '../util/rules';
import { ClientController } from '../controllers/ClientController';
import { AuthController } from '../controllers/AuthController';

class APIRouter {
    private router: express.Router;
    private ClientController: ClientController;
    private AuthController: AuthController;

    constructor() {
        this.router = express.Router();
        this.ClientController = new ClientController;
        this.AuthController = new AuthController;
        this.setupHandler();
    }

    private setupHandler = () => {
        this.router.get('/', (req, res) => {
            res.end(JSON.stringify({ msg: 'welcome' }));
        });
        this.router.post('/auth/register', Rules.createClient, this.ClientController.create);
        this.router.post('/auth/login', Rules.authClientLogin, this.AuthController.clientLogin);
    };

    getRouter = () => {
        return this.router;
    };
}

export default new APIRouter();
