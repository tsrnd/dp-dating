import { Validate } from './../util/validate';
import * as express from 'express';
import * as exampleController from '../http/controllers/example';
import * as userController from '../http/controllers/user_controller';
import * as middleware from '../http/middleware/auth';
import { profileSettingValidator } from '../util/validate';

const router = express.Router();

router.use((req: express.Request, res: express.Response, next: () => void) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// routes here
router.get('/example', exampleController.index);
router.post('/facebook/profile', userController.getProfileFB);
router.get(
    '/users/discover',
    middleware.auth,
    Validate.getUsersDiscover,
    userController.getUsersDiscover
);
router.get(
    '/discover/setting',
    middleware.auth,
    userController.getUsersDiscoverSetting
);
router.post('/profile/setting', middleware.auth, profileSettingValidator(), userController.profileSetting);

export default router;
