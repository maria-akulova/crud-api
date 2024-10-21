import 'dotenv/config';
import { createServer } from 'node:http';
import { requestHandler } from './middleware/requestHandler';

const PORT = Number(process.env.PORT) || 4000;

export const server = createServer(requestHandler);

server.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));