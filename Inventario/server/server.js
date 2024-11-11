//server.js
const express = require('express');
const cors = require('cors');
const db = require('./database'); // importa la bd
const app = express();
const PORT = 3000;

// middleware para habilitar CORS y parseo de JSON
app.use(cors());
app.use(express.json());

// middleware para validar datos de entrada (producto)
function validarProducto(req, res, next) {
    const { nombre, precio, cantidad } = req.body;
    if (!nombre || !precio || !cantidad) {
        return res.status(400).json({ error: 'Faltan datos obligatorios (nombre, precio, cantidad)' });
    }
    if (isNaN(precio) || isNaN(cantidad)) {
        return res.status(400).json({ error: 'El precio y la cantidad deben ser números' });
    }
    next();
}

// array para almacenar productos temporalmente en memoria
//let productos = [];
//let currentId = 1; // Inicialización de ID

// endpoint GET para obtener todos los productos
app.get('/productos', (req, res) => {
    db.all('SELECT * FROM productos', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// endpoint POST para agregar un nuevo producto
app.post('/productos', (req, res) => {
    const { nombre, precio, cantidad } = req.body;
    db.run(`INSERT INTO productos (nombre, precio, cantidad) VALUES (?, ?, ?)`,
        [nombre, precio, cantidad], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, nombre, precio, cantidad });
        }
    });
});

// endpoint PUT para actualizar un producto por su ID
app.put('/productos/:id', (req, res) => {
    const { nombre, precio, cantidad } = req.body;
    const id = req.params.id;
    db.run(`UPDATE productos SET nombre = ?, precio = ?, cantidad = ? WHERE id = ?`,
        [nombre, precio, cantidad, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
        } else {
            res.json({ id, nombre, precio, cantidad });
        }
    });
});

// endpoint DELETE para eliminar un producto por su ID
app.delete('/productos/:id', (req, res) => {
    const id = req.params.id;

    // eliminar el producto
    db.run(`DELETE FROM productos WHERE id = ?`, id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
        } else {
            // reiniciar el contador de IDs (después de una eliminación exitosa)
            db.run('DELETE FROM sqlite_sequence WHERE name = "productos"', (err) => {
                if (err) {
                    console.error('Error al reiniciar el contador de IDs:', err.message);
                    res.status(500).json({ error: 'Error al reiniciar el contador de IDs' });
                } else {
                    console.log('Contador de IDs reiniciado.');
                    res.json({ id });
                }
            });
        }
    });
});
// Middleware para manejar errores globalmente
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ocurrió un error interno en el servidor' });
});
// Endpoint para buscar productos por nombre
app.get('/productos/buscar', (req, res) => {
    const nombre = req.query.nombre;
    db.all(`SELECT * FROM productos WHERE nombre LIKE ?`, [`%${nombre}%`], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
