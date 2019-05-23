import { Validate } from './../util/validate';
import * as express from 'express';
import * as exampleController from '../http/controllers/example';
import * as userController from '../http/controllers/user_controller';
import * as middleware from '../http/middleware/auth';
import { profileSettingValidator } from '../util/validate';
import * as multer from 'multer';

export const myMulter = multer({limits: {
    fileSize: 10 * 1024 * 1024,  // 10 MB upload limit
    }, storage: multer.memoryStorage()});
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
router.post(
    '/discover/setting',
    middleware.auth,
    userController.postUsersDiscoverSetting
);
router.post(
    '/discover/user',
    middleware.auth,
    Validate.postDiscoverUser,
    userController.postUserDiscover
);
router.post(
    '/profile/setting',
    middleware.auth,
    profileSettingValidator(),
    userController.profileSetting
);
router.post(
    '/profile/setting',
    middleware.auth,
    profileSettingValidator(),
    userController.profileSetting
);
router.post('/user/friend', middleware.auth, userController.addFriend);
router.get('/profile', middleware.auth, userController.getUserProfile);
router.get('/user/friend', middleware.auth, userController.getUserFriend);
router.get('/user/:user_id/profile', userController.getProfileChat);
router.post('/user', middleware.auth, myMulter.single('file'), userController.updateUserProfile);

export default router;
