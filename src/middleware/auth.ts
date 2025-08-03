import jwt from "jsonwebtoken";

const secretKey = "soiskfdlsfq2931i20jk";

const verifyToken = (req: any, res: any, next: any) => {
  const token = req.cookies?.token;
  console.log("cookie token:", token);

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('JWT Error:', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export default verifyToken;
