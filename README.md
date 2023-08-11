## FPB CLI - Herramienta para Backup de Fotos de Facebook

La **FPB CLI** es una herramienta de línea de comandos construida con Node.js que te permite realizar copias de seguridad de tus fotos de Facebook de manera sencilla y eficiente. Esta herramienta surgió como una solución alternativa después de enfrentar restricciones en la API de Meta (anteriormente conocida como la API de Facebook) al intentar desarrollar una aplicación web completa.

### Historia del Proyecto

Inicialmente, el objetivo del proyecto era crear una aplicación web que consumiera la API de Meta para brindar a los usuarios la capacidad de gestionar sus fotos y álbumes de Facebook de manera más cómoda. La idea era permitir la visualización, descarga, eliminación y edición de la privacidad de las fotos y los álbumes. Sin embargo, me encontré con desafíos y restricciones significativas en el acceso a la API de Meta, lo que limitó la funcionalidad que quise implementar.

Después de evaluar diversas opciones, decidí cambiar el enfoque y crear la **FPB CLI**. Esta herramienta se centra en dos funciones esenciales: listar y descargar álbumes de Facebook. Aunque el alcance es más limitado que el proyecto original, la CLI proporciona una solución efectiva para hacer copias de seguridad de las fotos y los álbumes, evitando las complicaciones asociadas con la API.

### Características Principales

- Listar los álbumes de Facebook de un usuario.
- Descargar los álbumes completos en tu sistema local.

### Uso

La FPB CLI es fácil de usar. Simplemente sigue estos pasos:

1. [Instala Node.js](https://nodejs.org/es) en tu sistema si aún no lo tienes.

2. Clona este repositorio en tu máquina.

3. Abre la terminal y navega hasta la carpeta del proyecto.

4. Instala las dependencias con el siguiente comando:

   ```
   npm install
   ```

5. Configura tus credenciales de acceso a Facebook en un archivo `.env` en el directorio raíz del proyecto. Consulta el archivo `.env.example` para ver los campos necesarios.

6. Ejecuta la CLI con el siguiente comando:

   ```
   npx fpb-cli
   ```

   Sigue las instrucciones en la pantalla para listar y descargar tus álbumes de Facebook.

### Agradecimientos

Quiero expresar mi agradecimiento a la comunidad de código abierto por su contribución invaluable a las bibliotecas que hacen posible esta herramienta.

---

**Autor**: Daniel Eduardo Almagro
**Contacto**: danyeduard17@gmail.com
**Licencia**: MIT

¡Espero que encuentres útil esta herramienta para respaldar tus recuerdos valiosos en Facebook!
