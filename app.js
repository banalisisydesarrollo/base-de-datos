// =========================================================
// CONEXIÓN CON LA API LOCAL DE SQL 11
// =========================================================

const API_BASE_URL = 'http://localhost:3000/api';

async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  let data = null;

  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.mensaje || 'Error de comunicación con la API'
    );
  }

  return data;
}

// =========================================================
// CONTROL DE SESIÓN ACTIVA
// =========================================================

let heartbeatTimer = null;
let heartbeatSessionId = null;

function iniciarHeartbeat(){

  const u = state.current
    ? state.users.find(x => x.email === state.current)
    : null;

  if(!u || u.role !== 'student' || !u.sessionId){
    return;
  }

  // Evita crear varios temporizadores para la misma sesión.
  if(heartbeatTimer && heartbeatSessionId === u.sessionId){
    return;
  }

  if(heartbeatTimer){
    clearInterval(heartbeatTimer);
  }

  heartbeatSessionId = u.sessionId;

  const actualizarActividad = async () => {

    try{

      await apiFetch(
        `/sesiones/${u.sessionId}/actividad`,
        {
          method:'PUT'
        }
      );

    }catch(error){

      console.error(
        'No se pudo actualizar la actividad de la sesión:',
        error
      );

    }

  };

  // Actualizar inmediatamente.
  actualizarActividad();

  // Después, cada 60 segundos.
  heartbeatTimer = setInterval(
    actualizarActividad,
    60000
  );
}

function detenerHeartbeat(){

  if(heartbeatTimer){
    clearInterval(heartbeatTimer);
  }

  heartbeatTimer = null;
  heartbeatSessionId = null;
}

