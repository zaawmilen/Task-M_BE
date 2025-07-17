import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  role: string;
}

export const generateToken = (userId: string, role: string): string => {
  const payload: TokenPayload = {
    userId,
    role,
  };

  const secret = process.env.JWT_SECRET || 'default_jwt_secret';

  // Token expires in 1 day (adjust as needed)
  return jwt.sign(payload, secret, { expiresIn: '1d' });
};
