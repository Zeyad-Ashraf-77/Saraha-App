import  express  from "express";
import { bootstrap } from "./src/app.controller.js";
import 'dotenv/config'

const app = express();

bootstrap(app, express);
