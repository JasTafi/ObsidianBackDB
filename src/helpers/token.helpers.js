import jwt from "jsonwebtoken";

//autentifica al usuario recibiendo el token enviado
function Authenticate(req, res, next){
  const authHeader = req.headers['authorization'];
// Si token existe, recuperarlo, sacarle los espacios y comienza de la primera posición
  const token = authHeader && authHeader.split(" ")[1];

  if(!token) 
    return res.status(404).json({
      ok: false,
      error_msg: 'Usuario no autorizado primer if'
    });

// Si el token existe, lo verivico
    jwt.verify(token, 'mi secreto', (error, payload) => {
      if(error){
        return res.status(404).json({
          ok: false,
          error_msg: 'Usuario no autorizado segudo if'
        });
      }

      next();
    });
} 

export { Authenticate };