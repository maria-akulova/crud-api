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
    if (method === HttpMethod.GET) {
      await getAllUsers(req, res);
      return true;
    }
    if (method === HttpMethod.POST) {
      await createUser(req, res);
      return true;
    }
  }

  // ! This is only to test statusCode: 500 (ref: Technical requirements, Term 4)
  /** Errors on the server side that occur during the processing of a request should be handled and processed correctly (server should
   *  answer with status code `500` and corresponding human-friendly message)
   *
   *  - Please follow the conditional path, and you will have `statusCode: 500` */

  if (pathname === '/api/users/error') {
    throw new Error('Test error');
  }
  // ! End Of Test statusCode: 500

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