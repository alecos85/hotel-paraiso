// ============================
// Configuración base
// ============================

// URL de la API
const API_URL = "https://3.16.44.208:4006/api/empleados";


// ============================
// Validación de formulario
// ============================

function validarFormulario() {
    const numdocumento = document.querySelector('input[name="numerodocumento"]').value.trim();
    const nombre = document.querySelector('input[name="nombre"]').value.trim();
    const apellido = document.querySelector('input[name="apellido"]').value.trim();
    const correo = document.querySelector('input[name="correoelectonico"]').value.trim();
    const telefono = document.querySelector('input[name="telefono"]').value.trim();
    const cargo = document.querySelector('input[name="cargo"]').value.trim();
    const salario = document.querySelector('input[name="salario"]').value.trim();
    const fechaIngreso = document.querySelector('input[name="fechaingreso"]').value;    
    

    if (!numdocumento ||!nombre || !apellido || !correo || !telefono || !cargo || !salario || !fechaIngreso) {
        alert("Por favor, completa todos los campos.");
        return false;
    }

    if (isNaN(salario) || salario <= 0) {
        alert("El salario debe ser un número positivo.");
        return false;
    }

    return true;
}

// ============================
// API (fetch)
// ============================

async function getEmpleado() {
    const empl = await fetch(API_URL);
    if (!empl.ok) throw new Error("Error al obtener registro empleado");
    return empl.json();
}

async function createEmpleado(data) {
    const empl = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!empl.ok) throw new Error("Error al crear empleado");
    return empl.json();
}

async function updateEmpleado(id, data) {
    const empl = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!empl.ok) throw new Error("Error al actualizar empleado");
    return empl.json();
}

async function deleteEmpleado(id) {
    const empl = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!empl.ok) throw new Error("Error al eliminar empleado");
}


// ============================
// UI Helpers
// ============================

function formatearFecha(fechaISO) {
    if (!fechaISO) return "";
    return new Date(fechaISO).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
}

function desformatearFecha(fechaLocal) {
    const [dia, mes, anio] = fechaLocal.split("/");
    return `${anio}-${mes}-${dia}`;
}

function renderFila(empleado) {
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td data-label="Identificación">${empleado.numerodocumento}</td>
        <td data-label="Nombre">${empleado.nombre}</td>
        <td data-label="Apellido">${empleado.apellido}</td>
        <td data-label="Email">${empleado.correoelectonico}</td>
        <td data-label="Teléfono">${empleado.telefono}</td>
        <td data-label="Cargo">${empleado.cargo}</td>
        <td data-label="Salario">$${empleado.salario}</td>
        <td data-label="Entrada">${formatearFecha(empleado.fechaingreso)}</td>
        <td data-label="Acciones">
            <div class="btn-group">
                <button class="btn-edit" data-id="${empleado._id}">Editar</button>
                <button class="btn-delete" data-id="${empleado._id}">Eliminar</button>
            </div>
        </td>
    `;
    return fila;
}

async function cargarEmpleado() {
    const tbody = document.querySelector("#tabla-contactos tbody");
    tbody.innerHTML = "";
    try {
        const empleados = await getEmpleado();
        empleados.forEach(res => tbody.appendChild(renderFila(res)));
        agregarListenersBotones();
    } catch (error) {
        alert("No se pudieron cargar los registro de los empleados.");
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
    document.querySelector('input[name="numerodocumento"]').value = valores[0];
    document.querySelector('input[name="nombre"]').value = valores[1];
    document.querySelector('input[name="apellido"]').value = valores[2];
    document.querySelector('input[name="correoelectonico"]').value = valores[3];
    document.querySelector('input[name="telefono"]').value = valores[4];
    document.querySelector('input[name="cargo"]').value = valores[5];
    document.querySelector('input[name="salario"]').value = valores[6].replace("$", "");
    document.querySelector('input[name="fechaingreso"]').value = desformatearFecha(valores[7]);    
}

// ============================
// Funciones Bandera de Activación de Boton según seleccion - Creación - Edición
// ============================

async function agregarEmpleado(event) {
    event.preventDefault(); // evita recarga del formulario

    if (!validarFormulario()) return;

    const form = document.getElementById("formulario");
    const data = Object.fromEntries(new FormData(form));
    data.salario = Number(data.salario); // aseguramos que precio sea numérico

    try {
        await createEmpleado(data); // llama a la API
        cargarEmpleado();         // refresca la tabla
        form.reset();                  // limpia los campos
    } catch (error) {
        alert("No se pudo guardar el registro de empleado.");        
        console.error(error);
    }
}

function activarModoCreacion() {
    const form = document.getElementById("formulario");
    form.reset();
    form.removeEventListener("submit", form._actualizarHandler);
    form.addEventListener("submit", agregarEmpleado);
    form._actualizarHandler = null;
}

function activarModoEdicion(id) {
    const form = document.getElementById("formulario");
    // Desactiva crear para evitar duplicidad de listeners
    form.removeEventListener("submit", agregarEmpleado);

    // Guardamos handler en la propiedad del form para poder removerlo luego
    form._actualizarHandler = async function actualizar(event) {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        data.salario = Number(data.salario);
        if (!validarFormulario()) return;

        try {
            await updateEmpleado(id, data);
            cargarEmpleado();
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
            if (!confirm("¿Seguro que deseas eliminar el registro del empleado?")) return;
            try {
                await deleteEmpleado(btn.dataset.id);
                cargarEmpleado();
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
            .addEventListener("submit", agregarEmpleado);
    cargarEmpleado();

});
