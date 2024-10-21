export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export interface RequestMessage {
  method: string | undefined;
  url: string | null;
  headers: Record<string, string>;
}

export interface ResponseMessage {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export interface Message<T> {
  action: string;
  key: string;
  value?: T;
}