const lessons=[
["Introducción a las bases de datos","Conceptos fundamentales",24,
"Distingue datos, información, bases de datos y sistemas gestores de bases de datos (SGBD).",
`Una base de datos es una colección organizada de datos relacionados que permite almacenar, consultar, actualizar y administrar información de manera estructurada.

En una institución educativa podemos encontrar muchos datos: nombres de estudiantes, códigos, grupos, asignaturas, calificaciones, fechas y asistencia.

Un dato es un valor que representa un hecho o una característica. Cuando varios datos se organizan y se relacionan con un contexto, pueden convertirse en información útil.

Por ejemplo, el dato "11-2" por sí solo tiene poco significado. Si sabemos que corresponde al grupo de un estudiante determinado, adquiere contexto.

Un Sistema Gestor de Bases de Datos (SGBD) es el software que permite crear, administrar, consultar y proteger una base de datos.

Entre las funciones de un SGBD están crear estructuras, insertar datos, consultar información, modificar registros, eliminar información, controlar accesos y mantener la integridad.

Algunos SGBD conocidos son PostgreSQL, MySQL, MariaDB, Microsoft SQL Server y Oracle Database.

En este curso trabajaremos principalmente con bases de datos relacionales y SQL.

Una base de datos relacional organiza la información principalmente mediante tablas. Por ejemplo, podemos tener tablas ESTUDIANTES, GRUPOS, ASIGNATURAS y CALIFICACIONES.

Una tabla ESTUDIANTES podría contener:

id_estudiante | nombre | grupo
1 | Ana | 11-1
2 | Carlos | 11-2
3 | Laura | 11-1

Cada fila representa normalmente un registro y cada columna representa una característica.

Una base de datos bien diseñada evita depender de archivos aislados y facilita consultar y relacionar información.

También es importante proteger los datos. En actividades educativas debemos trabajar con información ficticia y evitar publicar datos personales reales.

Una idea fundamental es que una base de datos no es simplemente un lugar donde se guardan datos: es una estructura organizada que permite almacenar, relacionar, consultar, actualizar y proteger información.`,
[
["¿Qué es una base de datos?",["Una colección organizada de datos relacionados","Un programa para cambiar fondos","Una imagen aislada","Una contraseña"],0,"Una base de datos organiza datos relacionados para poder almacenarlos y administrarlos."],
["¿Qué función cumple principalmente un SGBD?",["Administrar bases de datos","Diseñar diapositivas","Editar fotografías","Crear únicamente contraseñas"],0,"Un SGBD permite crear, consultar, modificar, proteger y administrar bases de datos."],
["¿Cuál diferencia describe mejor un dato y una información?",["El dato es un valor y la información surge cuando tiene organización y contexto","Son exactamente lo mismo","La información siempre es una imagen","Los datos solamente pueden ser números"],0,"Los datos adquieren significado cuando se organizan y se interpretan dentro de un contexto."],
["En una tabla ESTUDIANTES, ¿qué representa normalmente una fila?",["Un registro de un estudiante","El nombre de la base de datos","Una sentencia SQL","Un tipo de dato"],0,"Cada fila representa normalmente un registro individual."],
["En una tabla ESTUDIANTES, ¿qué representa una columna?",["Un atributo o característica","Toda la base de datos","Una contraseña","Una consulta SQL"],0,"Una columna representa un atributo como nombre, grupo o fecha."],
["¿Cuál de los siguientes es un SGBD?",["PostgreSQL","Microsoft Paint","PowerPoint","Bloc de notas"],0,"PostgreSQL es un Sistema Gestor de Bases de Datos relacional."],
["¿Cuál es una ventaja de una base de datos organizada?",["Facilita consultar y relacionar información","Impide realizar consultas","Obliga a duplicar todos los datos","Elimina la necesidad de seguridad"],0,"Una base de datos organizada facilita consultar, relacionar y actualizar información."],
["¿Qué solicita SELECT nombre, grupo FROM estudiantes?",["Los nombres y grupos de los estudiantes","Eliminar todos los estudiantes","Crear una nueva tabla","Modificar todos los grupos"],0,"SELECT solicita las columnas nombre y grupo de la tabla estudiantes."]
]],

["Tablas, registros, campos y tipos de datos","Estructura de datos",24,
"Reconoce tablas, registros, campos y tipos de datos utilizados en bases de datos relacionales.",
`En una base de datos relacional la información se organiza mediante tablas.

Una tabla representa normalmente una entidad o tema. Por ejemplo, una institución puede tener una tabla ESTUDIANTES y otra tabla ASIGNATURAS.

Una fila representa un registro. Cada registro contiene los valores correspondientes a una instancia concreta.

Una columna representa un campo o atributo. Por ejemplo, en ESTUDIANTES podemos tener id_estudiante, nombre, grupo y fecha_nacimiento.

Los tipos de datos indican qué clase de información puede almacenarse.

INTEGER se utiliza para números enteros.
VARCHAR se utiliza para texto.
DATE se utiliza para fechas.
BOOLEAN puede utilizarse para valores verdadero o falso.
NUMERIC puede utilizarse para valores numéricos que necesitan precisión.

Elegir correctamente los tipos de datos ayuda a mantener la consistencia y evita almacenar información de manera incorrecta.

Por ejemplo, una edad puede almacenarse como INTEGER y una fecha de nacimiento como DATE.

También es importante utilizar nombres claros para las columnas. Un nombre como fecha_nacimiento permite comprender mejor el propósito del campo que un nombre ambiguo.

La estructura de una tabla debe responder a la información que realmente necesita el sistema. Antes de crear tablas conviene identificar las entidades, sus atributos y las relaciones entre ellas.`,
[
["En una tabla ESTUDIANTES, ¿qué representa una fila?",["Un registro de un estudiante","El nombre de la tabla","Una consulta SQL","Un tipo de dato"],0,"Cada fila representa un registro individual."],
["¿Qué representa normalmente una columna?",["Un campo o atributo","Toda la base de datos","Una contraseña","Una consulta completa"],0,"Una columna representa una característica de los registros."],
["¿Para qué sirve INTEGER?",["Para almacenar números enteros","Para almacenar fechas","Para almacenar texto variable","Para ordenar registros"],0,"INTEGER representa valores numéricos enteros."],
["¿Qué tipo es apropiado para una fecha?",["DATE","INTEGER","VARCHAR siempre","SELECT"],0,"DATE está diseñado para representar fechas."],
["¿Qué tipo puede utilizarse para texto de longitud variable?",["VARCHAR","DATE","INTEGER","BOOLEAN"],0,"VARCHAR permite almacenar texto de longitud variable."],
["¿Qué tipo representa normalmente verdadero o falso?",["BOOLEAN","DATE","INTEGER","VARCHAR"],0,"BOOLEAN representa valores lógicos como verdadero y falso."],
["¿Por qué es importante elegir tipos de datos adecuados?",["Ayuda a mantener la consistencia de la información","Hace que todas las columnas sean iguales","Elimina las claves","Impide hacer consultas"],0,"Los tipos adecuados ayudan a controlar qué valores pueden almacenarse."],
["¿Cuál nombre de columna es más claro para almacenar la fecha de nacimiento?",["fecha_nacimiento","dato1","campo_x","valor"],0,"Un nombre descriptivo facilita comprender y mantener la estructura."]
]],

["Modelo relacional","Modelo relacional",24,
"Interpreta tablas, filas, columnas y relaciones dentro del modelo relacional.",
`El modelo relacional representa la información mediante tablas relacionadas.

Cada tabla suele representar una entidad o tema. Por ejemplo, GRUPOS puede representar los grupos escolares y ESTUDIANTES puede representar a los estudiantes.

Las tablas contienen filas y columnas. Las filas representan registros y las columnas representan atributos.

Las relaciones permiten conectar información almacenada en diferentes tablas.

Por ejemplo, GRUPOS puede tener:

id_grupo | nombre
1 | 11-1
2 | 11-2

ESTUDIANTES puede tener:

id_estudiante | nombre | id_grupo
1 | Ana | 1
2 | Carlos | 2

El valor id_grupo permite saber a qué grupo pertenece cada estudiante.

Una clave primaria identifica de forma única un registro. Una clave foránea permite establecer una referencia hacia otra tabla.

El modelo relacional ayuda a reducir la repetición innecesaria de información. En lugar de escribir el nombre completo del grupo en cada estudiante, podemos almacenar el identificador del grupo y consultar la información cuando sea necesario.

SQL permite trabajar con este modelo mediante consultas, filtros, ordenamientos, agrupaciones y operaciones entre tablas.`,
[
["¿Qué estructura utiliza principalmente el modelo relacional?",["Tablas con filas y columnas","Imágenes independientes","Archivos de audio","Una sola celda"],0,"El modelo relacional organiza información en tablas."],
["¿Qué permite relacionar tablas?",["Claves","Colores","Fondos","Contraseñas"],0,"Las claves permiten establecer relaciones entre registros."],
["¿Qué identifica de forma única un registro?",["La clave primaria","El color de la tabla","SELECT","Cualquier texto"],0,"La clave primaria identifica de forma única cada registro."],
["¿Qué ventaja ofrece separar información en tablas relacionadas?",["Reduce repetición y facilita consultar datos relacionados","Hace imposible usar SQL","Elimina todas las claves","Obliga a duplicar datos"],0,"Separar entidades ayuda a reducir redundancia."],
["En ESTUDIANTES, ¿qué podría indicar id_grupo?",["El grupo al que pertenece el estudiante","El nombre del estudiante","La fecha de nacimiento","La nota final"],0,"id_grupo puede utilizarse para relacionar al estudiante con GRUPOS."],
["¿Qué representa normalmente una entidad en el modelo relacional?",["Un tema o elemento que necesita almacenarse","Una contraseña","Una consulta","Un botón"],0,"Una entidad representa un elemento o tema relevante para el sistema."],
["¿Qué permite SQL dentro del modelo relacional?",["Consultar y manipular información","Solamente crear imágenes","Solamente diseñar páginas","Únicamente cambiar colores"],0,"SQL permite consultar y manipular datos relacionales."],
["¿Qué problema ayuda a reducir un buen modelo relacional?",["La duplicación innecesaria de información","El uso de teclado","La resolución de pantalla","La conexión eléctrica"],0,"Un buen diseño reduce redundancia y facilita el mantenimiento."]
]],

["Claves primarias y foráneas","Claves",24,
"Diferencia PRIMARY KEY y FOREIGN KEY y comprende su función en la integridad referencial.",
`Las claves son fundamentales para identificar registros y establecer relaciones.

Una PRIMARY KEY o clave primaria identifica de manera única cada fila de una tabla.

Por ejemplo:

CREATE TABLE grupos (
 id_grupo INTEGER PRIMARY KEY,
 nombre VARCHAR(20)
);

Aquí id_grupo identifica cada grupo.

Una FOREIGN KEY o clave foránea es una columna que referencia una clave de otra tabla.

Por ejemplo, si ESTUDIANTES contiene id_grupo como FOREIGN KEY hacia GRUPOS, podemos relacionar cada estudiante con su grupo.

La integridad referencial ayuda a evitar referencias inválidas. Por ejemplo, un estudiante no debería apuntar a un grupo que no existe si la relación está correctamente definida.

Una tabla puede tener una clave primaria compuesta por una sola columna o por varias columnas, dependiendo del diseño.

Las claves no solo sirven para identificar datos: también permiten construir relaciones y mantener la coherencia de la información.

Al diseñar una base de datos es importante decidir qué campo identifica de forma única cada entidad y qué relaciones necesita el sistema.`,
[
["¿Cuál es la función principal de PRIMARY KEY?",["Identificar de forma única cada fila","Ordenar siempre los registros","Eliminar datos","Crear consultas automáticamente"],0,"PRIMARY KEY identifica de manera única cada registro."],
["¿Qué hace una FOREIGN KEY?",["Referencia una clave de otra tabla","Convierte texto en números","Ordena resultados","Elimina una tabla"],0,"Una FOREIGN KEY establece una referencia hacia otra tabla."],
["Si ESTUDIANTES.id_grupo referencia GRUPOS.id_grupo, id_grupo en ESTUDIANTES es...",["Una FOREIGN KEY","Un SELECT","Un HAVING","Una vista"],0,"Es una clave foránea porque referencia otra tabla."],
["¿Qué ayuda a proteger la integridad referencial?",["Las relaciones mediante claves","Los colores","ORDER BY","DISTINCT"],0,"Las claves permiten establecer relaciones válidas entre tablas."],
["¿Puede una PRIMARY KEY identificar dos registros con el mismo valor?",["No","Sí siempre","Solo si son estudiantes","Solo con VARCHAR"],0,"La clave primaria debe identificar registros de forma única."],
["¿Qué relación puede existir entre GRUPOS y ESTUDIANTES?",["Un grupo puede estar relacionado con varios estudiantes","Cada grupo debe tener una sola tabla","Los estudiantes no pueden relacionarse","GRUPOS debe ser una consulta"],0,"Un grupo puede tener múltiples estudiantes."],
["¿Para qué sirve una clave foránea en un diseño escolar?",["Conectar un registro con otro relacionado","Cambiar colores","Ordenar nombres","Crear contraseñas"],0,"Permite conectar información entre tablas relacionadas."],
["¿Qué problema puede aparecer sin integridad referencial?",["Registros que apuntan a entidades inexistentes","Más colores","Menos columnas siempre","Consultas imposibles"],0,"Sin integridad referencial pueden aparecer referencias inválidas."]
]],

["Diseño y normalización básica","Diseño",24,
"Comprende las ideas básicas de normalización y reducción de redundancia.",
`La normalización es un conjunto de principios utilizados para mejorar el diseño de una base de datos.

Su objetivo principal es reducir la redundancia y evitar anomalías al insertar, actualizar o eliminar información.

La Primera Forma Normal, 1FN, promueve valores atómicos. Esto significa que una celda debe contener un valor apropiado y no una lista de varios elementos.

Por ejemplo, almacenar "Fútbol, Música, Lectura" en una sola celda puede dificultar las consultas.

La Segunda Forma Normal, 2FN, se relaciona con las dependencias parciales cuando existe una clave compuesta.

La Tercera Forma Normal, 3FN, busca reducir dependencias transitivas entre atributos.

En un proyecto escolar no siempre será necesario realizar una normalización matemática compleja, pero sí reconocer principios importantes: separar entidades, evitar repetir información y mantener relaciones claras.

Supongamos que guardamos el nombre del grupo repetido en cientos de estudiantes. Si el nombre cambia, tendríamos que modificar muchos registros. Es mejor almacenar el identificador del grupo y mantener el nombre en la tabla GRUPOS.

La normalización debe buscar equilibrio. Un diseño excesivamente fragmentado también puede dificultar el trabajo. Por eso es importante comprender el problema que se quiere resolver.`,
[
["Una celda con 'Fútbol, Música' contradice principalmente...",["1FN","2FN","3FN","HAVING"],0,"1FN busca valores atómicos."],
["¿Qué problema intenta reducir la normalización?",["Redundancia y anomalías","El tamaño de la pantalla","El uso del teclado","El uso de SELECT"],0,"La normalización busca reducir repetición y anomalías."],
["¿Qué busca principalmente 2FN?",["Eliminar dependencias parciales","Crear índices automáticamente","Ordenar filas","Filtrar grupos"],0,"2FN se enfoca en dependencias parciales."],
["¿Qué busca reducir 3FN?",["Dependencias transitivas","Valores atómicos solamente","El número de tablas a cero","El uso de claves"],0,"3FN busca reducir dependencias transitivas."],
["¿Qué problema produce repetir el nombre del grupo en muchos registros?",["Puede generar inconsistencias al actualizar","Hace imposible SELECT","Elimina todas las claves","Convierte texto en números"],0,"La repetición puede provocar datos inconsistentes."],
["¿Cuál es una buena práctica de diseño?",["Separar entidades relacionadas","Guardar todo en una sola columna","Duplicar cada dato","Evitar las claves"],0,"Separar entidades ayuda a mantener una estructura clara."],
["¿Qué significa que un valor sea atómico?",["Que representa un valor individual apropiado","Que contiene toda la base de datos","Que siempre es un número","Que no puede consultarse"],0,"Un valor atómico representa un dato individual."],
["¿Qué busca evitar un buen diseño?",["Datos repetidos e inconsistentes","Las consultas SQL","Las tablas","Las relaciones"],0,"Un buen diseño reduce repetición y errores."]
]],

["Introducción a SQL","Lenguaje SQL",24,
"Reconoce SQL como lenguaje para consultar y manipular bases de datos relacionales.",
`SQL significa Structured Query Language y es el lenguaje utilizado para trabajar con bases de datos relacionales.

SQL permite consultar información mediante SELECT, insertar registros con INSERT, actualizar datos con UPDATE y eliminar registros con DELETE.

También permite definir estructuras mediante instrucciones como CREATE TABLE.

Una consulta sencilla puede ser:

SELECT nombre
FROM estudiantes;

SELECT indica qué columnas queremos recuperar y FROM indica de dónde provienen los datos.

WHERE permite filtrar registros. ORDER BY permite ordenar resultados. GROUP BY permite agrupar registros y HAVING permite filtrar grupos.

SQL no consiste únicamente en memorizar comandos. Lo importante es comprender qué información se necesita y construir una consulta que produzca ese resultado.

Antes de ejecutar operaciones que modifiquen información es importante revisar cuidadosamente las condiciones.

En un entorno educativo podemos practicar SQL con datos ficticios de estudiantes, grupos, asignaturas y calificaciones.`,
[
["¿Qué significa SQL?",["Structured Query Language","Simple Question List","System Query Link","Student Quick Lesson"],0,"SQL significa Structured Query Language."],
["¿Qué palabra se utiliza normalmente para consultar datos?",["SELECT","DELETE","INSERT","CREATE"],0,"SELECT recupera información."],
["¿Qué instrucción agrega registros?",["INSERT","SELECT","UPDATE","DROP"],0,"INSERT permite agregar registros."],
["¿Qué instrucción modifica registros existentes?",["UPDATE","SELECT","CREATE","FROM"],0,"UPDATE modifica valores existentes."],
["¿Qué instrucción elimina registros?",["DELETE","SELECT","INSERT","GROUP BY"],0,"DELETE elimina filas."],
["¿Qué cláusula filtra registros?",["WHERE","FROM","VALUES","ORDER BY"],0,"WHERE permite establecer condiciones."],
["¿Qué cláusula ordena resultados?",["ORDER BY","WHERE","VALUES","HAVING"],0,"ORDER BY organiza el resultado."],
["¿SQL sirve únicamente para consultar datos?",["No, también permite insertar, actualizar, eliminar y definir estructuras","Sí siempre","Solo en PostgreSQL","Solo para tablas pequeñas"],0,"SQL también incluye operaciones de manipulación y definición."]
]],

["SELECT y FROM","Consultas",24,
"Construye consultas sencillas utilizando SELECT y FROM.",
`SELECT es una de las instrucciones fundamentales de SQL.

Su función principal es recuperar información.

Por ejemplo:

SELECT nombre, grupo
FROM estudiantes;

En esta consulta, SELECT indica las columnas que queremos mostrar y FROM indica la tabla de origen.

También existe:

SELECT *
FROM estudiantes;

El asterisco representa todas las columnas.

Aunque SELECT * puede ser útil para explorar una tabla, en consultas concretas suele ser mejor indicar las columnas necesarias.

Una consulta SELECT no modifica los datos. Recupera información.

Podemos solicitar una sola columna, varias columnas o todas las columnas.

Ejemplo:

SELECT nombre
FROM estudiantes;

Otro ejemplo:

SELECT nombre, grupo
FROM estudiantes;

Comprender SELECT y FROM es fundamental porque posteriormente se combinarán con WHERE, ORDER BY, GROUP BY y JOIN.`,
[
["¿Qué parte indica las columnas?",["SELECT nombre, grupo","FROM estudiantes","estudiantes","El punto y coma"],0,"SELECT seguido de las columnas define qué información recuperar."],
["¿Qué indica FROM estudiantes?",["La tabla de origen","Las columnas mostradas","Una condición","Una función"],0,"FROM indica la fuente de los datos."],
["¿Qué representa SELECT *?",["Todas las columnas","Ninguna columna","Solo la primera columna","Todas las tablas"],0,"El asterisco representa todas las columnas."],
["¿SELECT modifica los registros?",["No, normalmente recupera información","Sí, siempre los elimina","Sí, siempre los actualiza","Solo crea claves"],0,"SELECT es una instrucción de consulta."],
["¿Qué consulta obtiene solamente nombre?",["SELECT nombre FROM estudiantes;","SELECT estudiantes FROM nombre;","FROM nombre SELECT estudiantes;","GET nombre estudiantes;"],0,"SELECT nombre FROM estudiantes recupera esa columna."],
["¿Qué consulta obtiene nombre y grupo?",["SELECT nombre, grupo FROM estudiantes;","SELECT estudiantes FROM nombre, grupo;","GROUP nombre FROM estudiantes;","SHOW grupo WHERE nombre;"],0,"La consulta selecciona ambas columnas."],
["¿Qué palabra identifica la fuente de datos?",["FROM","SELECT","WHERE","VALUES"],0,"FROM especifica la tabla o fuente."],
["¿Qué signo permite seleccionar todas las columnas?",["*","?","#","@"],0,"El asterisco representa todas las columnas."]
]],

["WHERE y operadores","Filtrado",24,
"Filtra registros mediante WHERE, operadores de comparación y condiciones lógicas.",
`WHERE permite seleccionar únicamente los registros que cumplen una condición.

Ejemplo:

SELECT nombre
FROM estudiantes
WHERE grupo = '11-1';

Los operadores de comparación incluyen =, <>, >, <, >= y <=.

También podemos combinar condiciones utilizando AND y OR.

AND exige que ambas condiciones sean verdaderas.

OR permite que al menos una condición sea verdadera.

Ejemplo:

WHERE grado = 11 AND grupo = '11-1'

La consulta busca estudiantes que cumplan ambas condiciones.

También podemos utilizar paréntesis para expresar condiciones más complejas.

Es importante distinguir WHERE de HAVING. WHERE filtra filas antes de una agrupación, mientras HAVING filtra grupos después de GROUP BY.

El uso correcto de WHERE es fundamental para obtener resultados precisos y para evitar modificar registros incorrectos cuando se utiliza con UPDATE o DELETE.`,
[
["¿Para qué sirve WHERE?",["Filtrar filas según una condición","Crear una tabla","Ordenar columnas","Insertar registros"],0,"WHERE limita el resultado a las filas que cumplen una condición."],
["¿Qué operador exige que ambas condiciones se cumplan?",["AND","OR","FROM","DESC"],0,"AND exige que ambas condiciones sean verdaderas."],
["¿Qué operador significa diferente de?",["<>","=","<","+"],0,"<> expresa diferencia."],
["¿Qué operador permite cumplir al menos una condición?",["OR","AND","FROM","VALUES"],0,"OR permite que sea verdadera al menos una condición."],
["¿Qué significa grupo = '11-1'?",["Que el grupo debe ser 11-1","Que se cambia el grupo","Que se elimina el grupo","Que se crea el grupo"],0,"Es una condición de comparación."],
["¿Qué operador sirve para valores mayores o iguales?",[">=","<","<>","="],0,">= representa mayor o igual."],
["¿Qué ocurre si WHERE no encuentra coincidencias?",["La consulta no devuelve filas que cumplan la condición","Se eliminan las filas","Se crea una tabla","Se modifica toda la tabla"],0,"Solo aparecen los registros que cumplen la condición."],
["¿Por qué WHERE es importante en UPDATE y DELETE?",["Ayuda a limitar los registros afectados","Porque crea tablas","Porque ordena datos","Porque calcula promedios"],0,"WHERE puede evitar modificar o eliminar registros no deseados."]
]],

["ORDER BY, LIMIT y DISTINCT","Resultados",24,
"Ordena resultados, limita filas y elimina duplicados.",
`ORDER BY permite organizar las filas del resultado.

Por ejemplo:

SELECT nombre, nota
FROM calificaciones
ORDER BY nota DESC;

DESC indica orden descendente.

ASC indica orden ascendente y normalmente es el comportamiento predeterminado.

LIMIT permite restringir la cantidad de filas devueltas.

Por ejemplo:

SELECT *
FROM estudiantes
LIMIT 10;

DISTINCT evita que aparezcan resultados duplicados en las columnas seleccionadas.

Estas herramientas cumplen funciones diferentes.

ORDER BY cambia el orden.

LIMIT limita la cantidad.

DISTINCT elimina duplicados del resultado.

Pueden combinarse. Por ejemplo, podemos ordenar estudiantes por nota de mayor a menor y solicitar solamente los primeros resultados.

Estas cláusulas son muy útiles para construir consultas que presenten información clara y controlada.`,
[
["¿Qué cláusula ordena resultados?",["ORDER BY","WHERE","VALUES","HAVING"],0,"ORDER BY organiza las filas."],
["¿Qué palabra indica orden descendente?",["DESC","ASC","DISTINCT","LIMIT"],0,"DESC significa descendente."],
["¿Qué palabra indica orden ascendente?",["ASC","DESC","LIMIT","WHERE"],0,"ASC significa ascendente."],
["¿Qué hace LIMIT?",["Limita la cantidad de filas","Elimina duplicados","Crea una clave","Ordena siempre"],0,"LIMIT restringe el número de filas."],
["¿Qué hace DISTINCT?",["Elimina duplicados del resultado","Actualiza registros","Crea una tabla","Cuenta automáticamente"],0,"DISTINCT evita repeticiones en el resultado seleccionado."],
["¿Qué cláusula puede ordenar una nota de mayor a menor?",["ORDER BY nota DESC","ORDER BY nota ASC","LIMIT nota","WHERE nota"],0,"ORDER BY nota DESC ordena de mayor a menor."],
["¿ORDER BY modifica los datos almacenados?",["No, solamente organiza el resultado","Sí, siempre","Elimina filas","Actualiza notas"],0,"ORDER BY afecta la presentación del resultado."],
["¿Qué combinación puede mostrar los 5 estudiantes con mayor nota?",["ORDER BY nota DESC + LIMIT 5","DISTINCT + DELETE","WHERE + INSERT","GROUP BY + VALUES"],0,"ORDER BY DESC ordena y LIMIT 5 restringe el resultado."]
]],

["Funciones de agregación","Agregaciones",24,
"Utiliza COUNT, SUM, AVG, MIN y MAX para resumir información.",
`Las funciones de agregación permiten resumir información de varias filas.

COUNT permite contar registros o valores.

SUM suma valores numéricos.

AVG calcula un promedio.

MIN obtiene el menor valor.

MAX obtiene el mayor valor.

Por ejemplo:

SELECT COUNT(*)
FROM estudiantes;

puede indicar cuántos registros existen.

También:

SELECT AVG(nota)
FROM calificaciones;

puede calcular el promedio.

Las funciones de agregación son especialmente útiles cuando se necesita responder preguntas como:

¿Cuántos estudiantes hay?
¿Cuál es la nota promedio?
¿Cuál es la nota más alta?
¿Cuál es la nota más baja?
¿Cuál es la suma de determinadas cantidades?

Cuando se combinan con GROUP BY, las funciones pueden calcular resultados separados para cada grupo.

Es importante comprender que una agregación puede convertir muchas filas en un resultado resumido.`,
[
["¿Qué función calcula un promedio?",["AVG","COUNT","MAX","SUM"],0,"AVG calcula la media."],
["¿Qué función cuenta registros?",["COUNT","AVG","MIN","SUM"],0,"COUNT permite contar registros."],
["¿Qué función suma valores?",["SUM","MAX","COUNT","AVG"],0,"SUM realiza una suma."],
["¿Qué función obtiene el mayor valor?",["MAX","MIN","AVG","COUNT"],0,"MAX devuelve el valor más alto."],
["¿Qué función obtiene el menor valor?",["MIN","MAX","AVG","SUM"],0,"MIN devuelve el valor más bajo."],
["¿Qué consulta puede contar todos los estudiantes?",["SELECT COUNT(*) FROM estudiantes;","SELECT AVG(*) FROM estudiantes;","SELECT MAX(*) FROM estudiantes;","SELECT SUM(*) FROM estudiantes;"],0,"COUNT(*) cuenta las filas."],
["¿Qué función sería apropiada para obtener la nota promedio?",["AVG","COUNT","MAX","MIN"],0,"AVG calcula el promedio."],
["¿Qué ventaja ofrecen las funciones de agregación?",["Permiten resumir información","Eliminan todas las tablas","Cambian contraseñas","Crean imágenes"],0,"Las agregaciones permiten obtener valores resumen."]
]],

["GROUP BY y HAVING","Agrupación",24,
"Comprende la diferencia entre WHERE y HAVING y utiliza agrupaciones.",
`GROUP BY permite reunir filas que tienen valores iguales en una o varias columnas.

Por ejemplo, podemos agrupar estudiantes por grupo.

SELECT grupo, COUNT(*)
FROM estudiantes
GROUP BY grupo;

El resultado puede indicar cuántos estudiantes hay en cada grupo.

HAVING permite filtrar los grupos después de aplicar GROUP BY.

Por ejemplo:

SELECT grupo, COUNT(*)
FROM estudiantes
GROUP BY grupo
HAVING COUNT(*) > 20;

Aquí primero se forman los grupos y después se conservan los que tienen más de 20 estudiantes.

La diferencia fundamental es:

WHERE filtra filas.

GROUP BY forma grupos.

HAVING filtra grupos.

Comprender esta diferencia evita errores frecuentes.

GROUP BY es especialmente útil cuando se necesitan estadísticas por categoría: estudiantes por grupo, promedio por asignatura o cantidad de registros por curso.`,
[
["¿Qué cláusula reúne filas por categoría?",["GROUP BY","WHERE","ORDER BY","VALUES"],0,"GROUP BY forma grupos."],
["¿Qué cláusula filtra grupos?",["HAVING","WHERE","FROM","SELECT"],0,"HAVING filtra después de la agrupación."],
["¿Cuál filtra filas antes de agrupar?",["WHERE","HAVING","LIMIT","DISTINCT"],0,"WHERE filtra filas."],
["¿Qué combinación permite contar estudiantes por grupo?",["GROUP BY grupo + COUNT(*)","DELETE + AVG","LIMIT + VALUES","CREATE + DESC"],0,"GROUP BY y COUNT permiten contar por grupo."],
["¿Qué hace HAVING COUNT(*) > 20?",["Conserva grupos con más de 20 registros","Elimina 20 estudiantes","Crea 20 grupos","Ordena las filas"],0,"HAVING aplica la condición sobre el resultado agrupado."],
["¿Puede WHERE reemplazar siempre a HAVING?",["No, cumplen funciones diferentes","Sí siempre","Solo con DELETE","Solo con INSERT"],0,"WHERE filtra filas y HAVING filtra grupos."],
["¿Qué se ejecuta conceptualmente antes de HAVING?",["La agrupación","La eliminación","La creación de contraseña","El cambio de color"],0,"HAVING trabaja sobre grupos formados."],
["¿Qué ejemplo corresponde a GROUP BY?",["Promedio de nota por asignatura","Cambiar el nombre de un estudiante","Eliminar una tabla","Crear una contraseña"],0,"GROUP BY permite obtener resultados separados por categoría."]
]],

["INSERT INTO","Manipulación",24,
"Inserta nuevos registros utilizando INSERT INTO y VALUES.",
`INSERT INTO se utiliza para agregar nuevas filas a una tabla.

Una forma recomendable de escribir una inserción es indicar la tabla, las columnas y los valores.

Ejemplo:

INSERT INTO estudiantes (nombre, grupo)
VALUES ('Ana', '11-1');

La lista de columnas indica dónde se colocará cada valor.

VALUES contiene los datos que se desean insertar.

Es importante que los valores correspondan a los tipos de datos y restricciones de las columnas.

Si una columna es INTEGER, el valor debe ser apropiado para ese tipo.

Si una columna tiene NOT NULL, debe recibir un valor válido.

Las claves primarias también deben respetar las reglas de unicidad.

INSERT modifica la información almacenada, por lo que conviene revisar cuidadosamente los datos antes de ejecutarlo.

En actividades educativas es recomendable utilizar registros ficticios para practicar.`,
[
["¿Qué instrucción agrega una fila?",["INSERT INTO","SELECT","DELETE","ORDER BY"],0,"INSERT INTO inserta registros."],
["¿Qué palabra contiene los datos a insertar?",["VALUES","WHERE","HAVING","FROM"],0,"VALUES contiene los valores."],
["¿Qué ventaja tiene indicar las columnas?",["Hace explícito dónde irá cada valor","Elimina la necesidad de datos","Convierte todo en texto","Ordena la tabla"],0,"Indicar columnas reduce ambigüedades."],
["¿INSERT modifica la base de datos?",["Sí, agrega registros","No, solo consulta","Solo ordena","Solo crea índices"],0,"INSERT modifica los datos al agregar filas."],
["¿Qué elemento identifica la tabla de destino?",["El nombre después de INSERT INTO","VALUES","WHERE","ORDER BY"],0,"Después de INSERT INTO se indica la tabla."],
["¿Qué debe corresponder con las columnas indicadas?",["Los valores de VALUES","ORDER BY","HAVING","GROUP BY"],0,"Los valores deben corresponder a las columnas."],
["¿Qué puede impedir una inserción?",["Una restricción que no se cumple","El uso de SELECT","ORDER BY","Un comentario"],0,"Las restricciones pueden impedir datos inválidos."],
["¿Qué práctica es apropiada para aprender INSERT?",["Usar datos ficticios de prueba","Usar contraseñas reales","Publicar datos personales","Eliminar todas las claves"],0,"Los ejercicios educativos deben utilizar datos ficticios."]
]],

["UPDATE con seguridad","Actualización",24,
"Modifica registros con UPDATE, SET y WHERE de manera controlada.",
`UPDATE permite modificar valores de registros existentes.

La estructura básica es:

UPDATE estudiantes
SET grupo = '11-2'
WHERE codigo = 'E001';

UPDATE indica la tabla.

SET indica qué columnas cambiarán y cuáles serán sus nuevos valores.

WHERE determina qué filas serán afectadas.

Una de las situaciones más peligrosas es ejecutar UPDATE sin una condición cuando solamente se quería modificar un registro.

Por ejemplo:

UPDATE estudiantes
SET grupo = '11-2';

Esta instrucción podría cambiar el grupo de todos los estudiantes.

Una práctica segura consiste en probar primero la condición con SELECT.

Por ejemplo:

SELECT *
FROM estudiantes
WHERE codigo = 'E001';

Si el resultado corresponde al registro esperado, podemos considerar la actualización.

También es importante realizar copias de seguridad cuando se trabaja con información importante y utilizar transacciones cuando el sistema lo requiera.`,
[
["¿Qué cláusula indica los nuevos valores?",["SET","FROM","VALUES","GROUP BY"],0,"SET especifica los valores que se modificarán."],
["¿Qué cláusula limita las filas afectadas?",["WHERE","ORDER BY","HAVING","DISTINCT"],0,"WHERE determina qué registros se modifican."],
["¿Cuál es el principal riesgo de UPDATE sin WHERE?",["Modificar todas las filas","Crear una nueva tabla","No modificar nada siempre","Convertir todo en fecha"],0,"Sin WHERE la actualización puede afectar toda la tabla."],
["¿Qué práctica ayuda a verificar antes de actualizar?",["Probar un SELECT con la misma condición","Quitar WHERE","Borrar la tabla","Cambiar la clave"],0,"SELECT permite comprobar qué registros cumplen la condición."],
["¿Qué hace SET?",["Define los nuevos valores","Selecciona tablas","Cuenta filas","Ordena resultados"],0,"SET establece los valores nuevos."],
["¿Qué determina WHERE en UPDATE?",["Qué registros serán modificados","Qué columnas existen","Qué tabla se crea","Qué función se utiliza"],0,"WHERE limita las filas afectadas."],
["¿Qué podría ocurrir con UPDATE estudiantes SET grupo='11-2' sin WHERE?",["Podrían cambiar todos los grupos","Solo cambia un registro siempre","Se crea una tabla","No ocurre nada"],0,"Sin WHERE no existe un filtro que limite las filas."],
["¿Por qué probar primero con SELECT?",["Para revisar los registros que serían afectados","Para eliminar datos","Para crear columnas","Para ordenar tablas"],0,"Permite verificar la condición antes de modificar."]
]],

["DELETE y precauciones","Eliminación",24,
"Elimina registros de manera controlada y reconoce los riesgos de DELETE sin WHERE.",
`DELETE FROM permite eliminar filas de una tabla.

Ejemplo:

DELETE FROM estudiantes
WHERE codigo = 'E001';

WHERE determina qué registros serán eliminados.

El riesgo principal aparece cuando se utiliza DELETE sin una condición.

DELETE FROM estudiantes;

puede eliminar todas las filas de la tabla.

Por eso es recomendable revisar primero mediante SELECT qué registros cumplen la condición.

Por ejemplo:

SELECT *
FROM estudiantes
WHERE codigo = 'E001';

Si el resultado es correcto, podemos utilizar la misma condición en DELETE.

DELETE elimina filas, pero no significa necesariamente eliminar la estructura de la tabla.

Las operaciones de eliminación deben realizarse con especial cuidado porque pueden producir pérdida de información.

En sistemas reales también pueden utilizarse copias de seguridad y transacciones para reducir riesgos.`,
[
["¿Qué instrucción elimina filas?",["DELETE","SELECT","AVG","GROUP BY"],0,"DELETE FROM elimina registros."],
["¿Qué cláusula controla qué filas se eliminan?",["WHERE","ORDER BY","VALUES","HAVING"],0,"WHERE limita la eliminación."],
["¿Qué puede ocurrir con DELETE FROM estudiantes sin WHERE?",["Se pueden eliminar todas las filas","Se ordenan los estudiantes","Se agrega una fila","Se crea una copia"],0,"Sin WHERE no existe un filtro."],
["¿Qué conviene hacer antes de un DELETE importante?",["Probar un SELECT con la misma condición","Quitar WHERE","Cambiar el nombre","Usar DISTINCT"],0,"SELECT permite comprobar qué registros serán afectados."],
["¿DELETE elimina necesariamente la estructura de la tabla?",["No, elimina filas","Sí siempre","Solo elimina columnas","Solo cambia nombres"],0,"DELETE elimina registros, no la estructura."],
["¿Qué hace WHERE en DELETE?",["Selecciona las filas que serán eliminadas","Crea una tabla","Ordena resultados","Calcula promedios"],0,"WHERE limita las filas afectadas."],
["¿Cuál es una consecuencia posible de una condición incorrecta?",["Eliminar registros que se necesitaban","Crear automáticamente una copia","Cambiar el monitor","Crear usuarios"],0,"Una condición incorrecta puede provocar pérdida de información."],
["¿Por qué es importante trabajar con datos ficticios en clase?",["Reduce riesgos sobre información personal real","Hace que SQL sea más rápido","Elimina todas las claves","Impide hacer consultas"],0,"Los datos ficticios protegen la privacidad durante la práctica."]
]],

["INNER JOIN","Relaciones",24,
"Combina información relacionada de diferentes tablas mediante INNER JOIN.",
`INNER JOIN permite combinar filas de diferentes tablas cuando existe una coincidencia.

Supongamos:

ESTUDIANTES
id_estudiante | nombre | id_grupo

GRUPOS
id_grupo | nombre

Podemos relacionarlas mediante:

SELECT estudiantes.nombre, grupos.nombre
FROM estudiantes
INNER JOIN grupos
ON estudiantes.id_grupo = grupos.id_grupo;

La condición ON indica cómo se relacionan las tablas.

INNER JOIN devuelve las filas que tienen coincidencia.

Si un estudiante tiene un id_grupo que no coincide con ningún grupo, ese estudiante no aparecerá en el resultado de INNER JOIN.

Los JOIN son fundamentales porque una base de datos relacional normalmente distribuye la información entre varias tablas.

Es importante utilizar correctamente las columnas relacionadas. Una condición incorrecta puede generar resultados incompletos o demasiadas filas.

Los alias pueden hacer las consultas más fáciles de leer, especialmente cuando las tablas tienen nombres largos.`,
[
["¿Qué devuelve INNER JOIN?",["Las coincidencias según la condición","Todas las filas siempre","Solo números","Una tabla permanente"],0,"INNER JOIN conserva coincidencias."],
["¿Qué cláusula establece la condición de unión?",["ON","VALUES","LIMIT","HAVING"],0,"ON define cómo se relacionan las filas."],
["¿Qué ocurre con una fila sin coincidencia?",["No aparece en el resultado","Siempre aparece con NULL","Se convierte en clave","Se elimina de la tabla original"],0,"INNER JOIN solo muestra coincidencias."],
["¿Para qué puede usarse un INNER JOIN escolar?",["Mostrar estudiantes junto con sus grupos","Cambiar contraseñas","Crear imágenes","Borrar tablas"],0,"Permite combinar información relacionada."],
["¿Qué columnas podrían relacionar estudiantes y grupos?",["estudiantes.id_grupo y grupos.id_grupo","nombre y fecha","nota y nombre","codigo y asignatura siempre"],0,"Las claves relacionadas pueden utilizarse en ON."],
["¿Qué palabra aparece después de INNER JOIN?",["El nombre de la tabla relacionada","VALUES","SET","LIMIT"],0,"Después de JOIN se indica la tabla que se incorpora."],
["¿Qué indica ON?",["La condición que relaciona registros","Las columnas que se eliminan","El orden","El límite"],0,"ON define la relación entre filas."],
["¿Por qué son importantes los JOIN?",["Permiten consultar información distribuida entre tablas relacionadas","Eliminan la necesidad de tablas","Solo sirven para ordenar","Solo funcionan con números"],0,"Los JOIN permiten combinar información relacionada."]
]],

["LEFT JOIN","Relaciones",24,
"Comprende cómo LEFT JOIN conserva las filas de la tabla izquierda.",
`LEFT JOIN también combina información entre tablas mediante una condición ON.

La diferencia principal con INNER JOIN es que LEFT JOIN conserva todas las filas de la tabla izquierda.

Ejemplo:

SELECT grupos.nombre, estudiantes.nombre
FROM grupos
LEFT JOIN estudiantes
ON grupos.id_grupo = estudiantes.id_grupo;

Todos los grupos aparecerán.

Si un grupo no tiene estudiantes relacionados, las columnas correspondientes a estudiantes aparecerán como NULL.

Esto permite detectar registros que no tienen coincidencias.

Por ejemplo, podemos buscar grupos que todavía no tengan estudiantes asociados.

La tabla izquierda es la que aparece después de FROM antes de LEFT JOIN.

Comprender qué tabla se conserva es fundamental.

INNER JOIN muestra coincidencias.

LEFT JOIN conserva todas las filas de la izquierda y muestra información relacionada cuando existe.

Esta herramienta es especialmente útil cuando no queremos perder registros de la entidad principal.`,
[
["¿Qué conjunto conserva completo LEFT JOIN?",["La tabla izquierda","La tabla derecha","Solo duplicados","Ninguna tabla"],0,"LEFT JOIN conserva todas las filas de la izquierda."],
["¿Qué aparece en columnas derechas cuando no hay coincidencia?",["NULL","Siempre cero","El nombre de la tabla","Una clave primaria"],0,"Las columnas derechas quedan en NULL."],
["¿Qué condición relaciona las tablas?",["ON","VALUES","LIMIT","DISTINCT"],0,"ON establece la relación."],
["¿Qué ventaja tiene LEFT JOIN frente a INNER JOIN?",["Puede conservar registros de la izquierda sin coincidencia","Siempre elimina NULL","Solo funciona con una tabla","No necesita condición"],0,"LEFT JOIN conserva todas las filas de la izquierda."],
["¿Qué tabla se conserva completa?",["La tabla izquierda","La tabla derecha","Ambas siempre","Ninguna"],0,"La característica principal es conservar la tabla izquierda."],
["¿Qué puede indicar un NULL después de un LEFT JOIN?",["Que no hubo coincidencia en la tabla derecha","Que el registro fue eliminado","Que la tabla no existe","Que SQL falló siempre"],0,"NULL puede indicar ausencia de correspondencia."],
["¿Qué consulta puede detectar grupos sin estudiantes?",["Un LEFT JOIN y buscar NULL en estudiantes","Un DELETE","Un INSERT","Un ORDER BY"],0,"LEFT JOIN permite conservar grupos y detectar los que no tienen coincidencia."],
["¿LEFT JOIN necesita una condición ON en el caso habitual?",["Sí","No siempre","Solo con DELETE","Solo con INSERT"],0,"La condición ON normalmente establece la relación."]
]],

["Subconsultas","Consultas anidadas",24,
"Interpreta subconsultas sencillas dentro de consultas SQL.",
`Una subconsulta es una consulta incluida dentro de otra consulta.

Puede utilizarse cuando necesitamos resolver una parte del problema y utilizar ese resultado en la consulta exterior.

Por ejemplo, una subconsulta podría obtener los grupos de un determinado grado y la consulta exterior podría buscar estudiantes pertenecientes a esos grupos.

IN permite comparar un valor con un conjunto de resultados.

Ejemplo conceptual:

SELECT nombre
FROM estudiantes
WHERE id_grupo IN (
  SELECT id_grupo
  FROM grupos
  WHERE grado = 11
);

La consulta interior obtiene los identificadores de los grupos.

La consulta exterior utiliza esos resultados para buscar estudiantes.

Una subconsulta también puede devolver un único valor. En ese caso puede utilizarse con operadores como =, siempre que el resultado sea compatible.

Las subconsultas permiten expresar problemas en varios pasos dentro de una misma consulta.

Antes de escribir una consulta compleja es recomendable entender primero qué resultado debe producir cada parte.`,
[
["¿Qué es una subconsulta?",["Una consulta dentro de otra consulta","Una tabla sin columnas","Una contraseña","Un tipo de dato"],0,"Una subconsulta está contenida dentro de otra consulta."],
["¿Qué operador es apropiado cuando devuelve varios valores?",["IN","=","SET","VALUES"],0,"IN permite comparar con un conjunto de resultados."],
["¿Qué puede producir una subconsulta?",["Un valor o conjunto de valores","Solamente imágenes","Solo tablas físicas","Una contraseña"],0,"El resultado puede ser utilizado por la consulta exterior."],
["¿Qué operador puede usarse con un único valor compatible?",["=","IN siempre","VALUES","GROUP BY"],0,"= puede comparar con un único resultado."],
["¿Qué parte se ejecuta conceptualmente para producir el resultado interno?",["La subconsulta","ORDER BY siempre","DELETE","CREATE"],0,"La subconsulta produce información para la consulta exterior."],
["¿Para qué puede utilizarse IN?",["Comparar con varios valores","Crear tablas","Actualizar columnas","Ordenar"],0,"IN permite comparar contra varios valores."],
["¿Qué ventaja tienen las subconsultas?",["Permiten resolver una consulta utilizando el resultado de otra","Eliminan todas las tablas","Evitan SQL","Solo sirven para imágenes"],0,"Permiten expresar consultas en varios niveles."],
["¿Qué conviene hacer antes de construir una subconsulta compleja?",["Comprender qué resultado necesita cada parte","Eliminar las claves","Quitar FROM","Borrar los datos"],0,"Comprender cada parte facilita construir la consulta."]
]],

["CREATE TABLE y restricciones","DDL y diseño",24,
"Crea estructuras de tablas y reconoce restricciones básicas.",
`CREATE TABLE permite definir una nueva tabla.

Al crear una tabla se especifican sus columnas, tipos de datos y restricciones.

Ejemplo:

CREATE TABLE estudiantes (
  id_estudiante INTEGER PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  grupo VARCHAR(20)
);

PRIMARY KEY identifica de forma única cada registro.

NOT NULL indica que una columna debe tener un valor.

FOREIGN KEY permite establecer una referencia hacia otra tabla.

Las restricciones ayudan a mantener la calidad y consistencia de los datos.

También pueden existir restricciones como UNIQUE, que evita determinados valores repetidos, y CHECK, que permite establecer condiciones sobre los valores.

Por ejemplo, una nota podría tener una restricción que limite sus valores a un rango permitido.

Diseñar correctamente la estructura antes de insertar información ayuda a prevenir errores.

CREATE TABLE pertenece a las instrucciones utilizadas para definir estructuras de bases de datos.`,
[
["¿Qué comando crea una tabla?",["CREATE TABLE","INSERT TABLE","NEW ROW","MAKE TABLE"],0,"CREATE TABLE define una nueva estructura."],
["¿Qué restricción impide un valor NULL?",["NOT NULL","ORDER BY","HAVING","DISTINCT"],0,"NOT NULL exige un valor."],
["¿Qué restricción identifica registros?",["PRIMARY KEY","LIMIT","WHERE","VALUES"],0,"PRIMARY KEY identifica de forma única."],
["¿Qué restricción referencia otra tabla?",["FOREIGN KEY","DESC","AVG","GROUP BY"],0,"FOREIGN KEY establece una referencia."],
["¿Para qué sirve UNIQUE?",["Evitar determinados valores duplicados","Ordenar registros","Eliminar tablas","Contar filas"],0,"UNIQUE permite exigir unicidad."],
["¿Para qué puede servir CHECK?",["Establecer una condición para los valores","Ordenar columnas","Crear usuarios","Eliminar registros"],0,"CHECK permite definir condiciones sobre los datos."],
["¿Por qué son importantes las restricciones?",["Ayudan a mantener la integridad de los datos","Hacen innecesarias las tablas","Eliminan SQL","Solo cambian colores"],0,"Las restricciones ayudan a evitar datos inválidos."],
["¿Qué define CREATE TABLE además de columnas?",["Tipos de datos y restricciones","Solo colores","Contraseñas","Consultas guardadas siempre"],0,"CREATE TABLE puede definir estructura, tipos y restricciones."]
]],

["Proyecto integrador escolar","Proyecto",24,
"Diseña una pequeña base de datos escolar integrando tablas, claves y consultas.",
`Un proyecto escolar permite integrar los conceptos estudiados.

Una propuesta puede incluir las tablas:

ESTUDIANTES
GRUPOS
ASIGNATURAS
CALIFICACIONES

ESTUDIANTES puede almacenar información básica de cada estudiante.

GRUPOS puede almacenar los grupos escolares.

ASIGNATURAS puede almacenar las materias.

CALIFICACIONES puede relacionar estudiantes y asignaturas y almacenar una nota.

Cada tabla debe tener una clave primaria.

Las relaciones pueden establecerse mediante claves foráneas.

Por ejemplo, CALIFICACIONES podría contener:

id_calificacion
id_estudiante
id_asignatura
nota

Así podemos relacionar una calificación con un estudiante y una asignatura.

Después de crear las tablas se pueden insertar datos ficticios mediante INSERT INTO.

Luego podemos consultar información con SELECT, filtrar con WHERE, ordenar con ORDER BY, agrupar con GROUP BY y combinar tablas mediante JOIN.

El proyecto debe utilizar datos ficticios y respetar la privacidad.

Una buena estrategia es diseñar primero las entidades, luego las columnas, después las claves y finalmente las consultas.`,
[
["¿Qué tabla puede relacionar estudiantes y asignaturas y guardar una nota?",["CALIFICACIONES","MUNICIPIOS","GRUPOS solamente","CONSULTAS"],0,"CALIFICACIONES puede relacionar estudiantes y asignaturas."],
["¿Qué tabla representa naturalmente los grupos escolares?",["GRUPOS","CALIFICACIONES","ASIGNATURAS","CONSULTAS"],0,"GRUPOS puede almacenar los grupos."],
["¿Qué instrucción permite cargar registros?",["INSERT INTO","SELECT","ORDER BY","HAVING"],0,"INSERT INTO agrega registros."],
["¿Qué práctica es apropiada en el proyecto?",["Usar datos ficticios y proteger información personal","Publicar contraseñas reales","Usar datos sensibles de compañeros","Eliminar todas las claves"],0,"Los ejercicios deben utilizar datos ficticios."],
["¿Qué tabla representa las materias?",["ASIGNATURAS","GRUPOS","ESTUDIANTES","CALIFICACIONES"],0,"ASIGNATURAS puede almacenar las materias."],
["¿Qué campo puede almacenar una nota?",["nota","nombre_grupo","fecha_tabla","color"],0,"nota representa el valor de calificación."],
["¿Qué herramienta puede combinar estudiantes con grupos?",["JOIN","DELETE","LIMIT","VALUES"],0,"JOIN permite combinar información relacionada."],
["¿Qué debe definirse antes de construir consultas complejas?",["La estructura y relaciones de las tablas","Los colores","El fondo de pantalla","La contraseña"],0,"Comprender la estructura facilita construir consultas."]
]],

["Repaso y simulacro de SQL","Integración",24,
"Integra consultas, filtros, agregaciones, relaciones y diseño de bases de datos.",
`En esta lección se integran los conceptos fundamentales del curso.

Una base de datos relacional organiza información mediante tablas.

Las claves primarias identifican registros y las claves foráneas permiten establecer relaciones.

SELECT permite consultar información.

WHERE permite filtrar filas.

ORDER BY organiza resultados.

LIMIT restringe la cantidad de filas.

DISTINCT evita duplicados.

COUNT, SUM, AVG, MIN y MAX permiten resumir información.

GROUP BY forma grupos.

HAVING filtra grupos.

INSERT agrega registros.

UPDATE modifica registros.

DELETE elimina registros.

INNER JOIN combina coincidencias entre tablas.

LEFT JOIN conserva todas las filas de la tabla izquierda.

Las subconsultas permiten utilizar el resultado de una consulta dentro de otra.

CREATE TABLE define nuevas estructuras y restricciones.

Una estrategia para resolver problemas SQL es:

1. Comprender qué información se necesita.
2. Identificar las tablas involucradas.
3. Identificar las relaciones.
4. Seleccionar las columnas necesarias.
5. Aplicar filtros.
6. Agrupar cuando sea necesario.
7. Ordenar el resultado si corresponde.
8. Revisar cuidadosamente cualquier modificación.

Antes de UPDATE o DELETE es recomendable comprobar la condición mediante SELECT.

El objetivo final no es memorizar comandos aislados, sino comprender el problema y elegir correctamente las herramientas SQL.`,
[
["¿Qué combinación filtra filas antes de agrupar?",["WHERE + GROUP BY","HAVING + INSERT","DELETE + DISTINCT","LIMIT + CREATE"],0,"WHERE filtra filas y GROUP BY forma grupos."],
["¿Qué combinación permite resumir datos por categoría?",["GROUP BY + función de agregación","DELETE + LIMIT","VALUES + DESC","CREATE + WHERE"],0,"GROUP BY permite formar grupos y las agregaciones resumirlos."],
["¿Qué herramienta combina datos relacionados?",["JOIN","LIMIT","VALUES","NOT NULL"],0,"JOIN combina información entre tablas."],
["¿Cuál es una buena estrategia antes de modificar datos?",["Revisar con SELECT la condición que afectará los registros","Quitar WHERE","Eliminar la tabla","Usar solamente DISTINCT"],0,"SELECT permite verificar los registros antes de modificarlos."],
["¿Qué función obtiene un promedio?",["AVG","COUNT","MAX","SUM"],0,"AVG calcula el promedio."],
["¿Qué cláusula filtra grupos?",["HAVING","WHERE","FROM","SELECT"],0,"HAVING filtra resultados agrupados."],
["¿Qué instrucción agrega registros?",["INSERT INTO","SELECT","DELETE","ORDER BY"],0,"INSERT INTO agrega filas."],
["¿Qué instrucción modifica registros existentes?",["UPDATE","SELECT","INSERT","CREATE"],0,"UPDATE modifica valores de registros existentes."]
]]
];
const exam=[
[
'Una institución necesita consultar qué estudiantes pertenecen a cada grupo. ¿Qué diseño favorece el modelo relacional?',
['Separar ESTUDIANTES y GRUPOS y relacionarlas','Guardar todo en una columna','Un archivo por estudiante','Evitar claves'],
0,
'Separar entidades y relacionarlas reduce redundancia.'
],
[
'¿Qué consulta muestra nombres del grupo 11-1?',
["SELECT nombre FROM estudiantes WHERE grupo='11-1';","DELETE nombre FROM estudiantes WHERE grupo='11-1';","SELECT grupo FROM 11-1;","UPDATE estudiantes SET grupo='11-1';"],
0,
'SELECT recupera datos y WHERE filtra.'
],
[
'¿Qué función calcula el promedio?',
['COUNT','AVG','SUM','MAX'],
1,
'AVG calcula la media.'
],
[
'UPDATE sin WHERE puede…',
['Modificar todas las filas','Crear una base','No modificar nada siempre','Convertir columnas en fechas'],
0,
'Sin WHERE no se limita el conjunto afectado.'
],
[
'¿Qué restricción identifica de forma única un registro?',
['PRIMARY KEY','HAVING','ORDER BY','LIMIT'],
0,
'PRIMARY KEY identifica cada registro.'
],
[
'¿Qué devuelve INNER JOIN?',
['Las coincidencias entre tablas','Todas las filas aunque no coincidan','Solo la primera fila','Una tabla vacía'],
0,
'INNER JOIN conserva coincidencias.'
],
[
'¿Qué hace DISTINCT?',
['Elimina duplicados del resultado','Actualiza datos','Crea una clave','Cuenta filas'],
0,
'DISTINCT elimina resultados repetidos.'
],
[
'¿Qué cláusula ordena resultados?',
['WHERE','ORDER BY','GROUP BY','VALUES'],
1,
'ORDER BY organiza resultados.'
],
[
'Diferencia entre WHERE y HAVING…',
['WHERE filtra filas; HAVING filtra grupos','WHERE crea tablas; HAVING elimina','Son idénticos','HAVING solo sirve para INSERT'],
0,
'WHERE actúa antes de agrupar y HAVING sobre grupos.'
],
[
'¿Qué comando agrega un registro?',
['INSERT INTO','CREATE VIEW','SELECT','DROP'],
0,
'INSERT INTO inserta filas.'
],
[
'¿Qué comando elimina registros?',
['DELETE','SELECT','AVG','GROUP BY'],
0,
'DELETE elimina filas.'
],
[
'¿Qué cláusula conserva todas las filas de la tabla izquierda?',
['INNER JOIN','LEFT JOIN','WHERE','HAVING'],
1,
'LEFT JOIN conserva la izquierda.'
],
[
'¿Qué tipo representa una fecha?',
['DATE','BOOLEAN','INTEGER siempre','BLOB siempre'],
0,
'DATE representa fechas.'
],
[
'¿Qué forma normal busca valores atómicos?',
['1FN','2FN','3FN','0FN'],
0,
'1FN promueve valores atómicos.'
],
[
'¿Qué operador compara contra varios valores de una subconsulta?',
['IN','SET','VALUES','CREATE'],
0,
'IN trabaja con conjuntos de valores.'
],
[
'¿Qué comando crea una tabla?',
['CREATE TABLE','INSERT TABLE','NEW ROW','MAKE DATABASE'],
0,
'CREATE TABLE define una tabla.'
],
[
'¿Qué consulta cuenta registros?',
['SELECT COUNT(*) FROM estudiantes;','DELETE COUNT FROM estudiantes;','AVG estudiantes;','ORDER estudiantes;'],
0,
'COUNT(*) cuenta filas.'
],
[
'id_grupo en ESTUDIANTES que referencia GRUPOS.id_grupo es normalmente…',
['FOREIGN KEY','PRIMARY KEY de toda la BD','VIEW','FUNCTION'],
0,
'La clave foránea referencia otra tabla.'
],
[
'¿Qué palabra limita filas devueltas?',
['LIMIT','UNIQUE','NOT NULL','VALUES'],
0,
'LIMIT restringe la cantidad de filas.'
],
[
'Antes de un DELETE importante conviene…',
['Probar primero un SELECT con la misma condición','Quitar WHERE','Borrar la tabla','Cambiar las claves'],
0,
'Comprobar el conjunto afectado reduce errores.'
],

// ======================================================
// 20 PREGUNTAS NUEVAS
// ======================================================

[
'Una base de datos se utiliza principalmente para…',
['Almacenar y organizar información de manera estructurada','Diseñar únicamente páginas web','Reemplazar el sistema operativo','Crear imágenes'],
0,
'Una base de datos permite almacenar, organizar y consultar información estructurada.'
],
[
'En una tabla de estudiantes, cada fila representa normalmente…',
['Un registro o estudiante','Un tipo de dato','Una base de datos completa','Una consulta SQL'],
0,
'Cada fila representa un registro de la entidad almacenada.'
],
[
'En una tabla, una columna representa principalmente…',
['Un atributo o campo','Una fila completa','Una base de datos','Una relación obligatoria'],
0,
'Las columnas representan atributos de los registros.'
],
[
'¿Cuál de los siguientes es un tipo de dato apropiado para almacenar un número entero?',
['INTEGER','DATE','BOOLEAN','TEXT únicamente'],
0,
'INTEGER permite almacenar números enteros.'
],
[
'¿Cuál es una ventaja de utilizar una clave primaria?',
['Permite identificar de manera única cada registro','Permite eliminar todas las tablas','Impide realizar consultas','Convierte texto en fechas'],
0,
'La clave primaria identifica de forma única cada registro.'
],
[
'Si GRUPOS tiene id_grupo como clave primaria y ESTUDIANTES contiene id_grupo para relacionarse con ella, ¿qué representa id_grupo en ESTUDIANTES?',
['Una clave foránea','Una función','Una vista','Una cláusula ORDER BY'],
0,
'En ESTUDIANTES funciona como referencia hacia la clave primaria de GRUPOS.'
],
[
'¿Qué consulta selecciona todas las columnas de una tabla llamada estudiantes?',
['SELECT * FROM estudiantes;','SELECT ALL estudiantes;','SHOW estudiantes *;','GET * estudiantes;'],
0,
'El asterisco representa todas las columnas.'
],
[
'¿Qué operador se utiliza normalmente para buscar valores dentro de un rango?',
['BETWEEN','CREATE','VALUES','DROP'],
0,
'BETWEEN permite establecer un rango de valores.'
],
[
'¿Qué operador permite combinar condiciones donde ambas deben cumplirse?',
['AND','OR','NOT NULL','ORDER'],
0,
'AND exige que las condiciones combinadas sean verdaderas.'
],
[
'¿Qué operador permite aceptar una condición u otra?',
['OR','AND','PRIMARY','GROUP'],
0,
'OR permite que se cumpla al menos una de las condiciones.'
],
[
'¿Qué operador se utiliza frecuentemente para buscar un patrón de texto?',
['LIKE','COUNT','SUM','LIMIT'],
0,
'LIKE permite comparar textos utilizando patrones.'
],
[
'¿Qué hace COUNT(*) en una consulta?',
['Cuenta las filas del resultado','Calcula un promedio','Ordena las filas','Modifica los registros'],
0,
'COUNT(*) cuenta las filas que forman parte del resultado.'
],
[
'¿Qué función devuelve el valor máximo de una columna?',
['MAX','MIN','AVG','COUNT'],
0,
'MAX devuelve el valor mayor.'
],
[
'¿Qué función devuelve el valor mínimo de una columna?',
['MIN','MAX','SUM','AVG'],
0,
'MIN devuelve el valor menor.'
],
[
'¿Qué función suma valores numéricos?',
['SUM','AVG','COUNT','MIN'],
0,
'SUM calcula la suma de los valores.'
],
[
'¿Para qué se utiliza GROUP BY?',
['Para agrupar filas que comparten valores en determinadas columnas','Para eliminar una tabla','Para crear usuarios','Para insertar una sola fila'],
0,
'GROUP BY permite formar grupos para realizar análisis y agregaciones.'
],
[
'¿Cuál es el propósito principal de una restricción NOT NULL?',
['Evitar que una columna almacene valores NULL','Ordenar registros','Crear una consulta','Eliminar duplicados automáticamente'],
0,
'NOT NULL exige que la columna tenga un valor.'
],
[
'¿Qué palabra clave evita valores repetidos en una columna cuando se define como restricción UNIQUE?',
['UNIQUE','GROUP BY','LIMIT','HAVING'],
0,
'UNIQUE establece que los valores de la columna no se repitan.'
],
[
'¿Qué sentencia se utiliza para modificar datos existentes?',
['UPDATE','INSERT','CREATE','SELECT'],
0,
'UPDATE modifica registros que cumplen una condición.'
],
[
'¿Qué sentencia permite modificar la estructura o definición de una tabla?',
['ALTER TABLE','SELECT TABLE','UPDATE TABLES','CHANGE DATABASE ROW'],
0,
'ALTER TABLE permite modificar la estructura de una tabla.'
]
];
let state=JSON.parse(localStorage.getItem('sql11_state')||'null')||{users:[],current:null,progress:{},answers:{},attempts:{}};
const save=()=>localStorage.setItem('sql11_state',JSON.stringify(state));
const $=s=>document.querySelector(s); const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

