import * as config from 'config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

class Utils {
    private jwt_expired: any;
    private jwt_secret: string;

    public getToken (req: Request): string {
        const authorization = req.header('Authorization');
        if (authorization.startsWith('Bearer ')) {
            return authorization.substring(7);
        }
        throw new Error('Token invalid');
    }

    public jwtVerify(token: string): any {
        return jwt.verify(token, this.jwt_secret);
    }

    public jwtGenerateToken(data: any): string {
        return jwt.sign(data, this.jwt_secret, { expiresIn: this.jwt_expired });
    }

    constructor() {
        const configJwt: any = config.get('chat_app.jwt');
        this.jwt_expired = configJwt.expired;
        this.jwt_secret = configJwt.secret_key;
    }
}

export default new Utils;
