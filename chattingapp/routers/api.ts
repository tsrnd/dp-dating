import * as express from 'express';
import { Rules } from '../util/rules';
import { AuthMiddleWare } from '../util/middleware/auth';
import { ClientController } from '../controllers/ClientController';
import { AuthController } from '../controllers/AuthController';
import { MessageController } from '../controllers/MessageController';

class APIRouter {
    private router: express.Router;
    private ClientController: ClientController;
    private AuthController: AuthController;
    private AuthMiddleWare: AuthMiddleWare;
    private MessageController: MessageController;

    constructor() {
        this.router = express.Router();
        this.ClientController = new ClientController;
        this.AuthController = new AuthController;
        this.AuthMiddleWare = new AuthMiddleWare;
        this.MessageController = new MessageController;
        this.setupHandler();
    }

    private setupHandler = () => {
        this.router.get('/', (req, res) => {
            res.end(JSON.stringify({ msg: 'welcome' }));
        });
        this.router.post('/auth/register', Rules.createClient, this.ClientController.create);
        this.router.post('/auth/login', Rules.authClientLogin, this.AuthController.clientLogin);
        this.router.use('/clients', this.AuthMiddleWare.authorizationClient);
        this.router.post('/clients/user/login', Rules.authUserLogin, this.ClientController.userLogin);
        this.router.post('/clients/user', Rules.createUser, this.ClientController.createUser);
        this.router.use('/messages', this.AuthMiddleWare.authorizationUser);
        this.router.get('/messages/:roomID', Rules.getMessage, this.MessageController.getMessage);
        this.router.post('/messages/:roomID', Rules.sendMessage, this.MessageController.sendMessage);
    };

    getRouter = () => {
        return this.router;
    };
}

export default new APIRouter();
