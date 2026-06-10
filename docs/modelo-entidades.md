# Modelo Jerárquico de Entidades

## Propósito
Define la estructura de entidades que modela la logística, almacenamiento y operaciones del negocio (flujos de efectivo, valores y mercancías). Usado como base para el diseño del prototipo frontend y eventual modelo de datos.

## Matriz de Entidades

| # | Entidad | Nivel | Tipos | Hijos Permitidos | ¿Hoja? |
|---|---------|-------|-------|------------------|--------|
| 1 | **Grupos Geográficos** | Grupos | Zonas, Ciudades, Estados, Municipios, Continentes, Países, Flotas | Oficinas, Depósitos, Vehículos, Proveedores, Clientes, Grupos | No |
| 2 | **Entidad Principal** | Oficinas | Agencia, Sucursales, Oficinas, CDA, Banco Central | Depósitos, Sub Entidades, Vehículos | No |
| 3 | **Sub Entidades** | Sub Entidades | ATM, Cajas, Taquillas, Puntos de venta | Depósitos | No |
| 4 | **Depósitos** | Depósitos | Bóvedas, Almacenes, Depósitos, Estacionamientos | Mercancía | No |
| 5 | **Contenedores** | Contenedores | Container, Envases, Bultos, Bolsas, Empaques, Paletas | Mercancía | No |
| 6 | **Vehículos** | Vehículos | Camiones, Carros, Barcos, Aviones, Trenes | Mercancía | No |
| 7 | **Mercancía** | Mercancía | Commodities, Valores, Alimentos, Productos, Remesas | — | Sí |
| 8 | **Proveedores** | Proveedores | Servicios, Consumibles | Vehículos | No |
| 9 | **Clientes** | Clientes | Natural, Jurídico | — | Sí |
| 10 | **Moneda** | Monedas | Divisa, Moneda, Oro, Stable Coin | — | Sí |

## Reglas de Jerarquía (Relaciones Padre → Hijo)

```
Grupos Geográficos
├── Grupos Geográficos (recursivo)
├── Entidad Principal (Oficinas)
│   ├── Depósitos
│   │   └── Mercancía
│   ├── Sub Entidades
│   │   └── Depósitos
│   │       └── Mercancía
│   └── Vehículos (flota propia del banco)
│       └── Mercancía
├── Depósitos
│   └── Mercancía
├── Vehículos
│   └── Mercancía
├── Proveedores (transporte tercerizado)
│   └── Vehículos
│       └── Mercancía
└── Clientes

Contenedores
└── Mercancía
```

## Modelo de Datos (SQL Referencial)

```sql
-- Tabla principal de entidades
CREATE TABLE entidades (
    id              INT PRIMARY KEY IDENTITY(1,1),
    codigo          VARCHAR(20)  NOT NULL UNIQUE,
    nombre          VARCHAR(255) NOT NULL,
    tipo_entidad    VARCHAR(50)  NOT NULL,  --enum del nivel
    subtipo         VARCHAR(50),            --clasificador secundario
    padre_id        INT          NULL REFERENCES entidades(id),
    activo          BIT          NOT NULL DEFAULT 1,
    created_at      DATETIME     DEFAULT GETDATE(),
    updated_at      DATETIME     DEFAULT GETDATE()
);

-- Catálogo de tipos de entidad (niveles)
CREATE TABLE catalogos_tipos_entidad (
    id              INT PRIMARY KEY IDENTITY(1,1),
    nivel           VARCHAR(50)  NOT NULL,   --ej: Oficinas, Depósitos, Vehículos...
    etiqueta        VARCHAR(100) NOT NULL,
    subtipos        VARCHAR(MAX),            --JSON array de subtipos válidos
    hijos_permitidos VARCHAR(MAX)            --JSON array de niveles hijos válidos
);

INSERT INTO catalogos_tipos_entidad (nivel, etiqueta, subtipos, hijos_permitidos) VALUES
('Grupos', 'Grupos Geográficos', '["Zonas","Ciudades","Estados","Municipios","Continentes","Países","Flotas"]',
 '["Oficinas","Depósitos","Vehículos","Proveedores","Clientes","Grupos"]'),
('Oficinas', 'Entidad Principal', '["Agencia","Sucursal","Oficina","CDA","Banco Central"]',
 '["Depósitos","Sub Entidades","Vehículos"]'),
('Sub Entidades', 'Sub Entidades', '["ATM","Caja","Taquilla","Punto de venta"]',
 '["Depósitos"]'),
('Depósitos', 'Depósitos', '["Bóveda","Almacén","Depósito","Estacionamiento"]',
 '["Mercancía"]'),
('Contenedores', 'Contenedores', '["Container","Envase","Bulto","Bolsa","Empaque","Paleta"]',
 '["Mercancía"]'),
('Vehículos', 'Vehículos / Depósitos Móviles', '["Camión","Carro","Barco","Avión","Tren"]',
 '["Mercancía"]'),
('Mercancía', 'Mercancía', '["Commodity","Valor","Alimento","Producto","Remesa"]',
 '[]'),
('Proveedores', 'Proveedores', '["Servicios","Consumibles"]',
 '["Vehículos"]'),
('Clientes', 'Clientes', '["Natural","Jurídico"]',
 '[]'),
('Monedas', 'Moneda', '["Divisa","Moneda","Oro","Stable Coin"]',
 '[]');
```

## Reglas de Negocio

1. **Entidad Principal (Oficina)** define el "Contexto" — las operaciones ocurren dentro de una oficina.
2. **Sub Entidades** definen la "Operación" — el punto específico donde ocurre la transacción.
3. **Depósitos** almacenan mercancía.
4. **Vehículos** solo pueden ser hijos de una empresa de transporte (Oficinas para flota propia, Proveedores para transporte tercerizado).
5. **Mercancía** es la unidad comercializable — entidad hoja.
6. **Grupos Geográficos** es el agrupador logístico más amplio; puede contener entidades de casi cualquier nivel.
7. Una entidad solo puede ser padre de los niveles definidos en `hijos_permitidos`.

## Notas de Implementación (Prototipo)

- Sin backend: los datos se mantienen en memoria (React context + estado local).
- El catálogo de tipos es el "esquema" que define la estructura; no se persiste.
- Las entidades se almacenan en un árbol plano con `padre_id` para facilitar la manipulación.
- Para visualización, se renderiza como árbol expandible y diagrama interactivo (React Flow).
