import express from "express";
import { AddUser, Login, AddFavoriteProduct, GetFavoriteProduct, DeleteFavoriteById, UpdateUser, EmailVerification, ModifyPassword } from "../controllers/user.controller"
import { Authenticate } from "../helpers/token.helpers";

const router = express.Router();
router.use(express.json());

//Agrega el registro de un nuevo usuario
router.post("/user/add", AddUser); 

//Modificar un usuario por id
router.put("/user/:id", Authenticate, UpdateUser);

//Logea un usuario Registrado
router.post("/user/login", Login); 

//Verficar email, para recupero de contraseña
router.post("/user/email/verification", EmailVerification);

//Modificación de contraseña
router.put("/user/password/modify", ModifyPassword);

//Agrega un producto a la lista de favoritos de un usuario
router.post("/user/favorites", Authenticate, AddFavoriteProduct);

// Muestra la lista de productos favoritos de un usuario
router.get("/user/favorites/:userId", Authenticate, GetFavoriteProduct); 

// Borra un producto por id de la lista de favorito
router.put("/user/favorites/:userId", Authenticate, DeleteFavoriteById);

export default router;