import { IncomingMessage, ServerResponse } from 'node:http';
import { handleUserRoutes } from '../routes/userRoute'; 
import { notFoundHandler, serverErrorHandler } from './routeHandlers';

export const requestHandler = async (
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  try {
    // Here I set CORS-Headers only as a bonus in case this API might be used in browser applications
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // This is to allow to work on different protocols and access `/api/users` either with our without ending `/`
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
