import { Request, Response } from 'express';
import * as Http from '../../util/http';
import * as jwt from 'jsonwebtoken';
import * as config from 'config';
import { User } from '../../models/user';

// auth middleware
const auth = (req: Request, res: Response, next: () => void) => {
    const authorizationHeader = req.headers['authorization'];
    if (authorizationHeader == undefined) {
        return Http.UnauthorizedResponse(res);
    }
    const tmps = authorizationHeader.split(/Bearer /);
    if (tmps.length <= 1) return Http.UnauthorizedResponse(res);

    const token = tmps[1];
    try {
        const decoded = jwt.verify(token, config.get('dating_app.jwt.secret_key'));
        User.findByPk(decoded['id'], {
            attributes: ['id']
        })
            .then(user => {
                if (!user) {
                    return Http.UnauthorizedResponse(res);
                }
                // set auth id
                req.headers.auth_user = user.dataValues;
                return next();
            })
            .catch(err => {
                console.error(err);
                return Http.InternalServerResponse(res);
            });
    } catch (err) {
        return Http.UnauthorizedResponse(res);
    }
};

export { auth };
