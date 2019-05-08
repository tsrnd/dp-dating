import * as jwt from 'jsonwebtoken';
import * as config from 'config';

export const generateToken = (user_id): any => {
    // create a token
    const token = jwt.sign(
        { id: user_id },
        config.get('dating_app.jwt.secret_key'),
        {
            expiresIn: config.get('dating_app.jwt.expired')
        }
    );
    return token;
};
