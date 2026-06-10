import type { Entity } from "@stores/entitiesStore";

export interface RuleViolation {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export function validateEntity(entity: Entity, entities: Entity[]): RuleViolation[] {
  const violations: RuleViolation[] = [];

  switch (entity.nivel) {
    case "Sub Entidades":
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
  }

  return violations;
}

export function isEntityOperable(entity: Entity, entities: Entity[]): boolean {
  if (!entity.activo) return false;
  return validateEntity(entity, entities).filter((v) => v.severity === "error").length === 0;
}
