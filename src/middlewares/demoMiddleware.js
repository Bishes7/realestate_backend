export const blockDemoUser = (req, res, next) => {
  if (req.userInfo && req.userInfo.isDemo) {
    return res(403).json({ message: "Action disabled for Demo user" });
  }
  next();
};
