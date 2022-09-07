import * as jwt from 'jsonwebtoken';

const sign = async (payload: any, secret: string, options: any) => {
	const token = await jwt.sign(payload, secret, options);
	return token;
};

const verify = async (token: string, secret: string) => {
	const decoded = await jwt.verify(token, secret);
	return decoded;
};

export { sign, verify };