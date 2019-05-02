import { Request, Response } from 'express';
import * as Http from '../../util/http';
import { User } from '../../models/user';

const getAllUser = async (req: Request, res: Response) => {
     const users = await User.findAll({
        attributes: ['id', 'username', 'nickname']
    }).catch( err => {
        return Http.InternalServerResponse(res);
    });
    return Http.SuccessResponse(res, {users: users});
};

export { getAllUser };
