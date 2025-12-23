const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'StudentActivitiesDb',
});

// Test connection on startup
db.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    console.log(`   Connected to: ${connection.config.database}@${connection.config.host}`);
    connection.release();
  })
  .catch(err => {
    console.error('\n❌ DATABASE CONNECTION FAILED!\n');
    console.error(`Error: ${err.message}`);
    console.error(`Code: ${err.code}\n`);
    
    if (err.code === 'ECONNREFUSED') {
      console.error('⚠️  MySQL service is NOT RUNNING');
      console.error('   → Start MySQL service in Services (services.msc)\n');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('⚠️  WRONG PASSWORD OR USERNAME');
      console.error('   → Check your MySQL credentials in backend/config/db.js\n');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('⚠️  Database "StudentActivitiesDB" does NOT exist');
      console.error('   → Create database or check database name\n');
    }
    
    console.error('📝 To diagnose, run: node test-db-connection.js\n');
  });

module.exports = db;
