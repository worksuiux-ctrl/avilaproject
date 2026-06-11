import { useCallback, useMemo, useEffect, useState, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  reconnectEdge,
  Handle,
  Position,
  type Node,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Search, X, ChevronRight } from "lucide-react";
import dagre from "dagre";
import { useEntitiesStore, type Entity } from "@stores/entitiesStore";
import { getEntityType } from "@data/entityCatalog";
import { isEntityOperable } from "@data/entityRules";
import { EntityIcon } from "./entityIcons";

function EntityNode({ data }: { data: Record<string, unknown> }) {
  const tipo = getEntityType(data.nivel as string);
  const color = tipo?.color ?? "#94a3b8";
  const operable = data.operable as boolean;
  return (
    <div
      className={`rounded-corner-m bg-white border-2 shadow-sm min-w-[180px] ${!operable ? "opacity-80" : ""}`}
      style={{ borderColor: operable ? color : "#f87171" }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
      <div className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          {!operable && <span className="text-red-400 text-[11px]">⚠</span>}
          <EntityIcon nivel={data.nivel as string} subtipo={data.subtipo as string} className="w-5 h-5 shrink-0" style={{ color, strokeWidth: 2 }} />
          <div className="text-[13px] font-bold text-[var(--color-neutro-900)] leading-tight">{data.label as string}</div>
        </div>
        <div className="text-[11px] text-[var(--color-neutro-400)] font-mono mt-0.5">{data.codigo as string}</div>
        <div className="mt-1.5">
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-corner-m"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {tipo?.etiqueta ?? (data.nivel as string)}
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
    </div>
  );
}

function GroupNode({ data }: { data: Record<string, unknown> }) {
  const color = data.color as string;
  return (
    <div
      className="rounded-corner-m bg-[var(--color-neutro-50)] border-2 border-dashed shadow-sm min-w-[160px] cursor-pointer hover:bg-[var(--color-neutro-100)] transition-colors"
      style={{ borderColor: color }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
      <div className="px-4 py-3 flex items-center gap-2">
        <EntityIcon nivel={data.nivel as string} subtipo={data.subtipo as string} className="w-6 h-6 shrink-0" style={{ color }} />
        <div>
          <div className="text-[14px] font-bold text-[var(--color-neutro-800)]">{data.label as string}</div>
          <div className="text-[11px] text-[var(--color-neutro-500)]">{data.count as string} elementos</div>
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--color-neutro-400)] ml-auto shrink-0" />
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
    </div>
  );
}

const NODE_TYPES = { entity: EntityNode as any, group: GroupNode as any };

function groupKey(parentId: string, subtipo: string) {
  return `group-${parentId}-${subtipo}`;
}

function isGroupNode(node: Node) {
  return node.id.startsWith("group-");
}

function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 60, ranksep: 100 });
  nodes.forEach((n) => {
    const isGroup = n.id.startsWith("group-");
    g.setNode(n.id, { width: isGroup ? 200 : 200, height: isGroup ? 65 : 90 });
  });
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map((n) => {
    const pos = g.node(n.id) as { x: number; y: number };
    return { ...n, position: { x: pos.x - 100, y: pos.y - 45 } };
  });
}

interface EntityDiagramProps {
  onSelectEntity: (id: string) => void;
}

