# Frontend - Sistema de Facturación El Milagro

Frontend desarrollado en Angular para el Sistema de Facturación de la tienda "El Milagro".

## Descripción

Este proyecto corresponde a la interfaz web del Sistema de Facturación El Milagro. Permite la gestión de productos, clientes, proveedores, usuarios, facturación y reportes mediante una interfaz moderna desarrollada con Angular y Angular Material.

El sistema consume los servicios REST expuestos por el backend desarrollado en Spring Boot.

---

## Tecnologías Utilizadas

* Angular 19
* TypeScript
* Angular Material
* RxJS
* HTML5
* SCSS
* JWT Authentication

---

## Funcionalidades Implementadas

### Autenticación

* Inicio de sesión mediante JWT.
* Control de acceso basado en roles.
* Roles:

  * ADMINISTRADOR
  * VENDEDOR

### Gestión de Productos

* Registro de productos.
* Modificación de productos.
* Cambio de estado activo/inactivo.
* Consulta de inventario.

### Gestión de Clientes

* Registro de clientes.
* Modificación de clientes.
* Consulta de clientes activos.

### Gestión de Proveedores

* Registro de proveedores.
* Actualización de proveedores.
* Activación e inactivación.

### Gestión de Usuarios

* Registro de usuarios.
* Asignación de roles.
* Cambio de estado.
* Administración de accesos.

### Facturación

* Generación de facturas.
* Validación de stock disponible.
* Descuento automático de inventario.
* Cálculo automático de subtotal, IVA y total.
* Consulta histórica de facturas.

### Reportes

* Reporte mensual de ventas.
* Exportación de reportes en PDF.
* Exportación de reportes en Excel.

---

## Instalación

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO_FRONTEND>
```

Ingresar al proyecto:

```bash
cd frontend-el-milagro
```

Instalar dependencias:

```bash
npm install
```

---

## Ejecución

Iniciar el servidor de desarrollo:

```bash
ng serve
```

La aplicación estará disponible en:

```text
http://localhost:4200
```

---

## Configuración

La aplicación requiere que el backend esté ejecutándose previamente.

URL por defecto del backend:

```text
http://localhost:2100
```

---


## Proyecto Académico

Universidad de El Salvador

Asignatura: Herramientas de Productividad
