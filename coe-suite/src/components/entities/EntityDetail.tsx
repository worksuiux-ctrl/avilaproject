import { useMemo } from "react";
import { Pencil, Trash2, Plus, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useEntitiesStore } from "@stores/entitiesStore";
import { getEntityType } from "@data/entityCatalog";
import { getEntitySchema } from "@data/entitySchemas";
import { validateEntity } from "@data/entityRules";

const LABEL_MAP: Record<string, string> = {
  giroNegocio: "Giro de Negocio", direccion: "Dirección", coordenadas: "Geolocalización",
  monedas: "Monedas Permitidas", limiteHijos: "Límite de Hijos",
  horarioApertura: "Apertura", horarioCierre: "Cierre",
  estadoOperativo: "Estado", etiquetaGlobal: "Uso",
  tipoDispositivo: "Dispositivo", modeloFabricante: "Modelo", marca: "Marca", modelo: "Modelo",
  modoInstalacion: "Instalación", identificadorRed: "Red",
  perfilOperacion: "Perfil", responsableAsignado: "Responsable",
  tipoDeposito: "Tipo Depósito", materialConstruccion: "Material",
  dimensiones: "Dimensiones", tipoContenido: "Contenido",
  unidadMedida: "U. Medida", nivelBlindaje: "Blindaje",
  propiedad: "Propiedad", tipoVehiculo: "Tipo", placa: "Placa",
  marcaModelo: "Marca/Modelo", idProveedor: "ID Proveedor",
  disponibilidad: "Disponibilidad", nivelSeguridad: "Seguridad",
  descripcion: "Descripción", sku: "SKU", categoriaMerc: "Categoría",
  origen: "Origen", estadoMerc: "Estado",
  razonSocial: "Razón Social", idLegal: "ID Legal", categoriaProv: "Categoría",
  domicilioFiscal: "Domicilio", tipoProveedor: "Tipo", statusAuditoria: "Auditoría",
  nivelRiesgo: "Riesgo", tipoMoneda: "Tipo Moneda", codigoISO: "ISO",
  nombreDivisa: "Nombre", simbolo: "Símbolo", paisOrigen: "País",
  tasaCambio: "Tasa", factorRedondeo: "Redondeo",
};

interface EntityDetailProps {
  entityId: string;
  onEdit: () => void;
  onAddChild: () => void;
  onDelete: () => void;
}

