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
    headers: Record<string, string>;
    body: string;
    statusCode: number;
}

export interface Message<T> {
    action: string;
    key: string;
    value?: T;
}

export interface ClusterMessage {
    action: 'get' | 'set' | 'delete';
    key: string;
    value?: unknown;
}
