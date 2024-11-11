const productForm = document.getElementById('productForm');
const productTableBody = document.getElementById('productTableBody');
const searchInput = document.getElementById('searchInput');

// cargar productos al iniciar
window.onload = fetchProducts;

// Función para obtener productos (GET)
function fetchProducts() {
    fetch('http://localhost:3000/productos') // URL 
        .then(response => response.json())
        .then(products => {
            productTableBody.innerHTML = '';
            products.forEach(product => addProductRow(product));
        });
}

// Función para agregar una fila en la tabla
function addProductRow(product) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', product.id); // Para eliminar la fila
    row.classList.add('fade-in'); // Añadir clase para animación de entrada
    row.innerHTML = `
        <td>${product.id}</td>
        <td>${product.nombre}</td>
        <td>${product.precio}</td>
        <td>${product.cantidad}</td>
        <td>
            <button onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i>Eliminar</button>
        </td>
    `;
    productTableBody.appendChild(row);
}

// Función para agregar un producto (POST)
productForm.addEventListener('submit', event => {
    event.preventDefault();
    const nombre = document.getElementById('productName').value;
    const precio = document.getElementById('productPrice').value;
    const cantidad = document.getElementById('productQuantity').value;

    fetch('http://localhost:3000/productos', { // URL completa
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, precio, cantidad })
    })
    .then(response => response.json())
    .then(product => {
        addProductRow(product); // usa el objeto devuelto por el servidor
        productForm.reset(); // limpiar formulario después de agregar
    });
});

// Función para eliminar un producto (DELETE)
function deleteProduct(id) {
    fetch(`http://localhost:3000/productos/${id}`, { method: 'DELETE' }) // URL completa
        .then(response => response.json())
        .then(result => {
            if (result) {
                const rowToDelete = document.querySelector(`tr[data-id='${id}']`);
                if (rowToDelete) rowToDelete.remove();
            }
        });
}
// Función para buscar productos por nombre
function searchProduct() {
    const searchQuery = searchInput.value.trim().toLowerCase();

    if (!searchQuery) {
        fetchProducts(); // Si no hay búsqueda, recargar todos los productos
        return;
    }

    fetch(`http://localhost:3000/productos/buscar?nombre=${searchQuery}`) // Llamada a la API de búsqueda
        .then(response => response.json())
        .then(products => {
            productTableBody.innerHTML = '';
            if (products.length > 0) {
                products.forEach(product => addProductRow(product));
            } else {
                productTableBody.innerHTML = '<tr><td colspan="5">No se encontraron productos.</td></tr>';
            }
        })
        .catch(err => console.error('Error al buscar productos:', err));
}