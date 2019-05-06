import { Request, Response } from 'express';
import * as Http from '../../util/http';
import { User } from '../../models/user';
import { SocialUser } from '../../models/social_user';
import * as Httprequest from 'request';
import { generateToken } from '../../util/util';
import DB from '../../util/db';
import * as config from 'config';
import { FacebookUsers } from '../../models/facebook_user';

const getProfileFB = (req: Request, resp: Response) => {
    const options = {
        url: config.get('api.facebook.profile_url'),
        method: 'GET',
        qs: {
            fields: 'id,name',
            access_token: req.body.access_token
        }
    };
    Httprequest(options, async function (error, response, body) {
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
                    const newUser = await User.create({username: 'facebook' + profile.id});
                    SocialUser.create({social_id: profile.id, social_type: 'facebook', user_id: newUser.id});
                    FacebookUsers.create({id: profile.id, access_token: req.body.access_token});
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

export { getProfileFB };
