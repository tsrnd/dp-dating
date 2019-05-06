import * as jwt from 'jsonwebtoken';
import * as config from 'config';

export const generateToken = (user_id): any => {
    // create a token
    const token = jwt.sign(
        { id: user_id },
        config.get('jwt.secret_key'),
        {
            expiresIn: config.get('jwt.expired')
        }
    );
    return token;
};


// export const parseToken = (token): any => {
//     try {
//         const decoded = jwt.verify(token, 'secret');
//         User.findOne({ _id: decoded.id })
//             .then(user => {
//                 if (!user) {
//                     return Http.UnauthorizedResponse(res);
//                 }
//                 // set auth id
//                 req.headers.auth_user = user;
//                 return next();
//             })
//             .catch(err => {
//                 console.error(err);
//                 return Http.InternalServerResponse(res);
//             });
//     } catch (err) {
//         console.log(err);
//         return Http.UnauthorizedResponse(res);
//     }
//     return user_id;
// };