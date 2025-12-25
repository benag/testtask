import { Pool } from 'pg';
declare const pool: Pool;
export declare function queryWithRetry(text: string, params?: any[], retries?: number): Promise<any>;
export default pool;
//# sourceMappingURL=database.d.ts.map