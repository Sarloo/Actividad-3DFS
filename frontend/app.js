const API = "http://localhost:3000";

const loginBox = document.getElementById("loginBox");
const appBox = document.getElementById("appBox");
const lista = document.getElementById("listaTareas");
const input = document.getElementById("tareaInput");
const asignado = document.getElementById("asignadoInput");
const boton = document.getElementById("agregarBtn");
const error = document.getElementById("mensajeError");
const errorApp = document.getElementById("mensajeErrorApp");


// ================= LOGIN =================

async function login() {
    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();

    // LIMPIAR MENSAJE
    error.textContent = "";

    // VALIDACION CAMPOS VACIOS
    if (!usuario || !password) {
        error.textContent = "⚠️ Debes ingresar usuario y contraseña";
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
            error.textContent = data.mensaje || "Error al iniciar sesión";
            return;
        }

        // LOGIN CORRECTO
        localStorage.setItem("token", data.token);

        loginBox.style.display = "none";
        appBox.style.display = "block";
        cargarTareas();

    } catch (err) {
        error.textContent = "Error de conexión con el servidor";
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
        <button onclick="completar(${t.id},${t.completada})">Completar</button>
        <button class="eliminar" onclick="eliminar(${t.id})">Eliminar</button>
        </div>
        `;

        lista.appendChild(li);
    });
}




// ================= AGREGAR =================

boton.addEventListener("click", async ()=>{

    if(input.value.trim()==="") return;

    errorApp.textContent = "";

    const token = localStorage.getItem("token");

    const res = await fetch(API + "/tareas",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization: token
        },
        body:JSON.stringify({
            titulo: input.value,
            descripcion:"tarea creada desde frontend",
            asignadoA: asignado.value,
            fechaAsignacion: new Date()
        })
    });

    const data = await res.json();

    //  ERROR (usuario no existe)
    if (!res.ok) {
        errorApp.style.color = "red";
        errorApp.textContent = data.mensaje;
        return;
    }

    //  OK
    input.value="";
    asignado.value="";
    errorApp.textContent="";
    cargarTareas();
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

    error.textContent = "";

    // VALIDACION
    if (!usuario || !password) {
        error.textContent = "⚠️ Debes ingresar usuario y contraseña";
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
            error.textContent = data.mensaje || "Error al registrar usuario";
            return;
        }

        error.style.color = "green";
        error.textContent = "✅ Usuario registrado correctamente. Ahora inicia sesión.";

    } catch (err) {
        error.textContent = "Error al conectar con el servidor";
        console.log(err);
    }
}

function logout() {

    // borrar token
    localStorage.removeItem("token");

    // limpiar interfaz
    lista.innerHTML = "";
    errorApp.textContent = "";

    // cambiar vistas
    appBox.style.display = "none";
    loginBox.style.display = "block";
}
