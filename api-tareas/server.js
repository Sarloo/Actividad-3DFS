const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const SECRET = "clave_super_secreta";

const TAREAS_FILE = "./tareas.json";
const USERS_FILE = "./usuarios.json";


// ================= FUNCIONES FS =================

async function leerArchivo(ruta) {
    try {
        const data = await fs.readFile(ruta, "utf8");
        return JSON.parse(data || "[]");
    } catch {
        return [];
    }
}

async function escribirArchivo(ruta, data) {
    await fs.writeFile(ruta, JSON.stringify(data, null, 2));
}

async function usuarioExiste(nombreUsuario) {
    const usuarios = await leerArchivo(USERS_FILE);
    return usuarios.some(u => u.usuario === nombreUsuario);
}


// ================= MIDDLEWARE AUTH =================

function auth(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader)
        return res.status(401).json({ mensaje: "Token requerido" });

    const token = authHeader.split(" ")[1] || authHeader;

    jwt.verify(token, SECRET, (err, user) => {
        if (err)
            return res.status(403).json({ mensaje: "Token inválido" });

        req.user = user;
        next();
    });
}


// ================= MIDDLEWARE VALIDACION =================

function validarTarea(req, res, next) {
    const { titulo, descripcion } = req.body;

    if (!titulo || !descripcion) {
        return res.status(400).json({
            mensaje: "Título y descripción son obligatorios"
        });
    }

    next();
}


// ================= REGISTER =================

app.post("/register", async (req, res, next) => {
    try {
        const { usuario, password } = req.body;

        if (!usuario || !password)
            return res.status(400).json({ mensaje: "Datos incompletos" });

        const users = await leerArchivo(USERS_FILE);

        const existe = users.find(u => u.usuario === usuario);
        if (existe)
            
            return res.status(400).json({ mensaje: "Usuario ya existe" });

        const hash = await bcrypt.hash(password, 10);

        users.push({ usuario, password: hash });

        await escribirArchivo(USERS_FILE, users);

        res.json({ mensaje: "Usuario registrado correctamente" });

    } catch (err) {
        next(err);
    }
});


// ================= LOGIN =================

app.post("/login", async (req, res, next) => {
    try {
        const { usuario, password } = req.body;

        const users = await leerArchivo(USERS_FILE);

        const user = users.find(u => u.usuario === usuario);
        if (!user)
            return res.status(404).json({ mensaje: "Usuario no encontrado" });

        const valido = await bcrypt.compare(password, user.password);
        if (!valido)
            return res.status(401).json({ mensaje: "Contraseña incorrecta" });

        const token = jwt.sign({ usuario }, SECRET, { expiresIn: "1h" });

        res.json({ token });

    } catch (err) {
        next(err);
    }
});


// ================= CRUD TAREAS =================

// GET
app.get("/tareas", auth, async (req, res, next) => {
    try {
        const tareas = await leerArchivo(TAREAS_FILE);

        const usuario = req.user.usuario;

        // TAREAS QUE CREO O QUE LE ASIGNARON
        const visibles = tareas.filter(t =>
            t.creadoPor === usuario || t.asignadoA === usuario
        );

        res.json(visibles);

    } catch (err) {
        next(err);
    }
});




// POST
app.post("/tareas", auth, validarTarea, async (req, res, next) => {
    try {
        const { asignadoA } = req.body;

        // VALIDAR USUARIO ASIGNADO
        if (asignadoA) {
            const existe = await usuarioExiste(asignadoA);
            if (!existe) {
                return res.status(400).json({
                    mensaje: "El usuario asignado no existe"
                });
            }
        }

        const tareas = await leerArchivo(TAREAS_FILE);

        const nueva = {
            id: Date.now(),
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            completada: false,
            creadoPor: req.user.usuario,
            asignadoA: asignadoA || "",
            fechaAsignacion: req.body.fechaAsignacion || "",
            fechaCreacion: new Date()
        };

        tareas.push(nueva);
        await escribirArchivo(TAREAS_FILE, tareas);

        res.status(201).json(nueva);

    } catch (err) {
        next(err);
    }
});



// PUT
app.put("/tareas/:id", auth, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const tareas = await leerArchivo(TAREAS_FILE);

        const index = tareas.findIndex(t => t.id === id);
        if (index === -1)
            return res.status(404).json({ mensaje: "Tarea no encontrada" });

        tareas[index] = { ...tareas[index], ...req.body };

        await escribirArchivo(TAREAS_FILE, tareas);

        res.json(tareas[index]);

    } catch (err) {
        next(err);
    }
});


// DELETE
app.delete("/tareas/:id", auth, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const tareas = await leerArchivo(TAREAS_FILE);

        const existe = tareas.find(t => t.id === id);
        if (!existe)
            return res.status(404).json({ mensaje: "Tarea no encontrada" });

        const nuevas = tareas.filter(t => t.id !== id);
        await escribirArchivo(TAREAS_FILE, nuevas);

        res.json({ mensaje: "Tarea eliminada correctamente" });

    } catch (err) {
        next(err);
    }
});


// ================= 404 =================

app.use((req, res) => {
    res.status(404).json({ mensaje: "Ruta no encontrada" });
});


// ================= ERROR GLOBAL =================

app.use((err, req, res, next) => {
    console.error("ERROR:", err);
    res.status(500).json({ mensaje: "Error interno del servidor" });
});


// ================= SERVER =================

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
