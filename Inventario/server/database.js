// server/database.js
const sqlite3 = require('sqlite3').verbose();

// crea  base de datos SQLite, en un archivo q se llama "productos.db"
const db = new sqlite3.Database('./productos.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');

        // crear la tabla si no existe
        db.run(`CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            precio REAL,
            cantidad INTEGER
        )`, (err) => {
            if (err) {
                console.error('Error al crear la tabla:', err.message);
            }
        });
    }
});

module.exports = db;
