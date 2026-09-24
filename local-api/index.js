const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { promisify } = require("util");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const scryptAsync = promisify(crypto.scrypt);

/*
=========================================================
CLAVE DE RESPUESTAS DEL EXAMEN FINAL
=========================================================
Índice de la respuesta correcta para cada pregunta
del banco de 40 preguntas de app.js.
*/

const CLAVE_EXAMEN_FINAL = [
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0
];

if (CLAVE_EXAMEN_FINAL.length !== 40) {
    throw new Error(
        "La clave del examen debe tener exactamente 40 respuestas."
    );
}


app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || "sql11_colombia",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
});

/*
=========================================================
FUNCIONES DE CONTRASEÑA
=========================================================
*/

async function crearPasswordHash(password) {
    const salt = crypto.randomBytes(16).toString("hex");

    const derivedKey = await scryptAsync(
        password,
        salt,
        64
    );

    return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

async function verificarPassword(password, passwordHash) {
    try {
        const partes = passwordHash.split(":");

        if (partes.length !== 3) {
            return false;
        }

        const algoritmo = partes[0];
        const salt = partes[1];
        const hashGuardado = partes[2];

        if (algoritmo !== "scrypt") {
            return false;
        }

        const derivedKey = await scryptAsync(
            password,
            salt,
            64
        );

        const hashCalculado = derivedKey.toString("hex");

        const bufferGuardado = Buffer.from(
            hashGuardado,
            "hex"
        );

        const bufferCalculado = Buffer.from(
            hashCalculado,
            "hex"
        );

        if (
            bufferGuardado.length !==
            bufferCalculado.length
        ) {
            return false;
        }

        return crypto.timingSafeEqual(
            bufferGuardado,
            bufferCalculado
        );

    } catch (error) {
        console.error(
            "Error verificando contraseña:",
            error
        );

        return false;
    }
}

/*
=========================================================
AUTENTICACIÓN DE SESIONES
=========================================================
*/

function crearTokenSesion(sesionId, estudianteId, rol = "student") {

    const payload = {
        sid: Number(sesionId),
        uid: Number(estudianteId),
        rol,
        iat: Math.floor(Date.now() / 1000)
    };

    const contenido =
        Buffer.from(
            JSON.stringify(payload)
        ).toString("base64url");

    const firma =
        crypto
            .createHmac(
                "sha256",
                process.env.AUTH_SECRET
            )
            .update(contenido)
            .digest("base64url");

    return `${contenido}.${firma}`;
}

function verificarTokenSesion(token) {

    try {

        if (
            typeof token !== "string" ||
            !token.includes(".")
        ) {
            return null;
        }

        const partes =
            token.split(".");

        if (partes.length !== 2) {
            return null;
        }

        const [
            contenido,
            firmaRecibida
        ] = partes;

        const firmaEsperada =
            crypto
                .createHmac(
                    "sha256",
                    process.env.AUTH_SECRET
                )
                .update(contenido)
                .digest("base64url");

        const bufferRecibido =
            Buffer.from(
                firmaRecibida
            );

        const bufferEsperado =
            Buffer.from(
                firmaEsperada
            );

        if (
            bufferRecibido.length !==
            bufferEsperado.length
        ) {
            return null;
        }

        if (
            !crypto.timingSafeEqual(
                bufferRecibido,
                bufferEsperado
            )
        ) {
            return null;
        }

        const payload =
            JSON.parse(
                Buffer.from(
                    contenido,
                    "base64url"
                ).toString("utf8")
            );

        if (!payload.rol) {
            return null;
        }

        if (payload.rol === "student") {

            if (!payload.sid || !payload.uid) {
                return null;
            }

        } else if (payload.rol === "teacher") {

            if (
                payload.sid !== 0 ||
                payload.uid !== 0
            ) {
                return null;
            }

        } else {

            return null;
        }

        return payload;

    } catch (error) {

        console.error(
            "Error verificando token de sesión:",
            error
        );

        return null;
    }
}

/*
=========================================================
MIDDLEWARE DE AUTENTICACIÓN
=========================================================
*/

async function autenticarSesion(req, res, next) {

    try {

        const encabezado =
            req.headers.authorization || "";

        if (
            !encabezado.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                ok: false,
                mensaje: "Autenticación requerida"
            });
        }

        const token =
            encabezado.substring(7).trim();

        const payload =
            verificarTokenSesion(token);

        if (!payload) {
            return res.status(401).json({
                ok: false,
                mensaje: "Token de autenticación inválido"
            });
        }

        if (
            payload.rol !== "student" &&
            payload.rol !== "teacher"
        ) {
            return res.status(403).json({
                ok: false,
                mensaje: "Rol de autenticación inválido"
            });
        }

        if (payload.rol === "teacher") {

            req.user = {
                id: null,
                nombre_completo: "Docente",
                correo:
                    process.env.DOCENTE_EMAIL,
                grado: null,
                rol: "teacher",
                sessionId: null
            };

            return next();
        }

        const resultado =
            await pool.query(
                `
                SELECT
                    s.id,
                    s.estudiante_id,
                    s.inicio,
                    s.ultima_actividad,
                    s.fin,
                    s.activa,
                    e.nombre_completo,
                    e.correo,
                    e.grado,
                    e.activo
                FROM sesiones s
                INNER JOIN estudiantes e
                    ON e.id = s.estudiante_id
                WHERE s.id = $1
                  AND s.estudiante_id = $2
                  AND s.activa = TRUE
                  AND e.activo = TRUE
                `,
                [
                    payload.sid,
                    payload.uid
                ]
            );

        if (resultado.rows.length === 0) {
            return res.status(401).json({
                ok: false,
                mensaje: "Sesión no válida o cerrada"
            });
        }

        const sesion =
            resultado.rows[0];

        req.user = {
            id: sesion.estudiante_id,
            nombre_completo:
                sesion.nombre_completo,
            correo:
                sesion.correo,
            grado:
                sesion.grado,
            rol:
                payload.rol,
            sessionId:
                sesion.id
        };

        next();

    } catch (error) {

        console.error(
            "Error autenticando sesión:",
            error
        );

        return res.status(500).json({
            ok: false,
            mensaje:
                "No se pudo validar la autenticación"
        });
    }
}

