interface ErrorResponse {
    status: number;
    message: string;
}

export const createErrorResponse = (status: number, message: string): ErrorResponse => ({
    status,
    message,
});
