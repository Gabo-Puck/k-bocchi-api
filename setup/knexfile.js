const knex = require("knex")({
  client: "mysql",
  connection: {
    host: process.env.DATABASE_CONNECTION,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_KBOCCHI,
  },
});



module.exports = {
  knex
}


