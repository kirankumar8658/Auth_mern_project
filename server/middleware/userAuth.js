import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.SECRET);
    if (tokenDecode.id) {
      req.userId = tokenDecode.id;   // ✅ safer place to attach user id
    } else {
      return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default userAuth;
