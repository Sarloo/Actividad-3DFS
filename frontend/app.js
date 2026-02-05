const API = "http://localhost:3000";

const lista = document.getElementById("listaTareas");
const input = document.getElementById("tareaInput");
const asignado = document.getElementById("asignadoInput");
const boton = document.getElementById("agregarBtn");
const error = document.getElementById("mensajeError");

// ================= LOGIN =================

async function login() {
    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    const res = await fetch(API + "/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({usuario,password})
    });

    const data = await res.json();
    localStorage.setItem("token", data.token);

    alert("Login correcto");
    cargarTareas();
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

    const token = localStorage.getItem("token");

    await fetch(API + "/tareas",{
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

    input.value="";
    asignado.value="";

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

