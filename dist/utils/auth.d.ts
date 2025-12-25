import { User } from '../types';
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
export declare const generateToken: (user: Omit<User, "password_hash">) => string;
//# sourceMappingURL=auth.d.ts.map