function render(){

  const app=$('#app');

  if(!state.current){
    detenerHeartbeat();
    return home();
  }

  const u=
    state.users.find(
      x=>x.email===state.current
    );

  if(!u){

    state.current=null;
    save();
    detenerHeartbeat();

    return home();
  }

  // Mantener activa la sesión del estudiante.
  if(u.role==='student'){
    iniciarHeartbeat();
  }else{
    detenerHeartbeat();
  }

  if(u.role==='teacher'){
    teacher();
  }else{
    dashboard();
  }
}

function goInicio(){
  const u = state.current
    ? state.users.find(x => x.email === state.current)
    : null;

  if(!u){
    home();
    return;
  }

  if(u.role === 'teacher'){
    home();
    return;
  }

  dashboard();
}

function shell(content){
  const u=state.current ? state.users.find(x=>x.email===state.current) : null;
  const navExam = u && u.role==='student' ? `<button type="button" onclick="examIntro()">Examen</button>` : '';
  const navTeacher = u && u.role==='teacher' ? `<button type="button" onclick="teacher()">Panel docente</button>` : '';
  $('#app').innerHTML=`
    <header class="top">
      <div class="institution">
        <div class="institution-mark">I.E.</div>
        <div>
          <strong>TECNOLOGÍA INFORMÁTICA</strong>
          <span>INSTITUCIÓN EDUCATIVA DIEGO MAYA SALAZAR</span>
        </div>
      </div>
      <div class="brand institution-title">
        <span class="logo">SQL</span>
        
      </div>
      <div class="nav">
        <button type="button" class="nav-active" onclick="goInicio();window.scrollTo({top:0,behavior:'smooth'})">⌂ Inicio</button>
        ${u && u.role==='student' ? `<button type="button" onclick="dashboard()">▣ Lecciones</button>` : ''}
        ${navExam}${navTeacher}
        <button type="button" onclick="logout()">Salir</button>
      </div>
    </header>
    <main class="wrap">${content}</main>
    ${siteFooter()}
  `;
}
function siteFooter(){
  return `<footer class="site-footer">
    <div class="footer-main">
      <div><strong>Desarrollado por @ Brayan Smith Andrades</strong><p>Proyecto educativo de Tecnología Informática · Bachillerato · Grado 11.</p></div>
      <div><strong>Institución Educativa Diego Maya Salazar</strong><p>Tecnología Informática · Bases de Datos y Lenguaje SQL · Colombia.</p></div>
      <div><strong>Información técnica</strong><p>HTML5 · CSS3 · JavaScript ES6+ · SPA · Diseño responsive · LocalStorage · Compatible con celulares, tablets y computadores.</p></div>
    </div>
    <div class="footer-bottom">SQL · Aplicación web educativa · Arquitectura SPA · Persistencia local en el navegador · Versión 1.1</div>
  </footer>`;
}
function home(){
  $('#app').innerHTML=`
    <header class="top top-public">
      <div class="institution">
        <div class="institution-mark">I.E.</div>
        <div>
          <strong>TECNOLOGÍA INFORMÁTICA</strong>
          <span>INSTITUCIÓN EDUCATIVA DIEGO MAYA SALAZAR</span>
        </div>
      </div>
      <div class="brand institution-title">
        <span class="logo">SQL</span>
        
      </div>
      <div class="nav">
        <button type="button" class="nav-active" onclick="home();window.scrollTo({top:0,behavior:'smooth'})">⌂ Inicio</button>
        <button type="button" onclick="register()">▣ Lecciones</button>
        <button type="button" onclick="login()">Examen</button>
        <button type="button" onclick="login()">Ingresar</button>
      </div>
    </header>
    
    <main class="wrap">
      <section class="hero">
        <div>
          <span class="eyebrow">BACHILLERATO · GRADO 11</span>
          <h1>Aprende <span>SQL</span> construyendo.</h1>
          <p class="lead">20 lecciones interactivas de bases de datos, práctica guiada, seguimiento del progreso y un examen final de 20 preguntas.</p>
          <div class="actions">
            <button class="btn primary" onclick="register()">Crear cuenta</button>
            <button class="btn secondary" onclick="login()">Ingresar</button>
            <button class="btn secondary" onclick="home();window.scrollTo({top:0,behavior:'smooth'})">⌂ Inicio</button>
          </div>
        </div>
        <div class="code">
          <b>Tu recorrido de aprendizaje</b>
          <pre>SELECT nombre, grupo
FROM estudiantes
WHERE grado = 11
ORDER BY nombre;</pre>
          <p>20 lecciones · máximo 30 min · 3 intentos</p>
        </div>
      </section>
      <section class="cards">
        <article><b>01 · Secuencial</b><h3>Aprende paso a paso</h3><p>Las 20 lecciones están organizadas en orden. No puedes saltar lecciones.</p></article>
        <article><b>02 · Interactivo</b><h3>Practica mientras aprendes</h3><p>Ejercicios, consultas y retroalimentación inmediata.</p></article>
        <article><b>03 · Docente</b><h3>Seguimiento</h3><p>El docente puede ver tu progreso, evaluaciones y resultados.</p></article>
      </section>
      <section class="tech-strip">
        <div><b>Lenguaje SQL</b><span>estándar relacional</span></div>
        <div><b>Responsive</b><span>móviles y computadores</span></div>
        <div><b>Seguimiento</b><span>progreso persistente</span></div>
        <div><b>Evaluación</b><span>3 intentos · 1.0 a 5.0</span></div>
      </section>
    </main>
    ${siteFooter()}
  `;
}
function login(){form('Ingresar',`<label>Correo<input id="email" type="email" required></label><label>Contraseña<input id="password" type="password" required></label><button class="btn primary" onclick="doLogin()">Ingresar</button>`)}
function register(){

  form(
    'Registro de estudiante',
    `
      <div class="formgrid">

        <label>
          Nombres
          <input id="first">
        </label>

        <label>
          Apellidos
          <input id="last">
        </label>

        <label>
          Código estudiantil
          <input id="code">
        </label>

        <label>
          Institución
          <input id="inst">
        </label>

        <label>
          Grado
          <select id="grade">
            <option value="">
              Selecciona el grado
            </option>

            <option value="11B">
              11B
            </option>

            <option value="11C">
              11C
            </option>
          </select>
        </label>

        <label class="wide">
          Correo
          <input
            id="email"
            type="email">
        </label>

        <label class="wide">
          Contraseña
          <input
            id="password"
            type="password">
        </label>

      </div>

      <div class="notice">
        Selecciona el grado correspondiente:
        11B o 11C.
      </div>

      <button
        class="btn primary"
        onclick="doRegister()">
        Crear cuenta
      </button>
    `
  );
}

