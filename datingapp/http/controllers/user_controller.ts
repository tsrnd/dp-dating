import { Request, Response } from 'express';
import * as Http from '../../util/http';
import { User } from '../../models/user';
import { SocialUser } from '../../models/social_user';
import * as Httprequest from 'request';
import { generateToken } from '../../util/util';
import S3Handle from '../../util/aws_s3';
import DB from '../../util/db';
import * as config from 'config';
import { FacebookUsers } from '../../models/facebook_user';
import { UserFriends } from '../../models/user_friend';
import { identifier } from 'babel-types';

const getProfileFB = (req: Request, resp: Response) => {
    const options = {
        url: config.get('api.facebook.profile_url'),
        method: 'GET',
        qs: {
            fields: 'id,name',
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
                resp.json({
                    token: generateToken(socialUser.dataValues.user_id),
                    is_new: false
                });
            } else {
                try {
                    const newUser = await User.create({
                        username: 'facebook' + profile.id
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
        console.error(error);
        return Http.InternalServerResponse(res);
    }
};

const uploadProfileImg = (req: Request, resp: Response) => {
    const params = {
        Bucket: 'test-bucket',
        Body: req.file.buffer,
        Key: 'users/' + Date.now() + req.file.originalname
    };
    S3Handle.S3Client.putObject(params, (err, data) => {
        // handle error
        if (err) {
            console.log('Error', err);
            return Http.InternalServerResponse(resp);
        }
        // success
        console.log('Uploaded');
        S3Handle.S3Client.getSignedUrl('getObject', {Bucket: params.Bucket, Key: params.Key}, (err, url) => {
            console.log(err, url);
        });
        return Http.SuccessResponse(resp, { msg: 'Uploaded!' });
    });
};

export { getProfileFB, addFriend, uploadProfileImg };
