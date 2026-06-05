Control Pedidos - Premium

Un sistema web moderno, dinámico e intuitivo para la gestión y administración de pedidos comerciales en tiempo real, desarrollado utilizando tecnologías web nativas.

---

Integrantes del Equipo (Grupo #10)
* **Carlos Roberto Guillen Zometa** - Carnet: `GZ22006`
* **Nehemias Esau Peñate Cortez** - Carnet: `PC12028`
* **Marvin René Batres Rivera** - Carnet: `BR10022`

---

Descripción del Proyecto

Este proyecto consiste en un panel de control interactivo (*Dashboard*) que permite a los usuarios gestionar pedidos de clientes de manera eficiente. La aplicación está diseñada con un enfoque moderno de experiencia de usuario y aprovecha características avanzadas del navegador para brindar fluidez y persistencia de datos.

Características Principales:
1. **Diseño Moderno:** Interfaz visual atractiva basada en transparencias, desenfoques y gradientes.
2. **Gestión CRUD Completa:** Registro de nuevos pedidos, visualización detallada, edición del estado del pedido (Pendiente, En Proceso, Completado, Cancelado) y eliminación con confirmación.
3. **Persistencia Local:** Uso de `localStorage` para asegurar que los pedidos se guarden directamente en el navegador del usuario y no se pierdan al recargar.
4. **Procesamiento Asíncrono (Web Workers):** Computación en segundo plano de estadísticas y métricas (total facturado, pedidos completados, etc.) mediante un hilo de ejecución independiente (`worker.js`), evitando bloqueos en la interfaz principal.
5. **Integración con APIs Externas:**
   * **Catálogo de Productos:** Consumo de la [Fake Store API](https://fakestoreapi.com/) para poblar la lista de productos populares y el selector del formulario con información real.
   * **Geolocalización con Fallback por IP:** Detección de la ubicación del usuario mediante la API nativa de geolocalización o con geolocalización por IP (`ipapi.co`) en caso de no tener permisos activos.

---

Estructura del Proyecto

*  [index.html](file:///c:/Users/guill/OneDrive/Desktop/u/index.html) - Estructura HTML y modal de pedidos.
*  [style.css](file:///c:/Users/guill/OneDrive/Desktop/u/style.css) - Hoja de estilos con variables CSS, animaciones y diseño responsivo.
*  [app.js](file:///c:/Users/guill/OneDrive/Desktop/u/app.js) - Inicialización de la app, control de navegación por pestañas y configuración del Web Worker.
*  [crud.js](file:///c:/Users/guill/OneDrive/Desktop/u/crud.js) - Lógica de operaciones CRUD, validaciones de formularios y control del modal.
*  [api.js](file:///c:/Users/guill/OneDrive/Desktop/u/api.js) - Gestión de llamadas API para geolocalización y obtención del catálogo de productos.
*  [worker.js](file:///c:/Users/guill/OneDrive/Desktop/u/worker.js) - Script del worker para procesamiento matemático de métricas.

---

Cómo Ejecutar el Proyecto

Dado que la aplicación consume APIs y hace uso de **Web Workers**, el navegador puede bloquear el funcionamiento del worker por políticas de seguridad (CORS) si se abre el archivo `index.html` directamente haciendo doble clic (protocolo `file://`).

Para ejecutar el proyecto de forma correcta, se recomienda utilizar un servidor local:

Opción 1: Extensión Live Server (Visual Studio Code)
1. Instala la extensión **Live Server** en VS Code.
2. Abre la carpeta del proyecto en VS Code.
3. Haz clic en el botón **"Go Live"** en la barra inferior derecha de la ventana o clic derecho sobre `index.html` y selecciona **Open with Live Server**.