const API = "http://localhost:3000";

const loginBox = document.getElementById("loginBox");
const appBox = document.getElementById("appBox");
const lista = document.getElementById("listaTareas");
const input = document.getElementById("tareaInput");
const asignado = document.getElementById("asignadoInput");
const boton = document.getElementById("agregarBtn");
const loginError = document.getElementById("loginError");
const taskError = document.getElementById("taskError");


// ================= PROTECCION DE SESION =================

const token = localStorage.getItem("token");

if (!token) {
    loginBox.style.display = "block";
    appBox.style.display = "none";
} else {
    loginBox.style.display = "none";
    appBox.style.display = "block";
    cargarTareas();
}

// ================= LOGIN =================

async function login() {
    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();

    // LIMPIAR MENSAJE
    loginError.textContent = "";


    // VALIDACION CAMPOS VACIOS
    if (!usuario || !password) {
        loginError.style.color = "red";
        loginError.textContent = "⚠️ Debes ingresar usuario y contraseña";
;
        return;
    }

    try {
        const res = await fetch(API + "/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, password })
        });

        const data = await res.json();

        // LOGIN INCORRECTO
        if (!res.ok) {
            loginError.style.color = "red";
            loginError.textContent = data.mensaje || "Error al iniciar sesión";
            return;
        }

        // LOGIN CORRECTO
        localStorage.setItem("token", data.token);

        loginBox.style.display = "none";
        appBox.style.display = "block";
        cargarTareas();

    } catch (err) {
        loginError.textContent = "Error de conexión con el servidor";
        console.log(err);
    }
}



// ================= CARGAR =================

async function cargarTareas() {

    const token = localStorage.getItem("token");

    const res = await fetch(API + "/tareas", {
        headers:{ Authorization: token }
    });

    const tareas = await res.json();

    renderizar(tareas);
}


// ================= RENDER =================

function renderizar(tareas){

    lista.innerHTML="";

    tareas.forEach(t => {

        const li = document.createElement("li");

        if(t.completada) li.classList.add("completa");

        li.innerHTML = `
        <span>${t.titulo}</span>

        <div class="meta">
        <div>📅 Creado: ${new Date(t.fechaCreacion).toLocaleString()}</div>
        <div>👤 Creado por: ${t.creadoPor}</div>
        <div>➡ Asignado a: ${t.asignadoA}</div>
        <div>🗓 Fecha asignación: ${t.fechaAsignacion ? new Date(t.fechaAsignacion).toLocaleString() : ""}</div>
        </div>

        <div class="acciones">
        <button onclick="editar(${t.id},'${t.titulo}')">Editar</button>
        <button onclick="completar(${t.id},${t.completada})">✔</button>
        <button class="eliminar" onclick="eliminar(${t.id})">X</button>
        </div>
        `;

        lista.appendChild(li);
    });
}




// ================= AGREGAR =================

boton.addEventListener("click", async () => {

    taskError.textContent = "";


    const titulo = input.value.trim();
    if (!titulo) {
        taskError.style.color = "red";
        taskError.textContent = "Debes escribir una tarea";
        return;
}

    const asignadoA = asignado.value.trim();

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(API + "/tareas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify({
                titulo,
                descripcion: "tarea creada desde frontend",
                asignadoA,
                fechaAsignacion: new Date()
            })
        });

        const data = await res.json();

        // ERROR DEL BACKEND
        if (!res.ok) {
            taskError.textContent = data.mensaje || "Error al agregar tarea";
            return;
}


        // ÉXITO
        input.value = "";
        asignado.value = "";
        cargarTareas();

    } catch (err) {
        error.textContent = "Error al conectar con el servidor";
        console.log(err);
    }
});





// ================= ELIMINAR =================

async function eliminar(id){

    const token = localStorage.getItem("token");

    await fetch(API + "/tareas/"+id,{
        method:"DELETE",
        headers:{ Authorization: token }
    });

    cargarTareas();
}

// ================= EDITAR =================

async function editar(id,titulo){

    const nuevo = prompt("Nuevo titulo:",titulo);
    if(!nuevo) return;

    const token = localStorage.getItem("token");

    await fetch(API+"/tareas/"+id,{
        method:"PUT",
        headers:{
            "Content-Type":"application/json",
            Authorization: token
        },
        body:JSON.stringify({titulo:nuevo})
    });

    cargarTareas();
}


// ================= COMPLETAR =================

async function completar(id,estado){

    const token = localStorage.getItem("token");

    await fetch(API+"/tareas/"+id,{
        method:"PUT",
        headers:{
            "Content-Type":"application/json",
            Authorization: token
        },
        body:JSON.stringify({completada:!estado})
    });

    cargarTareas();
}

async function registrar() {

    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();

    loginError.textContent = "";

    // VALIDACION
    if (!usuario || !password) {
        loginError.style.color = "red";
        loginError.textContent = "⚠️ Debes ingresar usuario y contraseña";
        return;
    }

    try {
        const res = await fetch(API + "/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, password })
        });

        const data = await res.json();

        if (!res.ok) {
            loginError.textContent = data.mensaje || "Error al registrar usuario";
            return;
        }

        loginError.style.color = "green";
        loginError.textContent = "✅ Usuario registrado correctamente. Ahora inicia sesión.";

    } catch (err) {
        error.textContent = "Error al conectar con el servidor";
        console.log(err);
    }
}

function logout() {
    localStorage.removeItem("token");

    // limpiar UI
    lista.innerHTML = "";
    taskError.textContent = "";
    loginError.textContent = "";

    // limpiar inputs
    input.value = "";
    asignado.value = "";

    // cambiar vista
    appBox.style.display = "none";
    loginBox.style.display = "block";
}
