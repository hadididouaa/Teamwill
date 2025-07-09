require('dotenv').config({ path: './config/.env' });

const common = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  pool: {
    max: 10,         // increase max number of connections
    min: 0,
    acquire: 30000,  // wait up to 30s for a connection (instead of default 10s)
    idle: 10000
  }
};

module.exports = {
  development: common,
  test: common,
  production: common
};
