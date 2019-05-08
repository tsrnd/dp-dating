import * as express from 'express';
import * as exampleController from '../http/controllers/example';
import * as userController from '../http/controllers/user_controller';
import { auth } from '../http/middleware/auth';
import { profileSettingValidator } from '../util/validate';

const router = express.Router();

router.use((req: express.Request, res: express.Response, next: () => void) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// routes here
router.get('/example', exampleController.index);
router.post('/facebook/profile', userController.getProfileFB);
router.post('/user/friend', auth, userController.addFriend);
router.post('/profile/setting', auth, profileSettingValidator(), userController.profileSetting);

export default router;
