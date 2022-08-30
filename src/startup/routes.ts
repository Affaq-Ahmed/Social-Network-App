import express from 'express';
import authRoute from '../routes/auth';

function gatherRoutes(app: express.Application) {
	app.use('/auth', authRoute);
}

export { gatherRoutes };
