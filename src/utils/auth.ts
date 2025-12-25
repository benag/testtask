import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../types';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: Omit<User, 'password_hash'>): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    preferred_language: user.preferred_language,
  };
  
  const secret = config.jwt.secret;
  const options: SignOptions = { expiresIn: config.jwt.expiresIn as any };
  
  return jwt.sign(payload, secret, options);
};
