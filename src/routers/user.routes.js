import express from "express";
import { AddUser, Login, AddFavoriteProduct, GetFavoriteProduct } from "../controllers/user.controller"
import { Authenticate } from "../helpers/token.helpers";

const router = express.Router();
router.use(express.json());

//Agrega el registro de un nuevo usuario
router.post("/user/add", AddUser); 

//Logea un usuario Registrado
router.post("/user/login", Login); 

//Agrega un producto a la lista de favoritos de un usuario
router.post("/user/favorites", Authenticate, AddFavoriteProduct);

// Muestra la lista de productos favoritos de un usuario
router.get("/user/favorites/:userId", Authenticate, GetFavoriteProduct); 

export default router;