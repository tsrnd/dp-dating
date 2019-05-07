import { check } from 'express-validator/check';

export const profileSettingValidator = () => {
    return [
        check('gender')
        .optional({nullable: true})
        .isLength({max: 5}),
    check('age')
        .isInt().withMessage('Age must be a number')
        .optional({nullable: true})
        .isLength({max: 2}),
    check('location')
        .optional({nullable: true})
        .isLength({max: 100}),
    check('occupation')
        .optional({nullable: true})
        .isLength({max: 255}),
    check('income_level')
        .optional({nullable: true})
        .isLength({max: 100}),
    check('ethnic')
        .optional({nullable: true})
        .isLength({max: 255})
    ];
};