export function EntityDetail({ entityId, onEdit, onAddChild, onDelete }: EntityDetailProps) {
  const entity = useEntitiesStore((s) => s.entities.find((e) => e.id === entityId));
  const allEntities = useEntitiesStore((s) => s.entities);
  const getChildren = useEntitiesStore((s) => s.getChildren);
  const getAncestors = useEntitiesStore((s) => s.getAncestors);

  const violations = useMemo(() => entity ? validateEntity(entity, allEntities) : [], [entity, allEntities]);

  const metadataEntries = useMemo(() => {
    if (!entity) return [];
    const schema = getEntitySchema(entity.nivel);
    if (!schema || !entity.metadata) return [];
    return schema.fields
      .filter((f) => {
        const val = entity.metadata[f.key];
        return val !== undefined && val !== null && val !== "";
      })
      .map((f) => ({
        label: LABEL_MAP[f.key] ?? f.label,
        value: formatMetadataValue(entity.metadata[f.key], f.type),
      }));
  }, [entity]);

  function formatMetadataValue(val: unknown, type: string): string {
    if (type === "multiSelect" && Array.isArray(val)) return val.join(", ");
    if (type === "geolocation" && typeof val === "object" && val !== null) {
      const v = val as Record<string, unknown>;
      return `${v.lat ?? "?"}, ${v.lng ?? "?"}`;
    }
    if (type === "switch") return val ? "Sí" : "No";
    return String(val ?? "");
  }

  if (!entity) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <p className="text-[13px] text-[var(--color-neutro-400)]">
          Seleccione una entidad del árbol para ver sus detalles
        </p>
      </div>
    );
  }

  const tipo = getEntityType(entity.nivel);
  const children = getChildren(entity.id);
  const ancestors = getAncestors(entity.id);
  const puedeTenerHijos = tipo && tipo.hijosPermitidos.length > 0;

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      {ancestors.length > 0 && (
        <div className="flex items-center gap-1 text-[12px] text-[var(--color-neutro-400)] flex-wrap">
          {ancestors.map((a) => (
            <span key={a.id} className="flex items-center gap-1">
              <span>{a.nombre}</span>
              <span>/</span>
            </span>
          ))}
          <span className="text-[var(--color-neutro-700)] font-medium">{entity.nombre}</span>
        </div>
      )}

      {/* Validación operativa */}
      {entity.nivel === "Central Administrativa" ? (
        <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-corner-m flex items-center gap-2.5">
          <Info className="w-4 h-4 text-cyan-600 shrink-0" />
          <p className="text-[13px] text-cyan-700 font-medium">Unidad organizacional — no realiza transacciones</p>
        </div>
      ) : violations.length > 0 ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded-corner-m flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-red-700">Entidad no operable</p>
            {violations.map((v) => (
              <p key={v.field} className="text-[12px] text-red-600">{v.message}</p>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[var(--color-verde-100)]/5 border border-[var(--color-verde-100)]/20 rounded-corner-m flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 text-[var(--color-verde-100)] shrink-0" />
          <p className="text-[13px] text-[var(--color-verde-100)] font-medium">Entidad operable — todas las reglas de negocio cumplidas</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold text-[var(--color-neutro-900)]">{entity.nombre}</h3>
          <p className="text-[13px] text-[var(--color-neutro-500)]">{entity.codigo}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-500)] transition-colors"
            title="Editar"
            onClick={onEdit}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors"
            title="Eliminar"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Nivel</p>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{tipo?.etiqueta ?? entity.nivel}</p>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Subtipo</p>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{entity.subtipo || "—"}</p>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Estado</p>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-corner-m text-[12px] font-medium ${
            entity.activo
              ? "bg-[var(--color-verde-100)]/10 text-[var(--color-verde-100)]"
              : "bg-red-50 text-red-500"
          }`}>
            {entity.activo ? "Activo" : "Inactivo"}
          </span>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Actualizado</p>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">
            {new Date(entity.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Hijos permitidos */}
      {tipo && (
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[12px] text-[var(--color-neutro-500)] mb-1 font-medium">Hijos permitidos</p>
          <div className="flex flex-wrap gap-1.5">
            {tipo.hijosPermitidos.length > 0 ? (
              tipo.hijosPermitidos.map((h) => {
                const ht = getEntityType(h);
                return (
                  <span
                    key={h}
                    className="px-2 py-0.5 rounded-corner-m text-[12px] bg-[var(--color-neutro-100)] text-[var(--color-neutro-600)]"
                  >
                    {ht?.etiqueta ?? h}
                  </span>
                );
              })
            ) : (
              <span className="text-[12px] text-[var(--color-neutro-400)] italic">Entidad hoja — no puede contener hijos</span>
            )}
          </div>
        </div>
      )}

      {/* Metadata */}
      {metadataEntries.length > 0 && (
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[12px] text-[var(--color-neutro-500)] mb-2 font-medium">Propiedades y Parámetros</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {metadataEntries.map((entry) => (
              <div key={entry.label} className="flex flex-col">
                <span className="text-[11px] text-[var(--color-neutro-400)] uppercase tracking-wide">{entry.label}</span>
                <span className="text-[13px] text-[var(--color-neutro-800)] font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Children list */}
      {puedeTenerHijos && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold text-[var(--color-neutro-700)]">
              Hijos ({children.length})
            </p>
            <button
              className="flex items-center gap-1 text-[12px] font-medium text-[var(--color-verde-100)] hover:underline"
              onClick={onAddChild}
            >
              <Plus className="w-3.5 h-3.5" /> Agregar hijo
            </button>
          </div>
          {children.length > 0 ? (
            <div className="space-y-1">
              {children.map((child) => {
                const ct = getEntityType(child.nivel);
                return (
                  <div
                    key={child.id}
                    className="flex items-center justify-between px-3 py-2 rounded-corner-m bg-white border border-[var(--color-neutro-200)] text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--color-neutro-800)]">{child.nombre}</span>
                      <span className="text-[11px] text-[var(--color-neutro-400)]">{child.codigo}</span>
                    </div>
                    <span className="text-[11px] text-[var(--color-neutro-500)]">{ct?.etiqueta ?? child.nivel}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[12px] text-[var(--color-neutro-400)] italic">
              No tiene hijos registrados
            </p>
          )}
        </div>
      )}
    </div>
  );
}
