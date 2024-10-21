import { createServer, IncomingMessage, ServerResponse } from 'http';
import {  getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser} from './controllers/userController';
import * as process from 'node:process';
import { config } from 'dotenv';

config();
const PORT: string | 3001 = process.env.PORT || 3001;

const requestHandler = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const { method, url } = req;
    if (url === `/api/users` && method === 'GET') {
      return await getAllUsers(req, res);
    }
    if (url === `/api/users` && method === 'POST') {
      return await createUser(req, res);
    }
    const userIdMatch = url?.match(/^\/api\/users\/([a-f0-9-]+)$/);
    if (userIdMatch) {
      const userId = userIdMatch[1];
      if (method === 'GET') {
        return await getUserById(req, res, userId);
      }
      if (method === 'PUT') {
        return await updateUser(req, res, userId);
      }
      if (method === 'DELETE') {
        return await deleteUser(req, res, userId);
      }
    }
  } catch {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not found' }));
  }
};

const server = createServer(requestHandler);

server.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));