import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import {dirnameFromImportMetaUrl} from './util/pathUtil.js';
const __dirname = dirnameFromImportMetaUrl(import.meta.url);

import socketInitialize from './controllers/socketController.js';

import authRoutes from './routes/auth.js';

// Env Variables
const PORT = process.env.port || 8000;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

if (!MONGO_USER || !MONGO_PASSWORD || !MONGO_DB_NAME || !JWT_SECRET_KEY) {
	console.log('Please, Provide all Environment Variables!');
	process.exit();
}

const app = express();

app.use(express.static('./public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, PATCH, DELETE'
	);
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

app.use('/auth', authRoutes);

// catch-all url for react Browser Route in public folder.
app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
});

// Common Error Handler
app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message: message, data: data });
});

mongoose
	.connect(
		`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.cyqzh.mongodb.net/${MONGO_DB_NAME}?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
		}
	)
	.then((result) => {
		const expressServer = app.listen(PORT, () => {
			console.log(`Server running on port: ${PORT} ...`);
		});

		socketInitialize(expressServer);
	})
	.catch((err) => console.log(err));
