import registerProductSchema from "../models/registerProducts";

const maxRegister = 10;

async function GetAllRegister(req, res) {
  const { page } = req.query;
  try {
    const registro = await registerProductSchema
      .find()
      .skip(maxRegister * (page - 1))
      .limit(maxRegister);
    return res.status(200).json({
      ok: true,
      data: registro,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      ex: error,
    });
  }
}
export {GetAllRegister}