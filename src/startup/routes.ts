import express from 'express';
import authRoute from '../routes/auth';
import userRoute from '../routes/user';

function gatherRoutes(app: express.Application) {
	app.use('/auth', authRoute);
	app.use('/user', userRoute);
}

export { gatherRoutes };
