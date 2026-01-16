import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class TokenService {
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateRandomCode(length = 6) {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)).toString();
  }

  isTokenExpired(expiresAt) {
    return new Date() > new Date(expiresAt);
  }

  verifyToken(token, secret) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }

  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}

export default new TokenService();