import { IncomingMessage, ServerResponse } from 'node:http';
import { handleUserRoutes } from '../routes/usersRoute'; 
import { notFoundHandler, serverErrorHandler } from './routeHandlers';

export const requestHandler = async (
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const protocol: string | string[] =
      req.headers['x-forwarded-proto'] || 'http';
    const url = new URL(req.url || '', `${protocol}://${req.headers.host}`);
    const pathname: string = url.pathname.replace(/\/$/, '');

    const isHandled: boolean = await handleUserRoutes(req, res, pathname);
    if (!isHandled) {
      notFoundHandler(res);
      return;
    }
  } catch {
    serverErrorHandler(res);
  }
};
