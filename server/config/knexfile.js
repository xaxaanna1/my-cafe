require('dotenv').config();

module.exports = {
    client: 'pg',
    connection: {
        host: 'localhost',
        port: '5433',
        user: 'postgres',
        password: 'nkazaryan11',
        database: 'postgres' 
    },
    migrations: {
        directory: '../migrations'
    },
    seeds: {
        directory: '../seeds'
    }
}