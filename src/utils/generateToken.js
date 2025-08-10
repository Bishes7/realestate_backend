import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  // token sign
  const token = jwt.sign({ userId }, process.env.JWT_SECRETKEY, {
    expiresIn: "30d",
  });

  // set jwt as HTTP-only cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;
