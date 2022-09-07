import dotenv from 'dotenv';
import express from 'express';

function dotEnv(app: express.Application) {
	dotenv.config();
}

export { dotEnv };
