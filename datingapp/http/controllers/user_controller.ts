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
        url: config.get('api.facebook.profile_url'),
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
                );
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
                    if (error) {
                        return Http.InternalServerResponse(resp);
                    }
                }
            }
        }
    });
};

const postUsersDiscoverSetting = async () => {};

const getUsersDiscoverSetting = async (req: Request, resp: Response) => {
    try {
        const result = await DiscoverSetting.findOne({
            where: {
                user_id: req.headers.auth_user['id']
            }
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
    discoverCondition.push({
        age: {
            [Op.and]: [
                { [Op.gte]: req.query.min_age },
                { [Op.lte]: req.query.max_age }
            ]
        },
        id: { [Op.notIn]: req.headers.auth_user['id'] }
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

export { getProfileFB, getUsersDiscover, getUsersDiscoverSetting };
