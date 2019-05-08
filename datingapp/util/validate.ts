import { query } from 'express-validator/check';

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
