import { query } from 'express-validator/check';
import { check } from 'express-validator/check';

export const Validate = {
    getUsersDiscover: [
        query('min_age')
            .isInt({ gt: 16 })
            .withMessage('min_age should be NOT empty and greater than 16'),
        query('max_age')
            .isInt({ lt: 40 })
            .withMessage('max_age should be NOT empty and less than 40'),
        query('limit')
            .optional()
            .isInt()
            .withMessage('limit should be a integer'),
        query('page')
            .optional()
            .isInt()
            .withMessage('page should be a integer')
    ]
};

export const profileSettingValidator = () => {
    return [
        check('gender')
            .optional({ nullable: true })
            .isLength({ max: 5 }),
        check('age')
            .optional({ nullable: true })
            .isInt()
            .withMessage('Age is invalid!'),
        check('location')
            .optional({ nullable: true })
            .isLength({ max: 100 }),
        check('occupation')
            .optional({ nullable: true })
            .isLength({ max: 255 }),
        check('income_level')
            .optional({ nullable: true })
            .isLength({ max: 100 }),
        check('ethnic')
            .optional({ nullable: true })
            .isLength({ max: 255 })
    ];
};
