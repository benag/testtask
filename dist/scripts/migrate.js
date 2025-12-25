"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../config/database"));
async function runMigrations() {
    const migrationsDir = path_1.default.join(__dirname, '../../migrations');
    try {
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
        const migrationFiles = fs_1.default.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();
        console.log(`Found ${migrationFiles.length} migration files`);
        for (const file of migrationFiles) {
            const result = await database_1.default.query('SELECT id FROM migrations WHERE filename = $1', [file]);
            if (result.rows.length > 0) {
                console.log(`⏭️  Skipping ${file} (already executed)`);
                continue;
            }
            console.log(`🔄 Running migration: ${file}`);
            const migrationPath = path_1.default.join(migrationsDir, file);
            const migrationSQL = fs_1.default.readFileSync(migrationPath, 'utf8');
            const client = await database_1.default.connect();
            try {
                await client.query('BEGIN');
                await client.query(migrationSQL);
                await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
                await client.query('COMMIT');
                console.log(`✅ Completed migration: ${file}`);
            }
            catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
            finally {
                client.release();
            }
        }
        console.log('🎉 All migrations completed successfully');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}
if (require.main === module) {
    runMigrations()
        .then(() => {
        console.log('Migration process completed');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Migration process failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=migrate.js.map