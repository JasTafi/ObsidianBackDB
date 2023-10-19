import express from "express";
import { GetAllRegister } from "../controllers/registerProductsController";

const router = express.Router();

router.get('/registro', GetAllRegister);

export default router