function form(title,body){
  $('#app').innerHTML=`<header class="top top-public">
    <div class="institution"><div class="institution-mark">I.E.</div><div><strong>TECNOLOGÍA INFORMÁTICA</strong><span>INSTITUCIÓN EDUCATIVA DIEGO MAYA SALAZAR</span></div></div>
    <div class="brand"><span class="logo">SQL</span></div>
    <div class="nav"><button type="button" class="nav-active" onclick="home();window.scrollTo({top:0,behavior:'smooth'})">⌂ Inicio</button><button type="button" onclick="login()">Ingresar</button></div>
  </header><main class="wrap"><div class="form"><span class="eyebrow"></span><h1>${title}</h1><div class="formgrid">${body}</div><p><button class="btn secondary" onclick="home()">← Volver al inicio</button></p></div></main>${siteFooter()}`;
}
async function doLogin(){

  const email =
    $('#email').value.trim().toLowerCase();

  const pw =
    $('#password').value;

  if(!email || !pw){
    return alert(
      'Ingresa el correo y la contraseña.'
    );
  }


  // =====================================================
  // ACCESO DEL DOCENTE
  // =====================================================

  if(
    email === 'docente@sql11.local' &&
    pw === 'Docente123!'
  ){

    if(
      !state.users.some(
        x => x.email === email
      )
    ){

      state.users.push({

        email,

        first:
          'Docente',

        last:
          'Demo',

        role:
          'teacher'

      });

    }

    state.current =
      email;

    save();

    return render();
  }


  // =====================================================
  // ACCESO DEL ESTUDIANTE MEDIANTE POSTGRESQL
  // =====================================================

  try{

    const respuesta =
      await apiFetch('/login',{
        method:'POST',

        body:JSON.stringify({

          correo:
            email,

          password:
            pw

        })

      });


    const estudiante =
      respuesta.estudiante;

    const sesion =
      respuesta.sesion;


    // =====================================================
    // RECUPERAR DATOS LOCALES COMPLEMENTARIOS
    // =====================================================

    const usuarioExistente =
      state.users.find(
        x => x.email === email
      );


    const gradoEstudiante =
      estudiante.grado ||
      usuarioExistente?.grado ||
      usuarioExistente?.grade ||
      '';


    const u={

      id:
        estudiante.id,

      email:
        estudiante.correo,

      first:
        usuarioExistente?.first ||
        estudiante.nombre_completo
          .split(' ')[0],

      last:
        usuarioExistente?.last ||
        estudiante.nombre_completo
          .split(' ')
          .slice(1)
          .join(' '),

      code:
        usuarioExistente?.code ||
        '',

      inst:
        usuarioExistente?.inst ||
        '',

      group:
        usuarioExistente?.group ||
        '',

      grado:
        gradoEstudiante,

      role:
        'student',

      sessionId:
        sesion.id
    };


    // =====================================================
    // ACTUALIZAR USUARIO ACTUAL
    // =====================================================

    const indice =
      state.users.findIndex(
        x => x.email === email
      );


    if(indice >= 0){

      state.users[indice] =
        u;

    }else{

      state.users.push(
        u
      );

    }


    state.current =
      email;


    // =====================================================
    // RECUPERAR PROGRESO DESDE POSTGRESQL
    // =====================================================

    const progresoRespuesta =
      await apiFetch(
        `/progreso/${estudiante.id}`
      );


    state.progress[email] =
      {};


    progresoRespuesta.progreso
      .forEach(item => {

        state.progress[email][item.leccion] = {

          done:
            item.completada,

          porcentaje:
            Number(
              item.porcentaje
            ),

          fechaActualizacion:
            item.fecha_actualizacion

        };

      });


    // =====================================================
    // RECUPERAR INTENTOS DEL EXAMEN
    // =====================================================

    const evaluacionesRespuesta =
      await apiFetch(
        `/evaluaciones/${estudiante.id}`
      );


    state.attempts[email] =
      evaluacionesRespuesta
        .evaluaciones
        .map(item => ({

          correct:
            Number(
              item.aciertos
            ),

          score:
            Number(
              item.nota
            ),

          date:
            item.fecha_hora,

          intento:
            Number(
              item.intento
            ),

          answers:
            []

        }));


    // =====================================================
    // GUARDAR Y MOSTRAR RECORRIDO
    // =====================================================

    save();

    render();


  }catch(error){

    console.error(
      'Error iniciando sesión:',
      error
    );

    alert(
      error.message ||
      'No se pudo iniciar sesión.'
    );

  }

}

