import { Request, Response } from 'express';
import * as Http from '../../util/http';
import { User } from '../../models/user';
import { UserFriends } from '../../models/user_friend';
import { SocialUser } from '../../models/social_user';
import * as Httprequest from 'request';
import { generateToken } from '../../util/util';
import S3Handle from '../../util/aws_s3';
import DB from '../../util/db';
import * as config from 'config';
import { FacebookUsers } from '../../models/facebook_user';
import { validationResult } from 'express-validator/check';
import { Op } from 'sequelize';

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
                const userProfile = await User.findByPk(socialUser.dataValues.user_id, {
                    attributes: ['id', 'username', 'nickname', 'profile_picture', 'age', 'gender', 'location', 'income_level', 'occupation', 'ethnic']
                }).catch( err => {
                    return Http.InternalServerResponse(resp);
                });
                resp.json({
                    token: generateToken(socialUser.dataValues.user_id),
                    user: userProfile.dataValues,
                    is_new: false
                });
            } else {
                try {
                    const newUser = await User.create({username: 'fb-' + profile.id, nickname: profile.name, profile_picture: profile.picture.data.url});
                    SocialUser.create({social_id: profile.id, social_type: 'facebook', user_id: newUser.id});
                    FacebookUsers.create({id: profile.id, access_token: req.body.access_token});
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
            return Http.BadRequestResponse(resp, {err: error});
        }
    });
};
const getUserProfile = async (req: Request, res: Response) => {
    const userID = req.headers.auth_user['id'];
    User.findOne({
        where: {
            id: userID
        },
        attributes: ['id', 'username', 'nickname', 'profile_picture', 'age', 'gender', 'location', 'income_level', 'occupation', 'ethnic']
    }).then( (result) => {
        return Http.SuccessResponse(res, result);
    })
    .catch( err => {
        return Http.InternalServerResponse(res);
    });
};

const getUserFriend = async (req: Request, res: Response) => {
    const userID = req.headers.auth_user['id'];
    DB.query({query: `
        SELECT "user"."id", "user"."username", "user"."nickname", "user"."profile_picture"
            FROM "users" as "user"
            INNER JOIN (
                SELECT "user_friends"."friend_id"
                FROM "user_friends"
                WHERE "user_friends"."user_id" = ? AND "user_friends"."status" = 1
                UNION
                SELECT "user_friends"."user_id"
                FROM "user_friends"
                WHERE "user_friends"."friend_id" = ? AND "user_friends"."status" = 1
            ) as "friends" ON "friends"."friend_id" = "user"."id" ORDER BY "friends"."friend_id" DESC LIMIT ?;`,
        values: [userID, userID, 5]
    })
    .then( (result) => {
        return Http.SuccessResponse(res, result[0]);
    })
    .catch( err => {
        return Http.InternalServerResponse(res);
    });
};

const profileSetting = (req: Request, resp: Response) => {
    const userID = req.headers.auth_user['id'];
    const err =  validationResult(req);
    if (!err.isEmpty()) {
        return Http.BadRequestResponse(resp, {errors: err.array()});
    }
    User.update(req.body, {
        where: {
            id: userID
        }
    }).then( (result) => {
        return Http.SuccessResponse(resp, {msg: 'Update profile setting success!'});
    })
    .catch( err => {
        return Http.InternalServerResponse(resp);
    });
};

const addFriend = async (req: Request, res: Response) => {
    const userID = req.headers.auth_user['id'];
    try {
        const friend = await User.findOne({
            attributes: ['id'],
            where: { username: req.body.username }
        });
        if (friend == undefined) {
            return Http.NotFoundResponse(res, {
                msg: 'The user no longer exists.'
            });
        }
        const friendID = friend.dataValues['id'];
        if (friendID == userID) {
            return Http.BadRequestResponse(res, {
                msg: "Can't add friend with your self."
            });
        }
        const isAuthFriend = await UserFriends.findOne({
            attributes: ['id'],
            where: {
                user_id: userID,
                friend_id: friendID
            }
        });
        if (isAuthFriend) {
            return Http.SuccessResponse(res, {
                msg: 'The user has been added earlier.'
            });
        }
        UserFriends.findOne({
            attributes: ['id'],
            where: {
                user_id: friendID,
                friend_id: userID
            }
        }).then(result => {
            if (result) {
                result.update({ status: 1 });
            } else {
                UserFriends.create({
                    user_id: userID,
                    friend_id: friendID
                });
            }
            return Http.SuccessResponse(res, { msg: 'Added Friend Success.' });
        });
    } catch (error) {
        return Http.InternalServerResponse(res);
    }
};

export { getProfileFB, profileSetting , getUserProfile, getUserFriend, addFriend };
