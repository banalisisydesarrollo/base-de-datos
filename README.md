# SQL 11 Colombia — versión ejecutable con Live Server

Esta versión NO necesita Lovable, Flask, Node ni instalar paquetes. Es una aplicación web estática con HTML/CSS/JavaScript y guarda los datos de demostración en `localStorage` del navegador.

## Ejecutar

1. Descomprime la carpeta.
2. Abre `index.html` con VS Code.
3. Usa **Live Server → Open with Live Server**.
4. La dirección puede ser `http://127.0.0.1:5500` (el puerto puede variar).

**No abras `app.py`: esta versión ya no lo necesita.**

## Demo
- Docente: docente@sql11.local / Docente123!
- Estudiante: estudiante@sql11.local / Estudiante123!

## Importante sobre esta versión
Es una versión autónoma para demostración y aula en un navegador. Los datos quedan en el navegador donde se ejecuta, por lo que el panel docente no sincroniza estudiantes entre computadores. Para producción escolar multiusuario se debe conectar a un backend (por ejemplo PostgreSQL/Supabase) con autenticación, RLS y almacenamiento centralizado.

## Mejoras versión 1.1
- Identidad institucional en encabezado.
- Pie de página técnico y crédito de autor.
- Navegación Inicio funcional en toda la SPA.
- Confirmación/registro de actividad antes de iniciar cada lección.
- Mejoras responsive para navegación y pie de página.