async function doRegister(){

  const v=id =>
    $('#'+id).value.trim();

  const first =
    v('first');

  const last =
    v('last');

  const code =
    v('code');

  const inst =
    v('inst');

  const grade =
    v('grade');

  const email =
    v('email').toLowerCase();

  const password =
    v('password');

  if(
    !first ||
    !last ||
    !code ||
    !inst ||
    !grade ||
    !email ||
    !password
  ){
    return alert(
      'Completa todos los campos.'
    );
  }

  if(
    grade !== '11B' &&
    grade !== '11C'
  ){
    return alert(
      'Selecciona 11B o 11C.'
    );
  }

  if(password.length < 8){
    return alert(
      'La contraseña debe tener al menos 8 caracteres.'
    );
  }

  if(
    state.users.some(
      x =>
        x.email === email ||
        x.code === code
    )
  ){
    return alert(
      'Correo o código ya registrado.'
    );
  }

  try{

    const respuesta =
      await apiFetch(
        '/estudiantes',
        {
          method:'POST',

          body:JSON.stringify({

            nombre_completo:
              `${first} ${last}`,

            correo:
              email,

            password:
              password,

            grado:
              grade
          })
        }
      );

    const estudiante =
      respuesta.estudiante;

    const u={

      id:
        estudiante.id,

      email:
        estudiante.correo,

      first,
      last,
      code,
      inst,
      grade,

      role:
        'student'
    };

    state.users.push(u);

    state.current =
      u.email;

    save();
    render();

  }catch(error){

    console.error(
      'Error registrando estudiante:',
      error
    );

    alert(
      error.message ||
      'No se pudo registrar el estudiante.'
    );
  }
}
async function logout(){

  const u =
    state.current
      ? state.users.find(
          x=>x.email===state.current
        )
      : null;

  detenerHeartbeat();

  if(u?.sessionId){

    try{

      await apiFetch(
        `/sesiones/${u.sessionId}/cerrar`,
        {
          method:'PUT'
        }
      );

    }catch(error){

      console.error(
        'No se pudo cerrar la sesión:',
        error
      );

    }
  }

  state.current=null;
  save();
  home();
}

