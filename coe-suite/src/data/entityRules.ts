import type { Entity } from "@stores/entitiesStore";

export interface RuleViolation {
  field: string;
  message: string;
  severity: "error" | "warning";
}

const CONTENEDOR_HIERARCHY: Record<string, number> = {
  Container: 5,
  Paleta: 4,
  Bulto: 3,
  Bolsa: 3,
  Empaque: 2,
  Envase: 2,
};

export function validateEntity(entity: Entity, entities: Entity[]): RuleViolation[] {
  const violations: RuleViolation[] = [];

  switch (entity.nivel) {
    case "Central Administrativa":
      if (entity.padreId) {
        const padre = entities.find((e) => e.id === entity.padreId);
        if (padre?.nivel === "Central Administrativa") {
          violations.push({
            field: "padreId",
            message: "Una Central Administrativa no puede estar dentro de otra Central Administrativa",
            severity: "error",
          });
        }
      }
      break;

    case "Dispositivos":
      if (!entity.padreId) {
        violations.push({
          field: "padreId",
          message: "Requiere una entidad padre asignada para poder operar",
          severity: "error",
        });
      } else {
        const padre = entities.find((e) => e.id === entity.padreId);
        if (!padre || !padre.activo) {
          violations.push({
            field: "padreId",
            message: "La entidad padre asignada no está activa",
            severity: "error",
          });
        }
      }
      break;

    case "Oficinas":
      if (entity.subtipo === "Taquilla" && entity.padreId) {
        const padre = entities.find((e) => e.id === entity.padreId);
        if (padre && padre.nivel === "Oficinas" && padre.subtipo !== "Agencia" && padre.subtipo !== "Sucursal") {
          violations.push({
            field: "padreId",
            message: "Una taquilla solo puede pertenecer a una Agencia o Sucursal",
            severity: "error",
          });
        }
      }
      break;

    case "Contenedores": {
      const pesoMaximo = entity.metadata?.pesoMaximo as number | undefined;
      const cantidadUnidades = entity.metadata?.cantidadUnidades as number | undefined;
      const subtipoLevel = CONTENEDOR_HIERARCHY[entity.subtipo] ?? 0;

      if (pesoMaximo && pesoMaximo <= 0) {
        violations.push({
          field: "pesoMaximo",
          message: "El peso máximo debe ser mayor a 0",
          severity: "error",
        });
      }

      if (cantidadUnidades && cantidadUnidades <= 0) {
        violations.push({
          field: "cantidadUnidades",
          message: "La cantidad de unidades debe ser mayor a 0",
          severity: "error",
        });
      }

      if (entity.padreId) {
        const padre = entities.find((e) => e.id === entity.padreId);
        if (padre) {
          const padreLevel = CONTENEDOR_HIERARCHY[padre.subtipo] ?? 0;
          if (padreLevel > 0 && subtipoLevel > 0 && subtipoLevel >= padreLevel) {
            violations.push({
              field: "padreId",
              message: `Un contenedor tipo "${entity.subtipo}" no puede estar dentro de uno tipo "${padre.subtipo}" — jerarquía: ${padre.subtipo} > ${entity.subtipo}`,
              severity: "error",
            });
          }
        }
      }
      break;
    }

    case "Entidad Bancaria":
      if (entity.subtipo === "Banco Central") {
        const existing = entities.filter((e) => e.subtipo === "Banco Central" && e.id !== entity.id);
        if (existing.length > 0) {
          violations.push({
            field: "subtipo",
            message: "Solo puede existir un Banco Central en el sistema",
            severity: "error",
          });
        }
      }
      break;
  }

  return violations;
}

export function isEntityOperable(entity: Entity, entities: Entity[]): boolean {
  if (!entity.activo) return false;
  return validateEntity(entity, entities).filter((v) => v.severity === "error").length === 0;
}
