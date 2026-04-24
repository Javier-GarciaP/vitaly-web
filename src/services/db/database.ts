import Database from '@tauri-apps/plugin-sql';
import { MIGRATIONS } from '../../database/migrations';

// Type definition to match tauri-plugin-sql or our remote proxy
interface DBConnection {
    select<T>(query: string, params?: any[]): Promise<T>;
    execute(query: string, params?: any[]): Promise<{ rowsAffected: number; lastInsertId?: number }>;
}

class DatabaseService {
    private static instance: DBConnection | null = null;
    private static initPromise: Promise<DBConnection> | null = null;
    private static getWorkspaceDbName(): string {
        const workspace = localStorage.getItem('vitaly_workspace');
        if (workspace === 'usd') return 'sqlite:vitaly_local_usd.db';
        return 'sqlite:vitaly_local_cop.db';
    }

    private static getWorkspaceApiUrl(): string {
        const workspace = localStorage.getItem('vitaly_workspace');
        if (workspace === 'usd') return 'https://vitaly-web-usd.venezuela.workers.dev';
        return 'https://vitaly-web-cop.venezuela.workers.dev';
    }

    public static isTauri(): boolean {
        return !!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__;
    }

    public static async getDB(): Promise<DBConnection> {
        if (this.instance) return this.instance;

        if (!this.initPromise) {
            this.initPromise = (async () => {
                if (this.isTauri()) {
                    console.log('Initializing Local Database (Tauri)...');
                    try {
                        const db = await Database.load(this.getWorkspaceDbName());
                        await this.runMigrations(db);
                        this.instance = db as any;
                        return db as any;
                    } catch (error) {
                        this.initPromise = null;
                        console.error('Database initialization failed:', error);
                        throw error;
                    }
                } else {
                    console.log('Initializing Remote Database Proxy (Web)...');
                    // We return a proxy object that hits our Cloudflare Worker
                    const webConnection: DBConnection = {
                        select: async <T>(query: string, params?: any[]) => {
                            const settings = JSON.parse(localStorage.getItem('vitaly-settings') || '{}');
                            const apiUrl = settings.apiUrl || this.getWorkspaceApiUrl();
                            const token = settings.apiToken;

                            const res = await fetch(`${apiUrl}/api/db/query`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                },
                                body: JSON.stringify({ sql: query, params })
                            });

                            if (!res.ok) throw new Error(await res.text());
                            const data = (await res.json()) as any;
                            return data.results as T;
                        },
                        execute: async (query: string, params?: any[]) => {
                            // On web, we generally don't want direct execution for safety, 
                            // but for the sake of universality:
                            const settings = JSON.parse(localStorage.getItem('vitaly-settings') || '{}');
                            const apiUrl = settings.apiUrl || this.getWorkspaceApiUrl();
                            const token = settings.apiToken;

                            const res = await fetch(`${apiUrl}/api/db/query`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                },
                                body: JSON.stringify({ sql: query, params })
                            });

                            if (!res.ok) throw new Error(await res.text());
                            const data = (await res.json()) as any;
                            return {
                                rowsAffected: data.meta?.changes || 0,
                                lastInsertId: data.meta?.last_row_id
                            };
                        }
                    };
                    this.instance = webConnection;
                    return webConnection;
                }
            })();
        }
        return this.initPromise;
    }

    private static async runMigrations(db: Database) {
        console.log('Checking migrations...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS _migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version INTEGER NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const result = await db.select<{ version: number }[]>('SELECT MAX(version) as version FROM _migrations');
        const currentVersion = result[0]?.version || 0;

        if (currentVersion < MIGRATIONS.length) {
            for (let i = currentVersion; i < MIGRATIONS.length; i++) {
                const migrationSQL = MIGRATIONS[i];
                try {
                    const version = i + 1;
                    const statements = migrationSQL.split(';').map(s => s.trim()).filter(s => s.length > 0);
                    for (const statement of statements) {
                        try {
                            await db.execute(statement);
                        } catch (stmtError: any) {
                            if (!stmtError?.toString().includes('duplicate column') && !stmtError?.toString().includes('already exists')) {
                                throw stmtError;
                            }
                        }
                    }
                    await db.execute('INSERT INTO _migrations (version) VALUES (?)', [version]);
                } catch (error) {
                    console.error(`Error applying migration ${i + 1}:`, error);
                    throw error;
                }
            }
        }
    }
}

export default DatabaseService;
