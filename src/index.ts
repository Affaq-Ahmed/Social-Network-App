import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
/**
 * @description
 * This is the main entry point of the application.
 * It is responsible for setting up the application
 * and starting the server.
 */
import { logger } from './middleware/logger/index';

import { dotEnv } from './startup/dotenv';
import { mongoConnection } from './startup/database';
import { gatherRoutes } from './startup/routes';

const app = express();

dotEnv(app);

if (!process.env.PORT) {
	process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

gatherRoutes(app);
mongoConnection();

const server = app.listen(PORT, (): void => {
	logger.info(`Server listening on port ${PORT}`);
});

import socket from './startup/socket';
const io = socket.init(server);

io.on('connection', () => {
	console.log('a user connected');
});
