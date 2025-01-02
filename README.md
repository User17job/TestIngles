# **Sistema de Evaluación para Aprendices de Inglés**

TestIngles es una aplicación interactiva diseñada para evaluar y registrar el progreso de estudiantes en el aprendizaje del idioma inglés, Como complemento la tutoria de mi aprendices. 
La plataforma ofrece un sistema flexible de evaluación basado en preguntas de diferentes tipos, adaptándose a las necesidades de los usuarios y 
proporcionando una experiencia amigable e intuitiva.

![image](https://github.com/user-attachments/assets/8d0e4325-998d-43f1-a898-2c6ce5478214)
*Accede al proyecto aquí -> https://*

## Propósito del Proyecto
El propósito de este proyecto es brindar una herramienta práctica y eficiente para evaluar las competencias de los estudiantes en inglés mediante preguntas interactivas. 
Además, se busca almacenar y analizar los resultados para identificar áreas de mejora y documentar el progreso de cada estudiante.

## Características Principales
- Evaluaciones Dinámicas: Los estudiantes responden preguntas de diversos tipos:

- Verificacion de nivel basico en el admin.
![image](https://github.com/user-attachments/assets/abd6e454-aa62-47bf-ac06-8979f6fbafb9)

- Admin para agregar y manejar las preguntas.
 ![image](https://github.com/user-attachments/assets/fb8da9e0-3241-46bf-a383-5590319501dd)


- Rellena los espacios en blanco: Completa frases con las palabras correctas.
- Ordena palabras: Crea frases coherentes a partir de palabras desordenadas.
- Selección Múltiple: Elige la respuesta correcta entre varias opciones.
- Verdadero o Falso: Responde preguntas booleanas de forma precisa.
- Traducción: Traduce frases o palabras específicas.
![image](https://github.com/user-attachments/assets/b19f7c9d-4aba-41fe-831f-6cf3c5292082)

  
- Cálculo Automático de Puntuación: El sistema calcula el puntaje basado en la precisión de las respuestas y la dificultad de las preguntas.
![image](https://github.com/user-attachments/assets/fc4bbca4-0d8d-4acb-8608-10d2ae6603a8)


  
- Resultados Detallados: Se muestra la puntuación final, junto con una sección opcional para revisar errores y comparar respuestas.
- Persistencia de Datos: Los resultados de las evaluaciones se guardan en un backend conectado para análisis y seguimiento.

 ## Tecnologías Utilizadas
- Frontend: React.js con componentes interactivos y diseño amigable.
- Backend: API conectada mediante fetch para obtener y guardar datos.
- Diseño UI/UX: Utilización de Tailwind CSS para un diseño responsivo y atractivo.
- Íconos: Paquete de íconos lucide-react para una interfaz moderna e intuitiva.
- Funcionalidades del Sistema
- Interfaz de Bienvenida:

![image](https://github.com/user-attachments/assets/bb08c204-de37-4192-92ff-50c4abb836a6)
Solicita el nombre del estudiante para personalizar la experiencia.
Inicia la evaluación tras ingresar el nombre.


## Sistema de Evaluación:

Carga dinámica de preguntas desde el backend.
Manejo de distintos tipos de preguntas con componentes personalizados para cada caso.
Validación de respuestas antes de enviar.
Resultados y Feedback:

Cálculo de puntaje basado en las respuestas correctas.
Visualización de errores y respuestas correctas para aprendizaje.
Almacenamiento de resultados en la base de datos.
Navegación y Diseño:

Navegación fluida entre las etapas de bienvenida, evaluación y resultados.
Diseño responsivo y amigable para distintos dispositivos.

## Instrucciones de Configuración
Clona este repositorio:

*bash*
Copy code
git clone https://github.com/tuusuario/TestApp.git
cd TestApp
Instala las dependencias:

*bash*
Copy code
npm install
Inicia el servidor de desarrollo:

*bash*
Copy code
npm start
Configura el backend (enlace a instrucciones si está en otro repositorio).

Contribuciones
Las contribuciones son bienvenidas. Si deseas agregar mejoras, reportar errores o proponer nuevas funciones, siéntete libre de abrir un issue o enviar un pull request.

Licencia
Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.