function prog(){const p=state.progress[state.current]||{};return lessons.reduce((n,_,i)=>n+(p[i+1]?.done?1:0),0)}
function dashboard(){

  const u =
    state.users.find(
      x => x.email === state.current
    );

  if(!u){
    return home();
  }

  if(u.role === 'teacher'){
    return teacher();
  }

  const done =
    prog();

  const pct =
    done * 5;

  let cards = '';

  for(let i=0; i<20; i++){

    const id =
      i + 1;

    const prev =
      id === 1 ||
      state.progress[state.current]?.[id - 1]?.done;

    const pr =
      state.progress[state.current]?.[id];

    const unlocked =
      prev || pr?.done;

    cards += `
      <article
        class="lesson ${!unlocked ? 'lock' : ''}">

        <div class="num">
          ${String(id).padStart(2,'0')}
        </div>

        <div>

          <span class="tag">
            ${lessons[i][2]} min ·
            ${lessons[i][1]}
          </span>

          <h3>
            ${lessons[i][0]}
          </h3>

          <p>
            ${lessons[i][3]}
          </p>

        </div>

        ${
          pr?.done
            ? '<span>✓ Completada</span>'
            : unlocked
              ? `
                <button
                  class="btn small primary"
                  onclick="startLesson(${id})">
                  Continuar
                </button>
              `
              : '<span>🔒 Bloqueada</span>'
        }

      </article>
    `;
  }

  shell(`
    <div class="head">

      <div>

        <span class="eyebrow">
          MI RECORRIDO
        </span>

        <h1>
          Hola, ${esc(u.first)} 👋
        </h1>

        <p>
          ${esc(u.inst || '')}
          Grado ${esc(u.grado || '—')}
        </p>

      </div>

      <div
        class="ring"
        style="--deg:${pct * 3.6}deg">

        <i>
          ${pct}%
        </i>

      </div>

    </div>

    <div class="bar">
      <span
        style="width:${pct}%">
      </span>
    </div>

    <h2>
      20 lecciones
    </h2>

    <div class="grid">
      ${cards}
    </div>

    <div
      class="panel exam-panel"
      style="margin-top:18px">

      <span class="eyebrow">
        DESAFÍO FINAL
      </span>

      <h2>
        Examen final
      </h2>

      <p>
        Se desbloquea cuando completes
        las 20 lecciones. Tienes máximo
        3 intentos y la nota final será
        la más alta.
      </p>

      <button
        class="btn primary"
        onclick="examIntro()">

        Ver instrucciones del examen

      </button>

    </div>
  `);
}
function startLesson(id){
  const u=state.users.find(x=>x.email===state.current);
  if(id>1&&!state.progress[state.current]?.[id-1]?.done)return alert('Debes completar la lección anterior.');
  state.progress[state.current]??={};
  const existing=state.progress[state.current][id];
  if(existing?.done){ lessonView(id); return; }
  const proceed=confirm(`REGISTRO DE ACTIVIDAD\n\nEstudiante: ${u.first} ${u.last}\nCódigo: ${u.code||'—'}\nInstitución: ${u.inst||'—'}\nGrado: 11 · Grupo: ${u.group||'—'}\n\nAntes de iniciar, confirma que realizarás esta actividad de manera individual.\n\n¿Deseas comenzar la lección ${id}?`);
  if(!proceed)return;
  state.progress[state.current][id]??={started:new Date().toISOString(),done:false,answers:[]};
  state.progress[state.current][id].registration={name:`${u.first} ${u.last}`,code:u.code||'',institution:u.inst||'',group:u.group||'',accepted:true,date:new Date().toISOString()};
  if(!Array.isArray(state.progress[state.current][id].questionOrder)){
    state.progress[state.current][id].questionOrder=shuffleIndexes(lessons[id-1][5].length, `${state.current}|${id}`);
  }
  save(); lessonView(id);
}
function shuffleIndexes(length, seedText){
  const arr=Array.from({length},(_,i)=>i);
  let seed=0;
  for(let i=0;i<seedText.length;i++) seed=(seed*31+seedText.charCodeAt(i))>>>0;
  for(let i=arr.length-1;i>0;i--){
    seed=(1664525*seed+1013904223)>>>0;
    const j=seed%(i+1);
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

// =========================================================
// MEZCLA DE OPCIONES
// =========================================================

function shuffleOptions(question, seedText){

  const opciones = question[1].map((texto, indice) => ({
    texto,
    original: indice
  }));

  const orden = shuffleIndexes(
    opciones.length,
    seedText
  );

  const mezcladas = orden.map(i => opciones[i]);

  const correctaOriginal = question[2];

  const correctaNueva =
    mezcladas.findIndex(
      opcion => opcion.original === correctaOriginal
    );

  return {
    opciones: mezcladas,
    correcta: correctaNueva
  };
}


// =========================================================
// PREPARAR PREGUNTAS DE UNA LECCIÓN
// =========================================================

function getLessonQuestion(id, qIndex){

  const q = lessons[id-1][5][qIndex];

  const mezcla = shuffleOptions(
    q,
    `${state.current}|LECCION|${id}|PREGUNTA|${qIndex}`
  );

  return {
    question: q,
    opciones: mezcla.opciones,
    correcta: mezcla.correcta
  };
}

let lessonTimerId = null;

function detenerTemporizadorLeccion(){
  if(lessonTimerId){
    clearInterval(lessonTimerId);
    lessonTimerId = null;
  }
}

function lessonView(id){

  detenerTemporizadorLeccion();

  const l = lessons[id-1];

  const progress =
    state.progress[state.current][id] || {};

  if(!progress.started){
    progress.started = new Date().toISOString();

    state.progress[state.current][id] = progress;

    save();
  }

  const startedTime = Date.parse(progress.started);

  if(Number.isNaN(startedTime)){
    progress.started = new Date().toISOString();

    state.progress[state.current][id] = progress;

    save();
  }

  const order =
    Array.isArray(progress.questionOrder)
      ? progress.questionOrder
      : shuffleIndexes(
          l[5].length,
          `${state.current}|${id}`
        );

  if(!Array.isArray(progress.questionOrder)){

    progress.questionOrder = order;

    state.progress[state.current][id] = progress;

    save();
  }

  let html = `
    <div class="lessonview">

      <a href="#" onclick="dashboard();return false">
        ← Mi progreso
      </a>

      <div class="intro">

        <span class="eyebrow">
          LECCIÓN ${String(id).padStart(2,'0')} · ${l[1]}
        </span>

        <h1>${l[0]}</h1>

        <p class="lead">
          ${l[3]}
        </p>

      </div>

      <div class="panel lesson-timer-panel">

        <div>
          <span class="eyebrow">
            TIEMPO DE LA LECCIÓN
          </span>

          <h2 id="lesson-timer">
            24:00
          </h2>
        </div>

        <div>
          <strong id="lesson-timer-status">
            Tiempo mínimo: 24 minutos
          </strong>

          <p>
            La lección debe trabajarse durante mínimo
            24 minutos y tiene un límite de 45 minutos.
          </p>
        </div>

      </div>

      <div class="info">

        <h3>Concepto clave</h3>

        <p>${l[4]}</p>

      </div>

      <div class="example">

        <b>Ejemplo</b>

        <pre>
          SELECT nombre, grupo
          FROM estudiantes
          WHERE grupo = '11-1';
        </pre>

      </div>

      <div class="activity">

        <b>RETO INTERACTIVO · 8 PREGUNTAS</b>

        <p>
          Las preguntas y sus opciones aparecen en
          un orden personalizado para cada estudiante.
        </p>

  `;

  order.forEach((qIndex,displayIndex)=>{

    const mezcla =
      getLessonQuestion(id,qIndex);

    html += `

      <section
        class="question-block"
        data-q="${displayIndex}"
        data-original="${qIndex}">

        <h2>
          ${displayIndex+1}. ${esc(mezcla.question[0])}
        </h2>

        <div class="opts">

          ${mezcla.opciones.map((o,i)=>`

            <button
              type="button"
              class="opt"
              data-i="${i}">

              ${'ABCD'[i]}. ${esc(o.texto)}

            </button>

          `).join('')}

        </div>

        <button
          type="button"
          class="btn primary check-lesson"
          data-q="${displayIndex}">

          Revisar respuesta

        </button>

        <div
          class="fb"
          id="fb-${displayIndex}">
        </div>

      </section>

    `;
  });

  html += `

      </div>

      <div class="panel">

        <h3>Resumen</h3>

        <p>
          Revisa las 8 preguntas, lee la retroalimentación
          y completa el tiempo mínimo de la actividad antes
          de finalizar la lección.
        </p>

        <button
          id="complete-lesson-btn"
          class="btn primary"
          onclick="completeLesson(${id})">

          🔒 Completar cuando llegues a 24 minutos

        </button>

      </div>

    </div>
  `;

  shell(html);

  const timerElement =
    document.getElementById('lesson-timer');

  const statusElement =
    document.getElementById('lesson-timer-status');

  const completeButton =
    document.getElementById('complete-lesson-btn');

  const actualizarTemporizador = async () => {

    const actual = Date.now();

    const inicio =
      Date.parse(
        state.progress[state.current][id].started
      );

    const transcurrido =
      Math.max(
        0,
        actual - inicio
      );

    const segundos =
      Math.floor(transcurrido / 1000);

    const minimo =
      20 * 60;

    const maximo =
      25 * 60;

    const minutosTranscurridos =
      Math.floor(segundos / 60);

    const segundosTranscurridos =
      segundos % 60;

    if(!timerElement) return;

    if(segundos < minimo){

      timerElement.textContent =
        `${String(minutosTranscurridos).padStart(2,'0')}:${String(segundosTranscurridos).padStart(2,'0')}`;

      statusElement.textContent =
        'Debes permanecer en la actividad hasta completar 20 minutos.';

      completeButton.disabled = true;

      completeButton.textContent =
        '🔒 Completar cuando llegues a 20 minutos';

    }else if(segundos < maximo){

      timerElement.textContent =
        `${String(minutosTranscurridos).padStart(2,'0')}:${String(segundosTranscurridos).padStart(2,'0')}`;

      statusElement.textContent =
        '✓ Tiempo mínimo cumplido. Ya puedes finalizar la lección.';

      completeButton.disabled = false;

      completeButton.textContent =
        '✓ Finalizar lección';

    }else{

      timerElement.textContent =
        '25:00';

      statusElement.textContent =
        'Tiempo máximo alcanzado. Finalizando la lección...';

      completeButton.disabled = true;

      completeButton.textContent =
        '⏱ Tiempo agotado';

      detenerTemporizadorLeccion();

      await completeLesson(id);

    }

  };

  actualizarTemporizador();

  lessonTimerId =
    setInterval(
      actualizarTemporizador,
      1000
    );


  document
    .querySelectorAll('.question-block')
    .forEach(block=>{

      let selected = null;

      block
        .querySelectorAll('.opt')
        .forEach(b=>{

          b.onclick = ()=>{

            block
              .querySelectorAll('.opt')
              .forEach(x=>
                x.classList.remove('sel')
              );

            b.classList.add('sel');

            selected = +b.dataset.i;
          };

        });


      block
        .querySelector('.check-lesson')
        .onclick = async ()=>{

          if(selected === null){

            return alert(
              'Selecciona una opción.'
            );

          }

          const qIndex =
            +block.dataset.original;

          const mezcla =
            getLessonQuestion(
              id,
              qIndex
            );

          const ok =
            selected === mezcla.correcta;


          block
            .querySelector('.fb')
            .innerHTML = `

              <div class="feedback ${ok?'ok':'bad'}">

                <b>
                  ${ok
                    ? '¡Correcto!'
                    : 'Revisa tu respuesta.'
                  }
                </b>

                <br>

                ${esc(
                  mezcla.question[3]
                )}

              </div>
            `;


          state.progress[state.current][id]
            .answers ??= [];

          state.progress[state.current][id]
            .answers.push({

              question:qIndex,

              selected,

              correct:ok,

              time:new Date().toISOString()

            });

          save();


          const u =
            state.users.find(
              x=>x.email===state.current
            );


          if(!u || !u.id){

            console.error(
              'No se encontró el estudiante para guardar la respuesta.'
            );

            return;
          }


          try{

            await apiFetch('/actividad',{

              method:'POST',

              body:JSON.stringify({

                estudiante_id:u.id,

                leccion:id,

                accion:'RESPUESTA_PREGUNTA',

                detalle:
                  `Pregunta ${qIndex+1} · ` +
                  `Respuesta seleccionada: ${'ABCD'[selected]} · ` +
                  `Resultado: ${ok?'CORRECTA':'INCORRECTA'}`

              })

            });

          }catch(error){

            console.error(
              'Error guardando la respuesta en PostgreSQL:',
              error
            );

          }

        };

    });

}

async function completeLesson(id){

  const progress =
    state.progress[state.current]?.[id];

  if(!progress){

    return alert(
      'No se encontró el progreso de esta lección.'
    );

  }

  // =====================================================
  // VALIDAR LAS 8 PREGUNTAS
  // =====================================================

  const totalPreguntas =
    lessons[id-1][5].length;

  const respuestas =
    Array.isArray(progress.answers)
      ? progress.answers
      : [];

  const preguntasRespondidas =
    new Set(
      respuestas.map(
        respuesta => respuesta.question
      )
    ).size;

  if(preguntasRespondidas < totalPreguntas){

    return alert(
      `Debes responder las ${totalPreguntas} preguntas ` +
      `antes de completar la lección.\n\n` +
      `Has respondido ${preguntasRespondidas} de ${totalPreguntas}.`
    );

  }


  // =====================================================
  // VALIDAR TIEMPO MÍNIMO
  // =====================================================

  const inicio =
    Date.parse(progress.started);

  const transcurrido =
    Date.now() - inicio;

  const minutos =
    transcurrido / 60000;

  if(minutos < 20){

    const faltan =
      Math.ceil(20 - minutos);

    return alert(
      `Todavía no puedes finalizar esta lección.\n\n` +
      `Debes completar mínimo 20 minutos de trabajo.\n` +
      `Faltan aproximadamente ${faltan} minutos.`
    );

  }


  // =====================================================
  // DETENER TEMPORIZADOR
  // =====================================================

  detenerTemporizadorLeccion();


  const u =
    state.users.find(
      x=>x.email===state.current
    );

  if(!u || !u.id){

    return alert(
      'No se encontró el estudiante.'
    );

  }


  // =====================================================
  // GUARDAR PROGRESO EN POSTGRESQL
  // =====================================================

  try{

    await apiFetch('/progreso',{

      method:'POST',

      body:JSON.stringify({

        estudiante_id:u.id,

        leccion:id,

        completada:true,

        porcentaje:100

      })

    });


    // ===================================================
    // REGISTRAR ACTIVIDAD
    // ===================================================

    await apiFetch('/actividad',{

      method:'POST',

      body:JSON.stringify({

        estudiante_id:u.id,

        leccion:id,

        accion:'LECCION_COMPLETADA',

        detalle:
          `El estudiante completó la lección ${id} ` +
          `después de ${Math.floor(minutos)} minutos ` +
          `y respondió ${preguntasRespondidas}/${totalPreguntas} preguntas.`

      })

    });


    // ===================================================
    // ACTUALIZAR ESTADO LOCAL
    // ===================================================

    state.progress[state.current] ??= {};

    state.progress[state.current][id] ??= {};

    state.progress[state.current][id].done =
      true;

    state.progress[state.current][id].completed =
      new Date().toISOString();

    state.progress[state.current][id].durationMinutes =
      Math.floor(minutos);

    save();


    alert(
      'Lección completada. La siguiente lección ha sido desbloqueada.'
    );


    dashboard();


  }catch(error){

    console.error(
      'Error guardando la lección:',
      error
    );

    alert(
      error.message ||
      'No se pudo guardar la lección en PostgreSQL.'
    );

  }

}

function examIntro(){

  if(prog()<20)
    return alert(
      'Completa las 20 lecciones para desbloquear el examen.'
    );

  const attempts =
    state.attempts[state.current] || [];

  const restantes =
    Math.max(0, 3 - attempts.length);

  const mejorNota =
    attempts.length
      ? Math.max(...attempts.map(x => Number(x.score)))
      : null;

  shell(`
    <div class="form">

      <span class="eyebrow">
        EVALUACIÓN FINAL
      </span>

      <h1>
        Examen de bases de datos y SQL
      </h1>

      <p class="lead">
        20 preguntas tipo ICFES/Saber,
        con 4 opciones y una sola respuesta correcta.
      </p>

      <div class="stats">

        <article>
          <b>20</b>
          preguntas
        </article>

        <article>
          <b>4</b>
          opciones
        </article>

        <article>
          <b>3</b>
          intentos
        </article>

        <article>
          <b>1.0–5.0</b>
          escala
        </article>

      </div>

      <div class="notice">

        <b>Calificación:</b>
        nota = 1.0 + (aciertos / 20) × 4.0,
        redondeada a una cifra decimal.

        0 aciertos = 1.0 y 20 aciertos = 5.0.

        La nota final será la más alta
        obtenida en los tres intentos.

      </div>

      <p>
        Intentos utilizados:
        <b>${attempts.length}/3</b>
      </p>

      <p>
        Intentos restantes:
        <b>${restantes}</b>
      </p>

      ${
        mejorNota !== null
          ? `
            <p>
              Mejor nota actual:
              <b>${mejorNota.toFixed(1)}/5.0</b>
            </p>
          `
          : ''
      }

      ${
        attempts.length < 3
          ? `
            <button
              class="btn primary"
              onclick="startExam()">
              Comenzar intento ${attempts.length + 1} de 3
            </button>
          `
          : `
            <p class="notice">
              Has utilizado los 3 intentos disponibles.
            </p>
          `
      }

      ${
        attempts.length > 0
          ? `
            <button
              class="btn secondary"
              onclick="examResults()">
              Ver resultados
            </button>
          `
          : ''
      }

    </div>
  `);
}

function startExam(){

  const intentos =
    state.attempts[state.current] || [];

  const anterior =
    intentos.length
      ? intentos[intentos.length - 1]
      : null;

  const indicesAnteriores =
    anterior &&
    Array.isArray(anterior.questionIds)
      ? anterior.questionIds
      : [];

  const todos =
    exam.map((_,i)=>i);

  let seleccion = [];

  if(indicesAnteriores.length === 20){

    const diferentes =
      todos.filter(
        i => !indicesAnteriores.includes(i)
      );

    const iguales =
      todos.filter(
        i => indicesAnteriores.includes(i)
      );

    const seisDiferentes =
      diferentes
        .sort(()=>Math.random()-0.5)
        .slice(0,6);

    const catorceIguales =
      iguales
        .sort(()=>Math.random()-0.5)
        .slice(0,14);

    seleccion =
      [...seisDiferentes,...catorceIguales]
        .sort(()=>Math.random()-0.5);

  }else{

    seleccion =
      todos
        .sort(()=>Math.random()-0.5)
        .slice(0,20);
  }

  const preguntas =
    seleccion.map(indice => {

      const original =
        exam[indice];

      const opciones =
        original[1].map(
          (texto,i)=>({
            texto,
            correcta:i===original[2]
          })
        );

      opciones.sort(
        ()=>Math.random()-0.5
      );

      return {
        id:indice,
        pregunta:original[0],
        opciones,
        explicacion:original[3]
      };
    });

  state.exam={
    i:0,
    questions:preguntas,
    answers:[]
  };

  save();

  examQuestion();
}

function examQuestion(){

  const e = state.exam;
  const q = e.questions[e.i];

  shell(`
    <div class="examq">

      <span class="eyebrow">
        PREGUNTA ${e.i + 1} DE 20
      </span>

      <div class="bar">
        <span style="width:${((e.i + 1) / 20) * 100}%"></span>
      </div>

      <h1>${esc(q.pregunta)}</h1>

      <div class="opts">
        ${q.opciones.map((o,i)=>`
          <button
            class="opt"
            data-i="${i}">
            ${'ABCD'[i]}. ${esc(o.texto)}
          </button>
        `).join('')}
      </div>

      <button
        class="btn primary"
        id="next">
        ${e.i === 19
          ? 'Finalizar examen'
          : 'Guardar y continuar'}
      </button>

    </div>
  `);

  let seleccion = null;

  document
    .querySelectorAll('.opt')
    .forEach(b => {

      b.onclick = () => {

        document
          .querySelectorAll('.opt')
          .forEach(x =>
            x.classList.remove('sel')
          );

        b.classList.add('sel');

        seleccion = Number(
          b.dataset.i
        );
      };

    });

  $('#next').onclick = () => {

    if(seleccion === null){

      return alert(
        'Selecciona una opción.'
      );

    }

    e.answers[e.i] = seleccion;

    if(e.i < 19){

      e.i++;

      save();

      examQuestion();

    }else{

      finishExam();

    }

  };
}

async function finishExam(){

  const e = state.exam;

  const u = state.users.find(
    x => x.email === state.current
  );

  if(!u || !u.id){
    return alert(
      'No se encontró el estudiante.'
    );
  }

  const correct = e.answers.reduce(
    (total, respuesta, i) => {

      const pregunta =
        e.questions[i];

      if(!pregunta){
        return total;
      }

      const opcion =
        pregunta.opciones[respuesta];

      return total +
        (opcion && opcion.correcta ? 1 : 0);

    },
    0
  );

  const porcentaje =
    Math.round(
      (correct / 20) * 100 * 100
    ) / 100;

  const score =
    Math.round(
      (1 + (correct / 20) * 4) * 10
    ) / 10;

  try{

    const respuesta =
      await apiFetch('/evaluaciones',{
        method:'POST',

        body:JSON.stringify({
          estudiante_id:u.id,
          tipo:'EXAMEN_FINAL',
          aciertos:correct,
          total_preguntas:20,
          porcentaje,
          nota:score
        })
      });

    const evaluacion =
      respuesta.evaluacion;

    state.attempts[state.current] ??= [];

    state.attempts[state.current].push({

      correct:
        evaluacion.aciertos,

      score:
        Number(evaluacion.nota),

      answers:
        [...e.answers],

      questionIds:
        e.questions.map(
          pregunta => pregunta.id
        ),

      questions:
        e.questions.map(
          pregunta => ({
            id:pregunta.id,
            pregunta:pregunta.pregunta,

            opciones:
              pregunta.opciones.map(
                opcion => ({
                  texto:opcion.texto,
                  correcta:opcion.correcta
                })
              ),

            explicacion:
              pregunta.explicacion
          })
        ),

      date:
        evaluacion.fecha_hora

    });

    await apiFetch('/actividad',{
      method:'POST',

      body:JSON.stringify({
        estudiante_id:u.id,
        accion:'EXAMEN_COMPLETADO',

        detalle:
          `Intento ${evaluacion.intento} · ` +
          `${evaluacion.aciertos}/20 correctas · ` +
          `Nota ${evaluacion.nota}/5.0`
      })
    });

    delete state.exam;

    save();

    examResults();

  }catch(error){

    console.error(
      'Error guardando el examen:',
      error
    );

    alert(
      error.message ||
      'No se pudo guardar el resultado del examen.'
    );
  }
}

function examResults(){

  const ats =
    state.attempts[state.current] || [];

  const mejorNota =
    ats.length
      ? Math.max(
          ...ats.map(
            x => Number(x.score)
          )
        )
      : null;

  const intentosRestantes =
    Math.max(
      0,
      3 - ats.length
    );

  let html = `
    <div class="head">

      <div>

        <span class="eyebrow">
          RESULTADOS
        </span>

        <h1>
          Tu evaluación
        </h1>

        <p>
          Revisa tus intentos y la mejor nota.
        </p>

      </div>

      <div>

        <h2>
          ${
            mejorNota !== null
              ? mejorNota.toFixed(1)
              : '—'
          } / 5.0
        </h2>

        <small>
          Mejor nota
        </small>

      </div>

    </div>

    <div class="notice">

      <p>
        <b>
          Intentos utilizados:
        </b>
        ${ats.length}/3
      </p>

      <p>
        <b>
          Intentos restantes:
        </b>
        ${intentosRestantes}
      </p>

      ${
        mejorNota !== null
          ? `
            <p>
              <b>
                Mejor nota:
              </b>
              ${mejorNota.toFixed(1)}/5.0
            </p>
          `
          : ''
      }

    </div>
  `;

  ats.forEach((a,k)=>{

    html += `
      <section class="panel">

        <h2>
          Intento ${k + 1} de 3:
          ${Number(a.score).toFixed(1)}/5.0
          ·
          ${a.correct}/20 correctas
        </h2>
    `;

    const preguntas =
      Array.isArray(a.questions)
        ? a.questions
        : [];

    a.answers.forEach((ans,i)=>{

      const q =
        preguntas[i];

      if(!q){
        return;
      }

      const opcionSeleccionada =
        ans == null
          ? null
          : q.opciones[ans];

      const correcta =
        q.opciones.findIndex(
          opcion =>
            opcion.correcta
        );

      const opcionCorrecta =
        correcta >= 0
          ? q.opciones[correcta]
          : null;

      const ok =
        ans === correcta;

      html += `
        <div
          class="result ${
            ok
              ? 'right'
              : 'wrong'
          }">

          <b>
            ${i + 1}.
            ${esc(q.pregunta)}
          </b>

          <p>

            Tu respuesta:
            <b>

              ${
                opcionSeleccionada
                  ? `
                    ${'ABCD'[ans]}.
                    ${esc(
                      opcionSeleccionada.texto
                    )}
                  `
                  : 'Sin respuesta'
              }

            </b>

            · Correcta:
            <b>

              ${
                opcionCorrecta
                  ? `
                    ${'ABCD'[correcta]}.
                    ${esc(
                      opcionCorrecta.texto
                    )}
                  `
                  : 'No disponible'
              }

            </b>

          </p>

          <small>
            ${esc(q.explicacion)}
          </small>

        </div>
      `;

    });

    html += `
      </section>
    `;

  });

  if(ats.length < 3){

    html += `
      <button
        class="btn primary"
        onclick="examIntro()">

        Presentar otro intento

      </button>
    `;

  }else{

    html += `
      <div class="notice">

        <b>
          Has utilizado los 3 intentos disponibles.
        </b>

        <br>

        Tu mejor nota final es:

        <b>
          ${
            mejorNota !== null
              ? mejorNota.toFixed(1)
              : '—'
          }/5.0
        </b>

      </div>
    `;

  }

  shell(html);
}

async function teacher(){

  try{

    const respuesta =
      await apiFetch('/dashboard');

    const estudiantes =
      respuesta.estudiantes || [];

    // Guardamos temporalmente los estudiantes
    // para poder filtrarlos sin volver a consultar
    // PostgreSQL cada vez.
    state.teacherStudents =
      estudiantes;

    renderTeacherTable();

  }catch(error){

    console.error(
      'Error cargando panel docente:',
      error
    );

    alert(
      error.message ||
      'No se pudo cargar el panel docente.'
    );
  }
}

function limpiarFiltrosDocente(){

  const nombre =
    $('#teacher-name');

  const apellido =
    $('#teacher-lastname');

  const grado =
    $('#teacher-grade');

  const nota =
    $('#teacher-score');

  if(nombre){
    nombre.value = '';
  }

  if(apellido){
    apellido.value = '';
  }

  if(grado){
    grado.value = '';
  }

  if(nota){
    nota.value = '';
  }

  renderTeacherTable();
}

function renderTeacherTable(){

  const estudiantes =
    state.teacherStudents || [];

  const nombre =
    $('#teacher-name')?.value
      .trim()
      .toLowerCase() || '';

  const apellido =
    $('#teacher-lastname')?.value
      .trim()
      .toLowerCase() || '';

  const grado =
    $('#teacher-grade')?.value || '';

  const notaMinima =
    $('#teacher-score')?.value || '';

  const filtros = {
    nombre,
    apellido,
    grado,
    notaMinima
  };

  const filtrados =
    estudiantes.filter(s => {

      const nombreCompleto =
        String(
          s.nombre_completo || ''
        ).toLowerCase();

      const cumpleNombre =
        !nombre ||
        nombreCompleto.includes(nombre);

      const cumpleApellido =
        !apellido ||
        nombreCompleto.includes(apellido);

      const cumpleGrado =
        !grado ||
        s.grado === grado;

      const mejorNota =
        s.mejor_nota === null ||
        s.mejor_nota === undefined
          ? null
          : Number(s.mejor_nota);

      let cumpleNota = true;

      if(notaMinima === 'SIN_NOTA'){

        cumpleNota =
          mejorNota === null;

      }else if(notaMinima){

        cumpleNota =
          mejorNota !== null &&
          mejorNota >= Number(notaMinima);
      }

      return (
        cumpleNombre &&
        cumpleApellido &&
        cumpleGrado &&
        cumpleNota
      );
    });

  let rows = '';

  let totalProg = 0;

  let finished = 0;

  let exams = 0;

  filtrados.forEach(s => {

    const completadas =
      Number(
        s.lecciones_completadas
      ) || 0;

    const pct =
      Math.min(
        completadas * 5,
        100
      );

    const intentos =
      Number(
        s.intentos_examen
      ) || 0;

    const mejorNota =
      s.mejor_nota === null ||
      s.mejor_nota === undefined
        ? '—'
        : Number(
            s.mejor_nota
          ).toFixed(1);

    const conectado =
      s.conectado === true;

    totalProg += pct;

    if(completadas >= 20){
      finished++;
    }

    exams += intentos;

    rows += `
      <tr>

        <td>

          <b>
            ${esc(s.nombre_completo)}
          </b>

          <small>
            ${esc(s.correo)}
          </small>

        </td>

        <td>
          ${esc(s.grado || '—')}
        </td>

        <td>

          ${completadas}/20

          <small>
            ${pct}%
          </small>

        </td>

        <td>
          ${intentos}/3
        </td>

        <td>
          ${mejorNota}
        </td>

        <td>

          <span
            class="${
              conectado
                ? 'status-online'
                : 'status-offline'
            }">

            ${
              conectado
                ? '● Conectado'
                : '○ Desconectado'
            }

          </span>

        </td>

        <td>

          <button
            class="btn small secondary"
            onclick="teacherStudentById(${s.id})">

            Ver

          </button>

        </td>

      </tr>
    `;
  });

  const progresoPromedio =
    filtrados.length
      ? Math.round(
          (
            totalProg /
            filtrados.length
          ) * 100
        ) / 100
      : 0;

  shell(`

    <span class="eyebrow">
      PANEL DOCENTE / ADMINISTRADOR
    </span>

    <h1>
      Seguimiento del curso
    </h1>

    <div class="stats">

      <article>

        <b>
          ${filtrados.length}
        </b>

        estudiantes

      </article>

      <article>

        <b>
          ${progresoPromedio}%
        </b>

        progreso promedio

      </article>

      <article>

        <b>
          ${finished}
        </b>

        terminados

      </article>

      <article>

        <b>
          ${exams}
        </b>

        intentos examen

      </article>

    </div>

    <div class="panel">

      <h2>
        Filtrar estudiantes
      </h2>

      <div class="formgrid">

        <label>

          Nombre

          <input
            id="teacher-name"
            type="text"
            placeholder="Buscar por nombre"
            value="${esc(filtros.nombre)}">

        </label>

        <label>

          Apellido

          <input
            id="teacher-lastname"
            type="text"
            placeholder="Buscar por apellido"
            value="${esc(filtros.apellido)}">

        </label>

        <label>

          Grado

          <select
            id="teacher-grade"
            onchange="renderTeacherTable()">

            <option
              value=""
              ${filtros.grado === '' ? 'selected' : ''}>
              Todos
            </option>

            <option
              value="11B"
              ${filtros.grado === '11B' ? 'selected' : ''}>
              11B
            </option>

            <option
              value="11C"
              ${filtros.grado === '11C' ? 'selected' : ''}>
              11C
            </option>

          </select>

        </label>

        <label>

          Nota mínima

          <select
            id="teacher-score"
            onchange="renderTeacherTable()">

            <option
              value=""
              ${filtros.notaMinima === '' ? 'selected' : ''}>
              Todas
            </option>

            <option
              value="5"
              ${filtros.notaMinima === '5' ? 'selected' : ''}>
              5.0
            </option>

            <option
              value="4"
              ${filtros.notaMinima === '4' ? 'selected' : ''}>
              4.0 o más
            </option>

            <option
              value="3"
              ${filtros.notaMinima === '3' ? 'selected' : ''}>
              3.0 o más
            </option>

            <option
              value="2"
              ${filtros.notaMinima === '2' ? 'selected' : ''}>
              2.0 o más
            </option>

            <option
              value="1"
              ${filtros.notaMinima === '1' ? 'selected' : ''}>
              1.0 o más
            </option>

            <option
              value="SIN_NOTA"
              ${filtros.notaMinima === 'SIN_NOTA' ? 'selected' : ''}>
              Sin nota
            </option>

          </select>

        </label>

      </div>

      <div
        style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">

        <button
          class="btn primary"
          onclick="renderTeacherTable()">

          Aplicar filtros

        </button>

        <button
          class="btn secondary"
          onclick="limpiarFiltrosDocente()">

          Limpiar filtros

        </button>

      </div>

    </div>

    <div class="panel">

      <div class="head">

        <h2>
          Estudiantes
        </h2>

        <button
          class="btn secondary"
          onclick="exportCSV()">

          Exportar CSV

        </button>

      </div>

      <div class="tablewrap">

        <table>

          <thead>

            <tr>

              <th>
                Estudiante
              </th>

              <th>
                Grado
              </th>

              <th>
                Progreso
              </th>

              <th>
                Intentos
              </th>

              <th>
                Mejor nota
              </th>

              <th>
                Estado
              </th>

              <th></th>

            </tr>

          </thead>

          <tbody>

            ${
              rows ||
              `
                <tr>

                  <td colspan="7">

                    No hay estudiantes
                    que coincidan con
                    los filtros.

                  </td>

                </tr>
              `
            }

          </tbody>

        </table>

      </div>

    </div>

  `);
}

async function teacherStudentById(id){

  try{

    const respuesta=
      await apiFetch(`/dashboard/estudiante/${id}`);

    const estudiante=
      respuesta.estudiante;

    const progreso=
      respuesta.progreso || [];

    const actividad=
      respuesta.actividad || [];

    const evaluaciones=
      respuesta.evaluaciones || [];

    const sesiones=
      respuesta.sesiones || [];

    const progresoPorLeccion={};

    progreso.forEach(item=>{
      progresoPorLeccion[item.leccion]=item;
    });

    const completadas=
      progreso.filter(
        item=>item.completada === true
      ).length;

    const porcentaje=
      Math.min(completadas*5,100);

    const conectado=
      sesiones.length > 0 &&
      sesiones[0].conectada === true;

    let leccionesHTML='';

    lessons.forEach((l,i)=>{

      const numero=i+1;
      const p=
        progresoPorLeccion[numero];

      const completada=
        p?.completada === true;

      leccionesHTML+=`
        <div class="result">

          <b>
            ${numero}. ${esc(l[0])}
          </b>

          <br>

          <small>
            ${
              completada
                ? '✓ Completada · 100%'
                : 'No completada'
            }

            ${
              p?.fecha_actualizacion
                ? ' · '+
                  new Date(
                    p.fecha_actualizacion
                  ).toLocaleString('es-CO')
                : ''
            }
          </small>

        </div>
      `;
    });

    let evaluacionesHTML='';

    if(evaluaciones.length===0){

      evaluacionesHTML=`
        <div class="result">
          <b>Sin intentos de examen</b>
        </div>
      `;

    }else{

      evaluaciones.forEach(e=>{

        evaluacionesHTML+=`
          <div class="result">

            <b>
              Intento ${e.intento}
            </b>

            <br>

            ${e.aciertos}/${e.total_preguntas}
            correctas ·
            ${Number(e.nota).toFixed(1)}/5.0

            <br>

            <small>
              ${Number(e.porcentaje).toFixed(2)}%
              ·
              ${new Date(
                e.fecha_hora
              ).toLocaleString('es-CO')}
            </small>

          </div>
        `;

      });

    }

    let actividadHTML='';

    if(actividad.length===0){

      actividadHTML=`
        <div class="result">
          <b>Sin actividad registrada.</b>
        </div>
      `;

    }else{

      actividad.slice(0,20).forEach(a=>{

        actividadHTML+=`
          <div class="result">

            <b>
              ${esc(a.accion)}
            </b>

            ${
              a.leccion
                ? ` · Lección ${a.leccion}`
                : ''
            }

            <br>

            <small>
              ${esc(a.detalle || '')}
              ·
              ${new Date(
                a.fecha_hora
              ).toLocaleString('es-CO')}
            </small>

          </div>
        `;

      });

    }

    shell(`

      <a
        href="#"
        onclick="teacher();return false">
        ← Panel docente
      </a>

      <div class="head">

        <div>

          <span class="eyebrow">
            DETALLE DEL ESTUDIANTE
          </span>

          <h1>
            ${esc(estudiante.nombre_completo)}
          </h1>

          <p>
            ${esc(estudiante.correo)}
          </p>

        </div>

        <div>

          <h2>${porcentaje}%</h2>

          <small>
            ${completadas}/20 lecciones
          </small>

          <br>

          <small>
            ${
              conectado
                ? '● Conectado'
                : '○ Desconectado'
            }
          </small>

        </div>

      </div>

      <div class="grid">

        <section class="panel">

          <h2>Lecciones</h2>

          ${leccionesHTML}

        </section>

        <section class="panel">

          <h2>Evaluación</h2>

          ${evaluacionesHTML}

        </section>

      </div>

      <section
        class="panel"
        style="margin-top:18px">

        <h2>Actividad reciente</h2>

        ${actividadHTML}

      </section>

    `);

  }catch(error){

    console.error(
      'Error cargando detalle del estudiante:',
      error
    );

    alert(
      error.message ||
      'No se pudo cargar el detalle del estudiante.'
    );
  }
}

function exportCSV(){const students=state.users.filter(x=>x.role==='student');let csv='Nombre,Código,Institución,Grupo,Progreso,Intentos,Mejor nota\n';students.forEach(s=>{const done=Object.values(state.progress[s.email]||{}).filter(x=>x.done).length,ats=state.attempts[s.email]||[],best=ats.length?Math.max(...ats.map(x=>x.score)):'';csv+=`"${s.first} ${s.last}","${s.code||''}","${s.inst||''}","${s.group||''}",${done*5},${ats.length},${best}\n`});const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='sql11_consolidado.csv';a.click()}
render();