/*
=========================================================
HEALTH CHECK
=========================================================
*/

app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                NOW() AS fecha_hora,
                current_database() AS base_de_datos,
                current_user AS usuario
        `);

        res.json({
            ok: true,
            mensaje: "API conectada correctamente a PostgreSQL",
            conexion: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Error de PostgreSQL:",
            error
        );

        res.status(500).json({
            ok: false,
            mensaje: "No se pudo conectar a PostgreSQL",
            error: error.message,
            codigo: error.code || null
        });
    }
});

/*
=========================================================
CONSULTAR ESTUDIANTES
=========================================================
*/

app.get(
    "/api/estudiantes",
    autenticarSesion,
    async (req, res) => {

        try {

            const result =
                await pool.query(`
                    SELECT
                        id,
                        nombre_completo,
                        correo,
                        fecha_registro,
                        ultimo_acceso,
                        activo
                    FROM estudiantes
                    ORDER BY id
                `);

            res.json({
                ok: true,
                estudiantes:
                    result.rows
            });

        } catch (error) {

            console.error(
                "Error consultando estudiantes:",
                error
            );

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudieron consultar los estudiantes"
            });
        }
    }
);

/*
=========================================================
REGISTRAR ESTUDIANTE
=========================================================
*/

app.post("/api/estudiantes", async (req, res) => {

    try {

        const {
            nombre_completo,
            correo,
            password,
            grado
        } = req.body;

        if (
            !nombre_completo ||
            !correo ||
            !password ||
            !grado
        ) {
            return res.status(400).json({
                ok: false,
                mensaje:
                    "Nombre, correo, contraseña y grado son obligatorios"
            });
        }

        if (
            grado !== "11B" &&
            grado !== "11C"
        ) {
            return res.status(400).json({
                ok: false,
                mensaje:
                    "El grado debe ser 11B o 11C"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                ok: false,
                mensaje:
                    "La contraseña debe tener al menos 8 caracteres"
            });
        }

        const correoNormalizado =
            correo.trim().toLowerCase();

        const existente =
            await pool.query(
                `
                SELECT id
                FROM estudiantes
                WHERE correo = $1
                `,
                [correoNormalizado]
            );

        if (existente.rows.length > 0) {
            return res.status(409).json({
                ok: false,
                mensaje:
                    "Ya existe un estudiante con ese correo"
            });
        }

        const passwordHash =
            await crearPasswordHash(password);

        const result =
            await pool.query(
                `
                INSERT INTO estudiantes (
                    nombre_completo,
                    correo,
                    password_hash,
                    grado
                )
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    nombre_completo,
                    correo,
                    grado,
                    fecha_registro,
                    activo
                `,
                [
                    nombre_completo.trim(),
                    correoNormalizado,
                    passwordHash,
                    grado
                ]
            );

        res.status(201).json({
            ok: true,
            mensaje:
                "Estudiante registrado correctamente",
            estudiante:
                result.rows[0]
        });

    } catch (error) {

        console.error(
            "Error registrando estudiante:",
            error
        );

        res.status(500).json({
            ok: false,
            mensaje:
                "No se pudo registrar el estudiante",
            error:
                error.message
        });
    }
});

/*
=========================================================
INICIAR SESIÓN
=========================================================
*/

app.post("/api/login", async (req, res) => {

    const client = await pool.connect();

    try {

        const {
            correo,
            password
        } = req.body;

        if (!correo || !password) {

            return res.status(400).json({
                ok: false,
                mensaje:
                    "Correo y contraseña son obligatorios"
            });
        }

        const correoNormalizado =
            correo.trim().toLowerCase();

        const resultado =
            await client.query(
                `
                SELECT
                    id,
                    nombre_completo,
                    correo,
                    password_hash,
                    activo,
                    grado
                FROM estudiantes
                WHERE correo = $1
                `,
                [correoNormalizado]
            );

        if (resultado.rows.length === 0) {

            return res.status(401).json({
                ok: false,
                mensaje:
                    "Correo o contraseña incorrectos"
            });
        }

        const estudiante =
            resultado.rows[0];

        if (!estudiante.activo) {

            return res.status(403).json({
                ok: false,
                mensaje:
                    "El estudiante está inactivo"
            });
        }

        const passwordCorrecta =
            await verificarPassword(
                password,
                estudiante.password_hash
            );


        if (!passwordCorrecta) {

            return res.status(401).json({
                ok: false,
                mensaje:
                    "Correo o contraseña incorrectos"
            });
        }

        await client.query("BEGIN");


        await client.query(
            `
            UPDATE estudiantes
            SET ultimo_acceso = NOW()
            WHERE id = $1
            `,
            [estudiante.id]
        );

        const sesion =
            await client.query(
                `
                INSERT INTO sesiones (
                    estudiante_id
                )
                VALUES ($1)
                RETURNING
                    id,
                    estudiante_id,
                    inicio,
                    ultima_actividad,
                    activa
                `,
                [estudiante.id]
            );


        await client.query("COMMIT");


        const token =
            crearTokenSesion(
                sesion.rows[0].id,
                estudiante.id,
                "student"
            );

        res.json({

            ok: true,

            mensaje:
                "Inicio de sesión correcto",

            token,

            estudiante: {

                id:
                    estudiante.id,

                nombre_completo:
                    estudiante.nombre_completo,

                correo:
                    estudiante.correo,

                grado:
                    estudiante.grado

            },

            sesion:
                sesion.rows[0]
        });

    } catch (error) {

        try {
            await client.query("ROLLBACK");
        } catch (_) {
        }

        console.error(
            "Error iniciando sesión:",
            error
        );

        res.status(500).json({

            ok: false,

            mensaje:
                "No se pudo iniciar sesión",

            error:
                error.message
        });

    } finally {

        client.release();

    }
});


app.post(
    "/api/login-docente",
    async (req, res) => {

        try {

            const {
                correo,
                password
            } = req.body;

            if (!correo || !password) {

                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "Correo y contraseña son obligatorios"
                });
            }

            const correoNormalizado =
                String(correo)
                    .trim()
                    .toLowerCase();

            const correoDocente =
                String(
                    process.env.DOCENTE_EMAIL || ""
                )
                    .trim()
                    .toLowerCase();

            const passwordDocente =
                String(
                    process.env.DOCENTE_PASSWORD || ""
                );

            if (
                correoNormalizado !==
                    correoDocente ||
                password !==
                    passwordDocente
            ) {

                return res.status(401).json({
                    ok: false,
                    mensaje:
                        "Correo o contraseña incorrectos"
                });
            }

            const token =
                crearTokenSesion(
                    0,
                    0,
                    "teacher"
                );

            res.json({

                ok: true,

                mensaje:
                    "Inicio de sesión docente correcto",

                token,

                docente: {
                    correo:
                        correoDocente,

                    nombre_completo:
                        "Docente"
                }

            });

        } catch (error) {

            console.error(
                "Error iniciando sesión docente:",
                error
            );

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo iniciar sesión"
            });
        }
    }
);



/*
=========================================================
ACTUALIZAR ACTIVIDAD DE UNA SESIÓN
=========================================================
*/

app.put(
    "/api/sesiones/:id/actividad",
    autenticarSesion,
    async (req, res) => {

        try {

            const sesionId =
                Number(req.params.id);

            if (!Number.isInteger(sesionId)) {
                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "ID de sesión inválido"
                });
            }

            const result =
                await pool.query(
                    `
                    UPDATE sesiones
                    SET ultima_actividad = NOW()
                    WHERE id = $1
                      AND estudiante_id = $2
                      AND activa = TRUE
                    RETURNING
                        id,
                        estudiante_id,
                        inicio,
                        ultima_actividad,
                        activa
                    `,
                    [
                        sesionId,
                        req.user.id
                    ]
                );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    ok: false,
                    mensaje:
                        "Sesión no encontrada o no pertenece al usuario autenticado"
                });
            }

            res.json({
                ok: true,
                sesion: result.rows[0]
            });

        } catch (error) {

            console.error(
                "Error actualizando sesión:",
                error
            );

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo actualizar la sesión"
            });
        }
    }
);


/*
=========================================================
CERRAR SESIÓN
=========================================================
*/

app.put(
    "/api/sesiones/:id/cerrar",
    autenticarSesion,
    async (req, res) => {

        try {

            const sesionId =
                Number(req.params.id);

            if (!Number.isInteger(sesionId)) {
                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "ID de sesión inválido"
                });
            }

            const result =
                await pool.query(
                    `
                    UPDATE sesiones
                    SET
                        activa = FALSE,
                        fin = NOW(),
                        ultima_actividad = NOW()
                    WHERE id = $1
                      AND estudiante_id = $2
                      AND activa = TRUE
                    RETURNING
                        id,
                        estudiante_id,
                        inicio,
                        ultima_actividad,
                        fin,
                        activa
                    `,
                    [
                        sesionId,
                        req.user.id
                    ]
                );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    ok: false,
                    mensaje:
                        "Sesión no encontrada o no pertenece al usuario autenticado"
                });
            }

            res.json({
                ok: true,
                mensaje:
                    "Sesión cerrada correctamente",
                sesion:
                    result.rows[0]
            });

        } catch (error) {

            console.error(
                "Error cerrando sesión:",
                error
            );

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo cerrar la sesión"
            });
        }
    }
);


/*
=========================================================
GUARDAR PROGRESO DE UNA LECCIÓN
=========================================================
*/

app.post(
    "/api/progreso",
    autenticarSesion,
    async (req, res) => {

        try {

            const {
                leccion,
                completada,
                porcentaje
            } = req.body;

            if (
                leccion === undefined ||
                porcentaje === undefined
            ) {
                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "leccion y porcentaje son obligatorios"
                });
            }

            const numeroLeccion =
                Number(leccion);

            const porcentajeNumero =
                Number(porcentaje);

            const completadaBoolean =
                Boolean(completada);

            if (
                !Number.isInteger(numeroLeccion) ||
                numeroLeccion < 1 ||
                numeroLeccion > 20
            ) {
                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "La lección debe estar entre 1 y 20"
                });
            }

            if (
                Number.isNaN(porcentajeNumero) ||
                porcentajeNumero < 0 ||
                porcentajeNumero > 100
            ) {
                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "El porcentaje debe estar entre 0 y 100"
                });
            }

            const result =
                await pool.query(
                    `
                    INSERT INTO progreso (
                        estudiante_id,
                        leccion,
                        completada,
                        porcentaje,
                        fecha_actualizacion
                    )
                    VALUES ($1, $2, $3, $4, NOW())

                    ON CONFLICT (
                        estudiante_id,
                        leccion
                    )
                    DO UPDATE SET
                        completada =
                            EXCLUDED.completada,
                        porcentaje =
                            EXCLUDED.porcentaje,
                        fecha_actualizacion =
                            NOW()

                    RETURNING
                        id,
                        estudiante_id,
                        leccion,
                        completada,
                        porcentaje,
                        fecha_actualizacion
                    `,
                    [
                        req.user.id,
                        numeroLeccion,
                        completadaBoolean,
                        porcentajeNumero
                    ]
                );

            res.json({
                ok: true,
                mensaje:
                    "Progreso guardado correctamente",
                progreso:
                    result.rows[0]
            });

        } catch (error) {

            console.error(
                "Error guardando progreso:",
                error
            );

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo guardar el progreso"
            });
        }
    }
);

/*
=========================================================
CONSULTAR PROGRESO DE UN ESTUDIANTE
=========================================================
*/

app.get(
    "/api/progreso/:estudiante_id",
    autenticarSesion,
    async (req, res) => {

        try {

            const estudianteId =
                Number(req.params.estudiante_id);

            if (!Number.isInteger(estudianteId)) {
                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "estudiante_id inválido"
                });
            }

            if (
                estudianteId !==
                Number(req.user.id)
            ) {
                return res.status(403).json({
                    ok: false,
                    mensaje:
                        "No puedes consultar el progreso de otro estudiante"
                });
            }

            const result =
                await pool.query(
                    `
                    SELECT
                        id,
                        estudiante_id,
                        leccion,
                        completada,
                        porcentaje,
                        fecha_actualizacion
                    FROM progreso
                    WHERE estudiante_id = $1
                    ORDER BY leccion
                    `,
                    [req.user.id]
                );

            res.json({
                ok: true,
                progreso:
                    result.rows
            });

        } catch (error) {

            console.error(
                "Error consultando progreso:",
                error
            );

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo consultar el progreso"
            });
        }
    }
);


/*
=========================================================
REGISTRAR ACTIVIDAD DEL ESTUDIANTE
=========================================================
*/

app.post(
    "/api/actividad",
    autenticarSesion,
    async (req, res) => {

        try {

            const {
                leccion,
                accion,
                detalle
            } = req.body;

            if (!accion) {
                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "accion es obligatoria"
                });
            }

            let numeroLeccion = null;

            if (
                leccion !== undefined &&
                leccion !== null
            ) {

                numeroLeccion =
                    Number(leccion);

                if (
                    !Number.isInteger(numeroLeccion) ||
                    numeroLeccion < 1 ||
                    numeroLeccion > 20
                ) {
                    return res.status(400).json({
                        ok: false,
                        mensaje:
                            "La lección debe estar entre 1 y 20"
                    });
                }
            }

            const result =
                await pool.query(
                    `
                    INSERT INTO actividad (
                        estudiante_id,
                        leccion,
                        accion,
                        detalle,
                        fecha_hora
                    )
                    VALUES ($1, $2, $3, $4, NOW())
                    RETURNING
                        id,
                        estudiante_id,
                        leccion,
                        accion,
                        detalle,
                        fecha_hora
                    `,
                    [
                        req.user.id,
                        numeroLeccion,
                        String(accion),
                        detalle
                            ? String(detalle)
                            : null
                    ]
                );

            res.status(201).json({
                ok: true,
                mensaje:
                    "Actividad registrada correctamente",
                actividad:
                    result.rows[0]
            });

        } catch (error) {

            console.error(
                "Error registrando actividad:",
                error
            );

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo registrar la actividad"
            });
        }
    }
);


/*
=========================================================
GUARDAR INTENTO DEL EXAMEN FINAL
=========================================================
*/

app.post(
    "/api/evaluaciones",
    autenticarSesion,
    async (req, res) => {

        try {

            const {
                tipo,
                respuestas
            } = req.body;

            const tipoEvaluacion =
                tipo
                    ? String(tipo)
                    : "EXAMEN_FINAL";

            /*
            =================================================
            VALIDAR RESPUESTAS DEL EXAMEN
            =================================================
            */

            if (!Array.isArray(respuestas)) {
                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "Las respuestas del examen son obligatorias"
                });
            }

            if (respuestas.length !== 20) {
                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "El examen final debe tener exactamente 20 respuestas"
                });
            }

            const preguntasIds = new Set();

            for (const respuesta of respuestas) {

                if (
                    !respuesta ||
                    !Number.isInteger(
                        Number(respuesta.pregunta_id)
                    ) ||
                    !Number.isInteger(
                        Number(respuesta.respuesta)
                    )
                ) {
                    return res.status(400).json({
                        ok: false,
                        mensaje:
                            "Formato de respuesta inválido"
                    });
                }

                const preguntaId =
                    Number(respuesta.pregunta_id);

                const respuestaIndice =
                    Number(respuesta.respuesta);

                if (
                    preguntaId < 0 ||
                    preguntaId >= CLAVE_EXAMEN_FINAL.length
                ) {
                    return res.status(400).json({
                        ok: false,
                        mensaje:
                            "Pregunta del examen inválida"
                    });
                }

                if (
                    respuestaIndice < 0 ||
                    respuestaIndice > 3
                ) {
                    return res.status(400).json({
                        ok: false,
                        mensaje:
                            "Opción de respuesta inválida"
                    });
                }

                if (preguntasIds.has(preguntaId)) {
                    return res.status(400).json({
                        ok: false,
                        mensaje:
                            "El examen contiene preguntas repetidas"
                    });
                }

                preguntasIds.add(preguntaId);
            }

            /*
            =================================================
            CALCULAR RESULTADO EN EL SERVIDOR
            =================================================
            */

            let aciertosNumero = 0;

            for (const respuesta of respuestas) {

                const preguntaId =
                    Number(respuesta.pregunta_id);

                const respuestaIndice =
                    Number(respuesta.respuesta);

                if (
                    CLAVE_EXAMEN_FINAL[preguntaId] ===
                    respuestaIndice
                ) {
                    aciertosNumero++;
                }
            }

            const totalPreguntasNumero = 20;

            const porcentajeNumero =
                Math.round(
                    (
                        aciertosNumero /
                        totalPreguntasNumero
                    ) *
                    100 *
                    100
                ) / 100;

            const notaNumero =
                Math.round(
                    (
                        1 +
                        (
                            aciertosNumero /
                            totalPreguntasNumero
                        ) *
                        4
                    ) *
                    10
                ) / 10;

            /*
            =================================================
            COMPROBAR LOS INTENTOS DEL USUARIO AUTENTICADO
            =================================================
            */

            const intentos =
                await pool.query(
                    `
                    SELECT
                        COUNT(*)::integer AS cantidad
                    FROM evaluaciones
                    WHERE estudiante_id = $1
                      AND tipo = $2
                    `,
                    [
                        req.user.id,
                        tipoEvaluacion
                    ]
                );

            const cantidadIntentos =
                Number(
                    intentos.rows[0].cantidad
                );

            if (cantidadIntentos >= 3) {
                return res.status(409).json({
                    ok: false,
                    mensaje:
                        "El estudiante ya utilizó los 3 intentos permitidos"
                });
            }

            const numeroIntento =
                cantidadIntentos + 1;

            /*
            =================================================
            GUARDAR EVALUACIÓN
            =================================================
            */

            const result =
                await pool.query(
                    `
                    INSERT INTO evaluaciones (
                        estudiante_id,
                        tipo,
                        intento,
                        aciertos,
                        total_preguntas,
                        porcentaje,
                        nota,
                        fecha_hora
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        NOW()
                    )
                    RETURNING
                        id,
                        estudiante_id,
                        tipo,
                        intento,
                        aciertos,
                        total_preguntas,
                        porcentaje,
                        nota,
                        fecha_hora
                    `,
                    [
                        req.user.id,
                        tipoEvaluacion,
                        numeroIntento,
                        aciertosNumero,
                        totalPreguntasNumero,
                        porcentajeNumero,
                        notaNumero
                    ]
                );

            res.status(201).json({
                ok: true,
                mensaje:
                    "Intento del examen guardado correctamente",
                evaluacion:
                    result.rows[0]
            });

        } catch (error) {

            console.error(
                "Error guardando evaluación:",
                error
            );

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo guardar la evaluación"
            });
        }
    }
);


/*
=========================================================
CONSULTAR EVALUACIONES DE UN ESTUDIANTE
=========================================================
*/

app.get(
    "/api/evaluaciones/:estudiante_id",
    autenticarSesion,
    async (req, res) => {

        try {

            const estudianteId =
                Number(req.params.estudiante_id);

            if (!Number.isInteger(estudianteId)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "estudiante_id inválido"
                });
            }

            if (
                estudianteId !==
                Number(req.user.id)
            ) {
                return res.status(403).json({
                    ok: false,
                    mensaje:
                        "No puedes consultar las evaluaciones de otro estudiante"
                });
            }

            const result =
                await pool.query(
                    `
                    SELECT
                        id,
                        estudiante_id,
                        tipo,
                        intento,
                        aciertos,
                        total_preguntas,
                        porcentaje,
                        nota,
                        fecha_hora
                    FROM evaluaciones
                    WHERE estudiante_id = $1
                      AND tipo = 'EXAMEN_FINAL'
                    ORDER BY intento
                    `,
                    [
                        req.user.id
                    ]
                );

            res.json({
                ok: true,
                evaluaciones:
                    result.rows
            });

        } catch (error) {

            console.error(
                "Error consultando evaluaciones:",
                error
            );

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudieron consultar las evaluaciones"
            });
        }
    }
);

/*
=========================================================
PANEL DOCENTE
=========================================================
*/

app.get(
    "/api/dashboard",
    autenticarSesion,
    (req, res, next) => {

        if (req.user.rol !== "teacher") {
            return res.status(403).json({
                ok: false,
                mensaje:
                    "Acceso permitido únicamente al docente"
            });
        }

        next();
    },
    async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                e.id,
                e.nombre_completo,
                e.correo,
                e.grado,
                e.fecha_registro,
                e.ultimo_acceso,
                e.activo,

                COALESCE(
                    (
                        SELECT ROUND(
                            AVG(p.porcentaje)::numeric,
                            2
                        )
                        FROM progreso p
                        WHERE p.estudiante_id = e.id
                    ),
                    0
                ) AS progreso_promedio,

                (
                    SELECT COUNT(*)
                    FROM progreso p
                    WHERE p.estudiante_id = e.id
                      AND p.completada = TRUE
                ) AS lecciones_completadas,

                (
                    SELECT COUNT(*)
                    FROM evaluaciones ev
                    WHERE ev.estudiante_id = e.id
                      AND ev.tipo = 'EXAMEN_FINAL'
                ) AS intentos_examen,

                (
                    SELECT MAX(ev.nota)
                    FROM evaluaciones ev
                    WHERE ev.estudiante_id = e.id
                      AND ev.tipo = 'EXAMEN_FINAL'
                ) AS mejor_nota,

                (
                    SELECT MAX(a.fecha_hora)
                    FROM actividad a
                    WHERE a.estudiante_id = e.id
                ) AS ultima_actividad,

                (
                    SELECT s.activa = TRUE
                       AND s.ultima_actividad >=
                           NOW() - INTERVAL '2 minutes'
                    FROM sesiones s
                    WHERE s.estudiante_id = e.id
                    ORDER BY s.ultima_actividad DESC
                    LIMIT 1
                ) AS conectado

            FROM estudiantes e
            ORDER BY e.id
        `);

        res.json({
            ok: true,
            estudiantes: result.rows
        });

    } catch (error) {
        console.error(
            "Error consultando panel docente:",
            error
        );

        res.status(500).json({
            ok: false,
            mensaje:
                "No se pudo consultar el panel docente",
            error: error.message
        });
    }
});

