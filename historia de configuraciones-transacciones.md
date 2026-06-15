# Historia de Usuario: Prototipo Funcional en React (Frontend Only) - Transaction Process Builder

## 1. Contexto Técnico
**Como** Desarrollador Frontend de React,  
**Quiero** construir un prototipo interactivo utilizando los componentes existentes de nuestro **Design System** y gestionando el flujo con estado local (`useState`, `useReducer` o Context API local),  
**Para** validar la experiencia de usuario (UX) del creador de procesos (Wizards) sin implementar servicios de backend, bases de datos ni llamadas a API reales.

---

## 2. Requerimientos de Implementación en React

### A. Gestión de Estado Local (Sin Persistencia)
* Todo el flujo del constructor de procesos debe manejarse en un estado de React (un array de objetos que simule los pasos).
* Al iniciar, el estado debe venir precargado con el flujo de remesas de ejemplo (*Solicitado, Aprobado, Despachado, Recibido, Confirmado*) para que el prototipo no aparezca vacío.

### B. Consumo del Design System
* **No estilizar desde cero:** Reutilizar los componentes globales del proyecto (ej: `<Button>`, `<Select>`, `<Checkbox>`, `<Switch>`, `<Card>`, `<TextField>`).
* El layout debe respetar la estructura de tres columnas usando el sistema de grillas o Flexbox del proyecto.

---

## 3. Comportamiento Interactivo de las Tres Columnas (UI Components)

### Columna 1: Panel de Entidades (Sidebar Izquierdo)
* Renderizar una lista estática de tarjetas pequeñas utilizando componentes del Design System.
* Debe simular la disponibilidad de entidades basadas en nuestro modelo de datos (Bóvedas, Cajas, ATMs, Camiones, Almacenes).
* *Nota de interacción:* Para el prototipo, al hacer clic en una entidad, se puede simular que se selecciona como Origen o Destino del flujo.

### Columna 2: Lienzo del Flujo (Canvas Central)
* Mapear el array del estado local para renderizar una lista vertical de pasos (Cards secuenciales).
* Cada tarjeta de paso debe mostrar de forma interactiva:
    1. El nombre del paso (Editable con un `<TextField>`).
    2. Un botón para `[+ Agregar Ruta Alterna]` (Excepción).
* **Interactividad de Excepciones:** Al hacer clic en "Agregar Ruta Alterna", se debe insertar un sub-nodo hijo en el estado local (pintado de color de advertencia del Design System) que simule eventos como *Atraco* o *Descuadres en Conteo*.

### Columna 3: Inspector de Propiedades (Sidebar Derecho Contextual)
* Este panel debe escuchar qué nodo o paso está `active` en el estado de React.
* **Filtro Dinámico (Banca vs. Retail):** En la cabecera global del prototipo habrá un componente `<Switch>` para cambiar el "Giro de Negocio".
    * `Giro: Banco` -> El panel derecho renderiza controles de configuración de divisas, límites y transportadoras de valores.
    * `Giro: Farmatodo / Retail` -> El panel derecho cambia sus inputs para mostrar controles de fecha de vencimiento, lotes y variables de temperatura.
* Los checkboxes de este panel (ej: *Requerir Escaneo de Precinto*, *Asignar Responsable*) solo deben guardar su estado true/false en el objeto del paso activo en React.

---

## 4. Alcance y Exclusiones del Entregable
* **SÍ:** Interactividad de clics, alternancia de pantallas, inputs funcionales en el navegador, cambios visuales basados en el tipo de negocio (Banca/Retail).
* **NO:** Creación de archivos de base de datos, configuraciones de Redux/Zustand globales conectados a servidores, archivos de migración o servicios de red. Todo debe morir al refrescar el navegador (`F5`).