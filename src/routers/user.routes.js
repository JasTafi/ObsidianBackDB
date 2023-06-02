import express from "express";
import { AddUser, Login, AddFavoriteProduct, GetFavoriteProduct } from "../controllers/user.controller"
import { Authenticate } from "../helpers/token.helpers";

const router = express.Router();

router.post("/user/add", AddUser); //Agrega el registro de un nuevo usuario
router.get("/user/login", Login); //Logea un usuario Registrado
router.post("/user/favorites", Authenticate, AddFavoriteProduct); //Agrega un producto a la lista de favoritos de un usuario
router.get("/user/favorites/:userId", Authenticate, GetFavoriteProduct); // Muestra la lista de productos favoritos de un usuario

export default router;