// ============================
// Configuración base
// ============================

// URL de la API
const API_URL = "http://3.16.44.208:4003/api/inventario";


// ============================
// Validación de formulario
// ============================

function validarFormulario() {
    const codigo = document.querySelector('input[name="codigoarticulo"]').value.trim();
    const nombrearticulo = document.querySelector('input[name="nombrearticulo"]').value.trim();
    const categoria = document.querySelector('input[name="categoria"]').value.trim();
    const existencias = document.querySelector('input[name="exitencias"]').value.trim();
    const valorunitario = document.querySelector('input[name="valorunitario"]').value.trim();

    if (!codigo || !nombrearticulo || !categoria || !existencias || !valorunitario) {
        alert("Por favor, completa todos los campos.");
        return false;
    }

    if (isNaN(existencias) || existencias <= 0) {
        alert("Las existencias debe ser un número positivo.");
        return false;
    }

    if (isNaN(valorunitario) || valorunitario <= 0) {
        alert("El valor unitario debe ser un número positivo.");
        return false;
    }

    return true;
}


// ============================
// API (fetch)
// ============================

async function getInventarios() {
    const inv = await fetch(API_URL);
    if (!inv.ok) throw new Error("Error al obtener el inventario");
    return inv.json();
}

async function createInventarios(data) {
    const inv = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!inv.ok) throw new Error("Error al crear el inventario");
    return inv.json();
}

async function updateInventarios(id, data) {
    const inv = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!inv.ok) throw new Error("Error al actualizar el inventario");
    return inv.json();
}

async function deleteInventarios(id) {
    const inv = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!inv.ok) throw new Error("Error al eliminar el registro de inventario");
}


// ============================
// UI Helpers
// ============================

function renderFila(inventario) {
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td data-label="codigoarticulo">${inventario.codigoarticulo}</td>
        <td data-label="nombrearticulo">${inventario.nombrearticulo}</td>
        <td data-label="categoria">${inventario.categoria}</td>
        <td data-label="existencias">${inventario.exitencias}</td>
        <td data-label="valorunitario">$${inventario.valorunitario}</td>
        <td data-label="Acciones">
            <div class="btn-group">
                <button class="btn-edit" data-id="${inventario._id}">Editar</button>
                <button class="btn-delete" data-id="${inventario._id}">Eliminar</button>
            </div>
        </td>
    `;
    return fila;
}

async function cargarInventarios() {
    const tbody = document.querySelector("#tabla-contactos tbody");
    tbody.innerHTML = "";
    try {
        const inventarios = await getInventarios();
        inventarios.forEach(res => tbody.appendChild(renderFila(res)));
        agregarListenersBotones();
    } catch (error) {
        alert("No se pudieron cargar el inventario.");
        console.error(error);
    }
}


// ============================
// Manejo de eventos
// ============================

// ============================
// Captura de Valores a Editar
// ============================


function rellenarFormulario(valores) {
    document.querySelector('input[name="codigoarticulo"]').value = valores[0];
    document.querySelector('input[name="nombrearticulo"]').value = valores[1];
    document.querySelector('input[name="categoria"]').value = valores[2];
    document.querySelector('input[name="exitencias"]').value = valores[3];    
    document.querySelector('input[name="valorunitario"]').value = valores[4].replace("$", "");
}

// ============================
// Funciones Bandera de Activación de Boton según seleccion - Creación - Edición
// ============================

async function agregarInventario(event) {
    event.preventDefault(); // evita recarga del formulario

    if (!validarFormulario()) return;

    const form = document.getElementById("formulario");
    const data = Object.fromEntries(new FormData(form));
    data.precio = Number(data.precio); // aseguramos que precio sea numérico

    try {
        await createInventarios(data); // llama a la API
        cargarInventarios();         // refresca la tabla
        form.reset();                  // limpia los campos
    } catch (error) {
        alert("No se pudo guardar el registro de inventario.");
        console.error(error);
    }
}

function activarModoCreacion() {
    const form = document.getElementById("formulario");
    form.reset();
    form.removeEventListener("submit", form._actualizarHandler);
    form.addEventListener("submit", agregarInventario);
    form._actualizarHandler = null;
}

function activarModoEdicion(id) {
    const form = document.getElementById("formulario");
    // Desactiva crear para evitar duplicidad de listeners
    form.removeEventListener("submit", agregarInventario);

    // Guardamos handler en la propiedad del form para poder removerlo luego
    form._actualizarHandler = async function actualizar(event) {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        data.existencias = Number(data.existencias);
        data.valorunitario = Number(data.valorunitario);
        if (!validarFormulario()) return;

        try {
            await updateInventarios(id, data);
            cargarInventarios();
            activarModoCreacion(); // restauramos el form a modo crear
        } catch (error) {
            alert("No se pudo actualizar.");
            console.error(error);
        }
    };

    form.addEventListener("submit", form._actualizarHandler);
}

// ============================
// Listeners simplificados
// ============================

function agregarListenersBotones() {
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (!confirm("¿Seguro que deseas eliminar el registro del inventario?")) return;
            try {
                await deleteInventarios(btn.dataset.id);
                cargarInventarios();
            } catch (error) {
                alert("No se pudo eliminar.");
                console.error(error);
            }
        });
    });

    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", () => {
            const fila = btn.closest("tr");
            const valores = Array.from(fila.querySelectorAll("td:not(:last-child)"))
                                .map(td => td.textContent);

            rellenarFormulario(valores);
            activarModoEdicion(btn.dataset.id);
        });
    });
}


// ============================
// Inicialización
// ============================

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("formulario")
            .addEventListener("submit", agregarInventario);
    cargarInventarios();
});