/*
=========================================================
DETALLE DE UN ESTUDIANTE PARA EL PANEL DOCENTE
=========================================================
*/

app.get("/api/dashboard/estudiante/:id", async (req, res) => {
    try {
        const estudianteId = Number(req.params.id);

        if (!Number.isInteger(estudianteId)) {
            return res.status(400).json({
                ok: false,
                mensaje: "ID de estudiante inválido"
            });
        }

        const estudianteResult = await pool.query(
            `
            SELECT
                id,
                nombre_completo,
                correo,
                fecha_registro,
                ultimo_acceso,
                activo
            FROM estudiantes
            WHERE id = $1
            `,
            [estudianteId]
        );

        if (estudianteResult.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: "Estudiante no encontrado"
            });
        }

        const progresoResult = await pool.query(
            `
            SELECT
                id,
                estudiante_id,
                leccion,
                completada,
                porcentaje,
                fecha_actualizacion
            FROM progreso
            WHERE estudiante_id = $1
            ORDER BY leccion
            `,
            [estudianteId]
        );

        const actividadResult = await pool.query(
            `
            SELECT
                id,
                estudiante_id,
                leccion,
                accion,
                detalle,
                fecha_hora
            FROM actividad
            WHERE estudiante_id = $1
            ORDER BY fecha_hora DESC
            `,
            [estudianteId]
        );

        const evaluacionesResult = await pool.query(
            `
            SELECT
                id,
                estudiante_id,
                tipo,
                intento,
                aciertos,
                total_preguntas,
                porcentaje,
                nota,
                fecha_hora
            FROM evaluaciones
            WHERE estudiante_id = $1
              AND tipo = 'EXAMEN_FINAL'
            ORDER BY intento
            `,
            [estudianteId]
        );

        const sesionesResult = await pool.query(
            `
            SELECT
                id,
                inicio,
                ultima_actividad,
                fin,
                activa,
                (
                    activa = TRUE
                    AND ultima_actividad >=
                        NOW() - INTERVAL '2 minutes'
                ) AS conectada
            FROM sesiones
            WHERE estudiante_id = $1
            ORDER BY ultima_actividad DESC
            `,
            [estudianteId]
        );

        res.json({
            ok: true,
            estudiante: estudianteResult.rows[0],
            progreso: progresoResult.rows,
            actividad: actividadResult.rows,
            evaluaciones: evaluacionesResult.rows,
            sesiones: sesionesResult.rows
        });

    } catch (error) {
        console.error(
            "Error consultando detalle del estudiante:",
            error
        );

        res.status(500).json({
            ok: false,
            mensaje:
                "No se pudo consultar el detalle del estudiante",
            error: error.message
        });
    }
});

/*
=========================================================
SERVIDOR
=========================================================
*/

app.listen(PORT, () => {
    console.log(
        `SQL 11 API ejecutándose en http://localhost:${PORT}`
    );
});