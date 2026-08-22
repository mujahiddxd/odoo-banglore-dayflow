import mysql from 'mysql2/promise';

async function reset() {
  const db = await mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'dayflow'
  });

  console.log('Dropping tables...');
  await db.execute('SET FOREIGN_KEY_CHECKS = 0');
  await db.execute('DROP TABLE IF EXISTS attendance');
  await db.execute('DROP TABLE IF EXISTS employees');
  await db.execute('DROP TABLE IF EXISTS companies');
  await db.execute('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Done dropping tables. The Next.js app will recreate them on next load.');
  process.exit(0);
}

reset();
