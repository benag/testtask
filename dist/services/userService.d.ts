import { User, RegisterRequest } from '../types';
export declare class UserService {
    createUser(userData: RegisterRequest): Promise<Omit<User, 'password_hash'>>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserById(id: string): Promise<Omit<User, 'password_hash'> | null>;
    updateUserLanguage(userId: string, language: string): Promise<void>;
    getAllUsers(): Promise<Omit<User, 'password_hash'>[]>;
    getUserStats(): Promise<{
        total_users: number;
        total_admins: number;
    }>;
}
//# sourceMappingURL=userService.d.ts.map