import * as express from 'express';
import * as exampleController from '../http/controllers/example';
import * as userController from '../http/controllers/userController';

const router = express.Router();

router.use((req: express.Request, res: express.Response, next: () => void) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// routes here
router.get('/example', exampleController.index);
router.get('/users', userController.getAllUser);

export default router;
