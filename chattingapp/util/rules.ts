import { check } from 'express-validator/check';

export const Rules = {
    createClient: [
        check('name').not().isEmpty().withMessage('Name should NOT be empty'),
        check('account').isLength({min: 4, max: 16}).matches('^[a-z][a-z0-9\_]*$'),
        check('secret_key').isLength({min: 8, max: 16}),
        check('email').isEmail()
    ],

    authClientLogin: [
        check('account').isLength({min: 4, max: 16}).matches('^[a-z][a-z0-9\_]*$'),
        check('secret_key').isLength({min: 8, max: 16})
    ]
};
