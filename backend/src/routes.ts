import express from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const routes = express.Router();
const upload = multer(multerConfig);

routes.get('/items', ItemsController.index);
routes.get('/points', PointsController.index);
routes.get('/points/:id', PointsController.show);
routes.post('/points', upload.single('image'), PointsController.create);

export default routes;
