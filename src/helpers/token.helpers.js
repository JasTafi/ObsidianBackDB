import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';

//Generar un token temporal con un maximo de 12 caracteres
function TemporaryToken() {

  // Generar un uuid
  const uuidValue = uuidv4();

  // Encriptar el uuid con jwt y limitar a 12 caracteres
  const token = jwt.sign({ uuid: uuidValue }, "process.env.SECRET", { expiresIn: "3h" }).substring(0, 12);

  return token
}

//autentifica al usuario recibiendo el token enviado
function Authenticate(req, res, next){
  const authHeader = req.headers['authorization'];
// Si token existe, recuperarlo, sacarle los espacios y comienza de la primera posición
  const token = authHeader && authHeader.split(" ")[1];

  if(!token) 
    return res.status(404).json({
      ok: false,
      error_msg: 'Usuario no autorizado: sin token'
    });

// Si el token existe, lo verifico
    jwt.verify(token, process.env.SECRET, (error) => {
      if(error){
        return res.status(404).json({
          ok: false,
          error_msg: 'Usuario no autorizado: token inválido'
        });
      }

      next();
    });
} 

export { Authenticate, TemporaryToken };