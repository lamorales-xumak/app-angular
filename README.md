# app-angular
Proyecto Inicial para aplicaciones front end realizadas con html, css, angularjs, angular-material-design.

Primeramente instalaremos las dependencias necesarias para gulp y con esto poder tener la automatizacion de tareas lista para utilizarse.

npm install --verbose

Luego de esperar por unos minutos y que no tengamos ningun error en la instalacion de las dependencias, procedemos a ejecutar nuestra primer tarea gulp, con la cual tenemos un servidor web express, con la opcion de livereload activada.

gulp desarrollo

Nos abrira automaticamente el navegador web por defecto con la vista previa del proyecto, iniciando el proceso con index.html

Al tener ejecutado gulp desarrollo se estan ejecutando otras tareas en backgroun las cuales estan poniendo atencion a si ocurre una instalacion de una libreria o si se crea un nuevo archivos js, html, css, para darle su respectivo tratamiento.

Instalar angular con bower

bower install angular --save --verbose

Esto instalara la liberias de angular y tambien añadira la dependencia al archivo index.html, cuando incluimos el parametro --save guarda esta dependencia en el archivo bower.json.

Esto es para que otros desarrolladores sepan que librerias depende nuestro proyecto y puedan instalarlas facilmente con el comando.

bower install --verbose

Si por alguna razon no se inyectan las liberias en index.html, pueden ejecutar la tarea de gulp siguiente.

gulp dependencia
