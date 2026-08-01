import bcrypt from "bcrypt";

export const gethashedPassword = async (password) => {
  return await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));
};

export const comparePssword = async (password , hashpassword) => {
  return await bcrypt.compare(password, hashpassword);
};


