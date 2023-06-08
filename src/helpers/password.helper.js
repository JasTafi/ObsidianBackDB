import bcrypt from "bcrypt";

const saltRounds = parseInt(process.env.SALT_ROUND); // saltos de codificación guardada en archivo env

// Encripta el password del usuario
async function Encrypt(password) {
  return bcrypt.hash(password, saltRounds); 
};

// compara los los password encriptado 
async function Compare(password, hash) {
  return await bcrypt.compare(password, hash)
};

export { Compare, Encrypt };