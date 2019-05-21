import { check } from 'express-validator/check';

export const Rules = {
    createClient: [
        check('name').not().isEmpty().withMessage('Name should NOT be empty'),
        check('account').isLength({ min: 4, max: 16 }).matches('^[a-z][a-z0-9\_]*$'),
        check('secret_key').isLength({ min: 8, max: 16 }),
        check('email').isEmail()
    ],

    authClientLogin: [
        check('account').isLength({ min: 4, max: 16 }).matches('^[a-z][a-z0-9\_]*$'),
        check('secret_key').isLength({ min: 8, max: 16 })
    ],

    authUserLogin: [
        check('id').isInt({ gt: 0 })
    ],

    createUser: [
        check('id').isInt({ gt: 0 }),
        check('nickname').isLength({ min: 4, max: 16 }).matches('^[A-Za-z][A-Za-z0-9\_]*$')
    ],
    getMessage: [
        check('limit').isInt({ gt: 0 }),
        check('since_id').isInt({ gt: -1 })
    ],
    sendMessage: [
        check('message').isLength({ min: 1 })
    ],
    createUserRoom: [
        check('user_id').isInt({ gt: 0 }),
        check('friend_id').isInt({ gt: 0 })
    ]
};
