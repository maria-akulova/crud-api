import { ServerResponse } from 'http';
import { createErrorResponse } from '../utils/errorHandler';

export const notFoundHandler = (res: ServerResponse): void => {
  const errorResponse = createErrorResponse(
    404,
    'Resource not found. URL does not exist',
  );
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(errorResponse));
};

export const serverErrorHandler = (
  res: ServerResponse,
  status: number = 500,
  message: string = 'Internal Server Error',
): void => {
  const errorResponse = createErrorResponse(status, message);
  res.writeHead(status, { 'content-Type': 'application/json' });
  res.end(JSON.stringify(errorResponse));
};
