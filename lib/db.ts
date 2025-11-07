import { Pool, PoolClient } from 'pg';

// Singleton pattern for database connection pool
class DatabasePool {
  private static instance: Pool | null = null;

  static getInstance(): Pool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : undefined,
        max: 20, // Maximum pool size
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 10000, // Return error after 10 seconds if no connection available
      });

      // Handle pool errors
      DatabasePool.instance.on('error', (err) => {
        console.error('Unexpected database pool error:', err);
      });
    }

    return DatabasePool.instance;
  }

  static async query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
    const pool = DatabasePool.getInstance();
    const result = await pool.query(text, params);
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0
    };
  }

  static async getClient(): Promise<PoolClient> {
    const pool = DatabasePool.getInstance();
    return pool.connect();
  }

  static async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await DatabasePool.getClient();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Clean shutdown
  static async end(): Promise<void> {
    if (DatabasePool.instance) {
      await DatabasePool.instance.end();
      DatabasePool.instance = null;
    }
  }
}

export const db = DatabasePool;
export default db;
