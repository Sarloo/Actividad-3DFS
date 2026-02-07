
// CLASE TAREA
// Representa una tarea individual


class Tarea {

    // Constructor: se ejecuta automáticamente
    // cuando se crea un nuevo objeto Tarea
    constructor(nombre, completa = false, id = Date.now()) {

        // Guarda el texto o nombre de la tarea
        this.nombre = nombre;

        // Indica si la tarea está completada o no
        this.completa = completa;

        // Identificador único de la tarea
        this.id = id;
    }

    // Método que permite cambiar el nombre de la tarea
    editar(nuevoNombre) {

        // Reemplaza el nombre actual por el nuevo
        this.nombre = nuevoNombre;
    }

    // Método que cambia el estado de la tarea
    alternarEstado() {

        // Si está en false pasa a true y viceversa
        this.completa = !this.completa;
    }
}



// CLASE GESTOR DE TAREAS
// Maneja todas las tareas
class GestorDeTareas {

    // Constructor del gestor
    constructor() {

        // Obtiene las tareas guardadas en localStorage
        // Si no hay nada guardado, usa un arreglo vacío
        const tareasGuardadas = JSON.parse(localStorage.getItem('tareas')) || [];

        // Reconstruye las tareas como objetos de la clase Tarea
        // para que mantengan sus métodos
        this.tareas = tareasGuardadas.map(t =>
            new Tarea(t.nombre, t.completa, t.id)
        );
    }

    // Método para agregar una tarea al arreglo
    agregarTarea(tarea) {

        // Agrega la tarea al arreglo de tareas
        this.tareas.push(tarea);

        // Guarda los cambios en localStorage
        this.guardar();
    }

    // Método para eliminar una tarea según su ID
    eliminarTarea(id) {

        // Filtra el arreglo dejando solo las tareas
        // cuyo id sea diferente al que se quiere eliminar
        this.tareas = this.tareas.filter(t => t.id !== id);

        // Guarda los cambios
        this.guardar();
    }

    // Método que guarda las tareas en localStorage
    guardar() {

        // Convierte el arreglo a JSON y lo guarda
        localStorage.setItem('tareas', JSON.stringify(this.tareas));
    }
}



// CREACIÓN DEL GESTOR
// Se crea una instancia del gestor de tareas
const gestor = new GestorDeTareas();


// ELEMENTOS DEL DOM
// Lista donde se mostrarán las tareas
const lista = document.getElementById('listaTareas');

// Input donde el usuario escribe la tarea
const input = document.getElementById('tareaInput');

// Botón para agregar tareas
const boton = document.getElementById('agregarBtn');

// Elemento para mostrar mensajes de error
const error = document.getElementById('mensajeError');



// FUNCIÓN PARA MOSTRAR TAREAS
const renderizarTareas = () => {

    // Limpia la lista para evitar duplicados
    lista.innerHTML = '';

    // Recorre cada tarea del gestor
    gestor.tareas.forEach(tarea => {

        // Crea un elemento <li>
        const li = document.createElement('li');

        // Si la tarea está completa, agrega la clase "completa"
        li.className = tarea.completa ? 'completa' : '';

        // Contenido HTML del <li>
        li.innerHTML = `
            <span>${tarea.nombre}</span>
            <div class="acciones">
                <button onclick="editarTarea(${tarea.id})">Editar</button>
                <button onclick="completarTarea(${tarea.id})">✓</button>
                <button class="eliminar" onclick="eliminarTarea(${tarea.id})">x</button>
            </div>
        `;

        // Agrega el <li> a la lista
        lista.appendChild(li);
    });
};



// EVENTO DEL BOTÓN AGREGAR
boton.addEventListener('click', () => {

    // Obtiene el texto del input y elimina espacios
    const texto = input.value.trim();

    // Validación: no permitir tareas vacías
    if (texto === '') {

        // Muestra mensaje de error
        error.textContent = '⚠️ No puedes agregar una tarea vacía';
        return;
    }

    // Crea una nueva tarea con el texto
    const nuevaTarea = new Tarea(texto);

    // Agrega la tarea al gestor
    gestor.agregarTarea(nuevaTarea);

    // Limpia el input
    input.value = '';

    // Limpia el mensaje de error
    error.textContent = '';

    // Actualiza la lista en pantalla
    renderizarTareas();
});


// FUNCIONES GLOBALES
// Función para eliminar una tarea
window.eliminarTarea = id => {

    // Elimina la tarea del gestor
    gestor.eliminarTarea(id);

    // Vuelve a mostrar las tareas
    renderizarTareas();
};

// Función para editar una tarea
window.editarTarea = id => {

    // Busca la tarea por su ID
    const tarea = gestor.tareas.find(t => t.id === id);

    // Pide al usuario el nuevo texto
    const nuevoTexto = prompt('Editar tarea:', tarea.nombre);

    // Valida que el texto no esté vacío
    if (nuevoTexto && nuevoTexto.trim() !== '') {

        // Edita el nombre de la tarea
        tarea.editar(nuevoTexto.trim());

        // Guarda los cambios
        gestor.guardar();

        // Actualiza la vista
        renderizarTareas();
    }
};

// Función para completar o descompletar una tarea
window.completarTarea = id => {

    // Busca la tarea por su ID
    const tarea = gestor.tareas.find(t => t.id === id);

    // Cambia su estado
    tarea.alternarEstado();

    // Guarda los cambios
    gestor.guardar();

    // Actualiza la vista
    renderizarTareas();
};

// RENDER INICIAL


// Muestra las tareas al cargar la página
renderizarTareas();
