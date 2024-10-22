import { IncomingMessage, ServerResponse } from 'http';
import { HttpMethod } from '../types';
import {
    createUser,
    deleteUser,
    getAllUsers,
    getUserById,
    updateUser,
} from '../controllers/userController';

export const handleUserRoutes = async (
    req: IncomingMessage,
    res: ServerResponse,
    pathname: string,
): Promise<boolean> => {
    const { method } = req;

    if (pathname === '/api/users') {
        switch (method) {
            case HttpMethod.GET:
                await getAllUsers(req, res);
                return true;
            case HttpMethod.POST:
                await createUser(req, res);
                return true;
            default:
                return false;
        }
    }

    if (pathname === '/api/users/error') {
        throw new Error('OOoops, check the api path.');
    }

    const userIdMatch = pathname.match(/^\/api\/users\/([a-f0-9-]+)$/);

    if (userIdMatch) {
        const userId: string = userIdMatch[1];

        switch (method) {
            case HttpMethod.GET:
                await getUserById(req, res, userId);
                return true;
            case HttpMethod.PUT:
                await updateUser(req, res, userId);
                return true;
            case HttpMethod.DELETE:
                await deleteUser(req, res, userId);
                return true;
        }
    }

    return false;
};