export function EntityDiagram({ onSelectEntity }: EntityDiagramProps) {
  const entities = useEntitiesStore((s) => s.entities);
  const updateEntity = useEntitiesStore((s) => s.updateEntity);
  const selectedId = useEntitiesStore((s) => s.selectedId);
  const rootEntityId = useMemo(() => entities.find((e) => !e.padreId)?.id ?? null, [entities]);
  const [focusId, setFocusId] = useState<string | null>(rootEntityId);
  const rfInstance = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (rootEntityId && focusId === null) setFocusId(rootEntityId);
  }, [rootEntityId, focusId]);

  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return entities
      .filter((e) => e.nombre.toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q))
      .slice(0, 20);
  }, [entities, searchQuery]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const focusedEntity = useMemo(() => entities.find((e) => e.id === focusId), [entities, focusId]);

  const directChildren = useMemo(() => {
    return entities.filter((e) => e.padreId === focusId);
  }, [entities, focusId]);

  const groupedChildren = useMemo(() => {
    const groups: { subtipo: string; items: Entity[]; color: string }[] = [];
    const grouped: Record<string, Entity[]> = {};
    for (const child of directChildren) {
      const key = child.subtipo ?? child.nivel;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(child);
    }
    for (const [subtipo, items] of Object.entries(grouped)) {
      const tipo = getEntityType(items[0].nivel);
      groups.push({ subtipo, items, color: tipo?.color ?? "#94a3b8" });
    }
    return groups;
  }, [directChildren]);

  const rawNodes: Node[] = useMemo(() => {
    if (!focusId) return [];
    const result: Node[] = [];

    if (focusedEntity) {
      result.push({
        id: focusedEntity.id,
        type: "entity",
        position: { x: 0, y: 0 },
        data: { label: focusedEntity.nombre, codigo: focusedEntity.codigo, nivel: focusedEntity.nivel, subtipo: focusedEntity.subtipo, operable: isEntityOperable(focusedEntity, entities) },
      });
    }

    if (focusedEntity?.padreId) {
      const parent = entities.find((e) => e.id === focusedEntity.padreId);
      if (parent) {
        result.push({
          id: parent.id,
          type: "entity",
          position: { x: 0, y: 0 },
          data: { label: parent.nombre, codigo: parent.codigo, nivel: parent.nivel, subtipo: parent.subtipo, operable: isEntityOperable(parent, entities) },
        });
      }
    }

    for (const group of groupedChildren) {
      if (group.items.length > 1) {
        const gkey = groupKey(focusId, group.subtipo);
        if (expandedGroups.has(gkey)) {
          for (const item of group.items) {
            result.push({
              id: item.id,
              type: "entity",
              position: { x: 0, y: 0 },
              data: { label: item.nombre, codigo: item.codigo, nivel: item.nivel, subtipo: item.subtipo, operable: isEntityOperable(item, entities) },
            });
          }
        } else {
          result.push({
            id: gkey,
            type: "group",
            position: { x: 0, y: 0 },
            data: { label: group.subtipo, count: String(group.items.length), color: group.color, nivel: group.items[0].nivel, subtipo: group.subtipo },
          });
        }
      } else {
        const item = group.items[0];
        result.push({
          id: item.id,
          type: "entity",
          position: { x: 0, y: 0 },
          data: { label: item.nombre, codigo: item.codigo, nivel: item.nivel, operable: isEntityOperable(item, entities) },
        });
      }
    }

    return result;
  }, [focusedEntity, entities, groupedChildren, expandedGroups, focusId]);

  const rawEdges: Edge[] = useMemo(() => {
    if (!focusId) return [];
    const result: Edge[] = [];

    if (focusedEntity?.padreId) {
      result.push({
        id: `e-${focusedEntity.padreId}-${focusedEntity.id}`,
        source: focusedEntity.padreId,
        target: focusedEntity.id,
        type: "smoothstep",
        style: { stroke: "#94a3b8", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, strokeWidth: 2 },
        reconnectable: "target" as const,
      });
    }

    for (const group of groupedChildren) {
      if (group.items.length > 1) {
        const gkey = groupKey(focusId, group.subtipo);
        if (expandedGroups.has(gkey)) {
          for (const item of group.items) {
            result.push({
              id: `e-${focusId}-${item.id}`,
              source: focusId,
              target: item.id,
              type: "smoothstep",
              style: { stroke: "#94a3b8", strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, strokeWidth: 2 },
              reconnectable: "target" as const,
            });
          }
        } else {
          result.push({
            id: `e-${focusId}-${gkey}`,
            source: focusId,
            target: gkey,
            type: "smoothstep",
            style: { stroke: group.color, strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, strokeWidth: 2 },
            reconnectable: false,
          });
        }
      } else {
        result.push({
          id: `e-${focusId}-${group.items[0].id}`,
          source: focusId,
          target: group.items[0].id,
          type: "smoothstep",
          style: { stroke: "#94a3b8", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, strokeWidth: 2 },
          reconnectable: "target" as const,
        });
      }
    }

    return result;
  }, [focusedEntity, focusId, groupedChildren, expandedGroups]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const layouted = layoutNodes(rawNodes, rawEdges);
    setNodes(layouted);
    setEdges(rawEdges);
  }, [rawNodes, rawEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: any) => {
      if (!connection.source || !connection.target) return;
      if (connection.target.startsWith("group-")) return;
      const entity = entities.find((e: any) => e.id === connection.target);
      if (entity) updateEntity(entity.id, { padreId: connection.source });
      setEdges((eds: Edge[]) => [
        ...eds.filter((e: Edge) => e.target !== connection.target),
        {
          id: `e-${connection.source}-${connection.target}`,
          source: connection.source,
          target: connection.target,
          type: "smoothstep",
          style: { stroke: "#94a3b8", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, strokeWidth: 2 },
          reconnectable: "target" as const,
        },
      ]);
    },
    [entities, updateEntity, setEdges]
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: any) => {
      if (newConnection.target.startsWith("group-")) return;
      const entity = entities.find((e: any) => e.id === newConnection.target);
      if (entity) updateEntity(entity.id, { padreId: newConnection.source });
      setEdges((eds: Edge[]) => reconnectEdge(oldEdge, newConnection, eds));
    },
    [entities, updateEntity, setEdges]
  );

  const onInit = useCallback((instance: any) => { rfInstance.current = instance; }, []);

  useEffect(() => {
    if (rfInstance.current) {
      setTimeout(() => rfInstance.current.fitView({ duration: 200 }), 50);
    }
  }, [focusId]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (!isGroupNode(node)) onSelectEntity(node.id);
    },
    [onSelectEntity]
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (isGroupNode(node)) {
        setExpandedGroups((prev) => {
          const next = new Set(prev);
          if (next.has(node.id)) next.delete(node.id);
          else next.add(node.id);
          return next;
        });
      } else {
        setFocusId(node.id);
      }
    },
    []
  );

  const styledNodes = useMemo(
    () =>
      nodes.map((n: Node) => ({
        ...n,
        selected: n.id === selectedId,
        style: n.id === selectedId
          ? { filter: "drop-shadow(0 0 8px rgba(34,197,94,0.5))" }
          : undefined,
      })),
    [nodes, selectedId]
  );

  return (
    <ReactFlow
      nodes={styledNodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onReconnect={onReconnect}
      onNodeClick={onNodeClick}
      onNodeDoubleClick={onNodeDoubleClick}
      onInit={onInit}
      // @ts-ignore
      nodeTypes={NODE_TYPES}
      fitView
      deleteKeyCode={null}
      minZoom={0.3}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      defaultEdgeOptions={{ type: "smoothstep" }}
      panOnDrag={[2, 3] as any}
      selectNodesOnDrag={false}
      nodesDraggable={true}
      nodesFocusable={false}
      edgesFocusable={false}
    >
      {/* Search and focus UI */}
      <Panel position="top-left" className="!m-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
            <input
              className="w-56 pl-8 pr-2 py-1.5 text-[13px] border border-[var(--color-neutro-200)] rounded-corner-m bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-verde-100)]/30 shadow-sm"
              placeholder="Buscar entidad para aislar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)]"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-3 h-3" />
              </button>
            )}
            {/* Search suggestions */}
            {searchQuery && searchMatches.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-lg z-20 max-h-48 overflow-y-auto">
                {searchMatches.map((e) => (
                  <button
                    key={e.id}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-left hover:bg-[var(--color-neutro-100)] transition-colors"
                    onClick={() => { setFocusId(e.id); setSearchQuery(""); }}
                  >
                    <span className="font-medium truncate">{e.nombre}</span>
                    <span className="text-[11px] text-[var(--color-neutro-400)] shrink-0">{e.codigo}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </Panel>

      <Background color="#e2e8f0" gap={20} />
      <Controls
        showInteractive={false}
        className="!rounded-corner-m !border !border-[var(--color-neutro-200)]"
      />
      <MiniMap
        style={{ transform: "scale(0.5)", transformOrigin: "bottom right" }}
        nodeStrokeColor="#94a3b8"
        nodeColor="#f1f5f9"
        nodeBorderRadius={4}
        className="!rounded-corner-m !border !border-[var(--color-neutro-200)]"
      />
    </ReactFlow>
  );
}
