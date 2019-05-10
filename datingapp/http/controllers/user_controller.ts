import { UserDiscovers } from './../../models/user_discover';
import { Request, Response } from 'express';
import * as Http from '../../util/http';
import { User } from '../../models/user';
import { SocialUser } from '../../models/social_user';
import * as Httprequest from 'request';
import { generateToken } from '../../util/util';
import * as util from 'util';
import * as config from 'config';
import { FacebookUsers } from '../../models/facebook_user';
import { Op } from 'sequelize';
import { validationResult } from 'express-validator/check';
import { DiscoverSetting } from '../../models/discover_setting';

const getProfileFB = (req: Request, resp: Response) => {
    const options = {
        url: config.get('dating_app.api.facebook.profile_url'),
        method: 'GET',
        qs: {
            fields: 'id,name,picture.width(500).height(500)',
            access_token: req.body.access_token
        }
    };
    Httprequest(options, async function(error, response, body) {
        if (!error && response.statusCode == 200) {
            const profile = JSON.parse(body);
            const socialUser = await SocialUser.findOne({
                attributes: ['user_id'],
                where: {
                    social_id: profile.id,
                    social_type: 'facebook'
                }
            });
            if (socialUser) {
                const userProfile = await User.findByPk(
                    socialUser.dataValues.user_id,
                    {
                        attributes: [
                            'id',
                            'username',
                            'nickname',
                            'profile_picture',
                            'age',
                            'gender',
                            'location',
                            'income_level',
                            'occupation',
                            'ethnic'
                        ]
                    }
                ).catch(err => {
                    return Http.InternalServerResponse(resp);
                });
                resp.json({
                    token: generateToken(socialUser.dataValues.user_id),
                    user: userProfile.dataValues,
                    is_new: false
                });
            } else {
                try {
                    const newUser = await User.create({
                        username: 'fb-' + profile.id,
                        nickname: profile.name,
                        profile_picture: profile.picture.data.url
                    });
                    SocialUser.create({
                        social_id: profile.id,
                        social_type: 'facebook',
                        user_id: newUser.id
                    });
                    FacebookUsers.create({
                        id: profile.id,
                        access_token: req.body.access_token
                    });
                    resp.json({
                        token: generateToken(newUser.id),
                        user: newUser,
                        is_new: true
                    });
                } catch (error) {
                    return Http.InternalServerResponse(resp);
                }
            }
        } else {
            return Http.BadRequestResponse(resp, { err: error });
        }
    });
};

const postUsersDiscoverSetting = async (req: Request, resp: Response) => {
    // handle vaidate later
    try {
        await DiscoverSetting.create({
            user_id: req.headers.auth_user['id'],
            request: JSON.stringify({
                min_age: req.body.min_age,
                gender: req.body.gender,
                max_age: req.body.max_age,
                location: req.body.location,
                occupation: req.body.occupation
            })
        });
        return Http.SuccessResponse(resp, { msg: 'success' });
    } catch (error) {
        console.error(error);
        return Http.InternalServerResponse(resp);
    }
};

const getUsersDiscoverSetting = async (req: Request, resp: Response) => {
    try {
        const result = await DiscoverSetting.findOne({
            where: {
                user_id: req.headers.auth_user['id']
            },
            order: [['id', 'DESC']]
        });
        if (result) {
            return Http.SuccessResponse(
                resp,
                JSON.parse(result.dataValues.request)
            );
        }
        return Http.NotFoundResponse(resp);
    } catch (error) {
        console.log(error);
    }
};

const getUsersDiscover = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return Http.BadRequestResponse(res, { errors: errors.array() });
    }

    const discoverCondition: any = [];
    if (req.query.gender) {
        discoverCondition.push({
            gender: {
                [Op.like]: util.format('%%%s%%', req.query.gender)
            }
        });
    }
    if (req.query.location) {
        discoverCondition.push({
            location: { [Op.like]: util.format('%%%s%%', req.query.location) }
        });
    }
    if (req.query.occupation) {
        discoverCondition.push({
            occupation: {
                [Op.like]: util.format('%%%s%%', req.query.occupation)
            }
        });
    }

    let nonDiscoverList: any;
    try {
        nonDiscoverList = await UserDiscovers.findAll({
            where: {
                user_id: req.headers.auth_user['id']
            },
            attributes: ['user_discover_id'],
            raw: true
        });
    } catch (error) {
        console.error(error);
        return Http.InternalServerResponse(res);
    }

    const nonDiscoverListID = [];
    nonDiscoverList.forEach((element: any) => {
        nonDiscoverListID.push(element.user_discover_id);
    });

    discoverCondition.push({
        age: {
            [Op.and]: [
                { [Op.gte]: req.query.min_age },
                { [Op.lte]: req.query.max_age }
            ]
        },
        id: {
            [Op.or]: {
                [Op.notIn]: req.headers.auth_user['id'],
                [Op.notIn]: nonDiscoverListID
            }
        }
    });

    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const page = req.query.page ? Number(req.query.page) : 1;
    try {
        const results = await User.findAndCountAll({
            attributes: [
                'id',
                'username',
                'nickname',
                'profile_picture',
                'age',
                'gender',
                'income_level',
                'location',
                'occupation',
                'ethnic',
                'created_at'
            ],
            where: {
                [Op.and]: discoverCondition
            },
            limit: limit,
            offset: limit * (page - 1)
        });
        const responses: any = {
            total_count: results.count,
            limit: limit,
            page: page,
            results: results.rows,
            req: req.query
        };
        return Http.SuccessResponse(res, responses);
    } catch (error) {
        return Http.InternalServerResponse(res);
    }
};

const postUserDiscover = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return Http.BadRequestResponse(res, { errors: errors.array() });
    }

    let targetUser: any;
    try {
        targetUser = await User.findOne({
            where: { id: req.body.user_id },
            attributes: ['id']
        });
        if (!targetUser) {
            return Http.NotFoundResponse(res);
        }
    } catch (error) {
        Http.InternalServerResponse(res);
    }

    try {
        await UserDiscovers.create({
            user_discover_id: req.body.user_id,
            user_id: req.headers.auth_user['id']
        });
        return Http.SuccessResponse(res, { msg: 'success' });
    } catch (error) {
        console.error(error);
        return Http.InternalServerResponse(res);
    }
};

const profileSetting = (req: Request, resp: Response) => {
    const userID = req.headers.auth_user['id'];
    const err = validationResult(req);
    if (!err.isEmpty()) {
        return Http.BadRequestResponse(resp, { errors: err.array() });
    }
    User.update(req.body, {
        where: {
            id: userID
        }
    })
        .then(result => {
            return Http.SuccessResponse(resp, {
                msg: 'Update profile setting success!'
            });
        })
        .catch(err => {
            return Http.InternalServerResponse(resp);
        });
};

export {
    getProfileFB,
    profileSetting,
    getUsersDiscover,
    getUsersDiscoverSetting,
    postUserDiscover,
    postUsersDiscoverSetting
};
