import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

interface ExcalidrawElementStub {
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  backgroundColor?: string;
  strokeColor?: string;
  fillStyle?: string;
  strokeWidth?: number;
  roughness?: number;
  roundness?: { type: number };
  fontSize?: number;
  points?: [number, number][];
}

interface GraphNode {
  id: string;
  label: string;
  sublabel?: string;
  type?: "rectangle" | "diamond" | "ellipse" | "cylinder";
  color?: string;
  column?: number;
  row?: number;
}

interface GraphConnection {
  from: string;
  to: string;
  label?: string;
}

interface GraphGroup {
  title: string;
  nodeIds: string[];
}

const colorPalettes: Record<string, { bg: string; stroke: string; text: string; sub: string }> = {
  blue: { bg: "#dbeafe", stroke: "#2563eb", text: "#1e3a8a", sub: "#3b82f6" },
  purple: { bg: "#ede9fe", stroke: "#7c3aed", text: "#4c1d95", sub: "#8b5cf6" },
  green: { bg: "#dcfce7", stroke: "#16a34a", text: "#14532d", sub: "#22c55e" },
  amber: { bg: "#fef3c7", stroke: "#d97706", text: "#78350f", sub: "#f59e0b" },
  red: { bg: "#fee2e2", stroke: "#dc2626", text: "#7f1d1d", sub: "#ef4444" },
  cyan: { bg: "#cffafe", stroke: "#0891b2", text: "#164e63", sub: "#06b6d4" },
  slate: { bg: "#f1f5f9", stroke: "#64748b", text: "#0f172a", sub: "#64748b" },
  indigo: { bg: "#e0e7ff", stroke: "#4338ca", text: "#312e81", sub: "#6366f1" },
  orange: { bg: "#ffedd5", stroke: "#ea580c", text: "#7c2d12", sub: "#f97316" },
  teal: { bg: "#ccfbf1", stroke: "#0d9488", text: "#134e4a", sub: "#14b8a6" },
};

function compileGraphToExcalidraw(
  nodes: GraphNode[],
  connections: GraphConnection[],
  groups: GraphGroup[] = []
): ExcalidrawElementStub[] {
  if (!Array.isArray(nodes) || nodes.length === 0) return [];

  const inDegrees: Record<string, number> = {};
  const adj: Record<string, string[]> = {};
  nodes.forEach((n) => {
    inDegrees[n.id] = 0;
    adj[n.id] = [];
  });
  connections.forEach((c) => {
    if (inDegrees[c.to] !== undefined) inDegrees[c.to]++;
    if (adj[c.from]) adj[c.from].push(c.to);
  });

  const depths: Record<string, number> = {};
  const queue: string[] = [];
  nodes.forEach((n) => {
    if (inDegrees[n.id] === 0) {
      depths[n.id] = 0;
      queue.push(n.id);
    }
  });

  if (queue.length === 0 && nodes.length > 0) {
    depths[nodes[0].id] = 0;
    queue.push(nodes[0].id);
  }

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const currDepth = depths[curr] || 0;
    for (const neighbor of (adj[curr] || [])) {
      depths[neighbor] = Math.max(depths[neighbor] || 0, currDepth + 1);
      queue.push(neighbor);
    }
  }

  nodes.forEach((n) => {
    if (depths[n.id] === undefined) depths[n.id] = 0;
  });

  const colCounts = new Map<number, number>();
  const nodePositions = new Map<
    string,
    { x: number; y: number; width: number; height: number; strokeColor: string; column: number; row: number; id: string; label: string }
  >();

  const colWidth = 220;
  const rowHeight = 85;
  const colGap = 130;
  const rowGap = 55;
  const startX = 80;
  const startY = 100;

  const elements: ExcalidrawElementStub[] = [];

  nodes.forEach((n) => {
    const col = n.column !== undefined ? n.column : (depths[n.id] || 0);
    const currCount = colCounts.get(col) || 0;
    const row = n.row !== undefined ? n.row : currCount;
    colCounts.set(col, Math.max(currCount, Math.floor(row) + 1));

    const w = n.type === "diamond" ? 170 : colWidth;
    const h = n.type === "diamond" ? 90 : rowHeight;
    const x = startX + col * (colWidth + colGap);
    const y = startY + row * (rowHeight + rowGap);

    const paletteKey = (n.color || "indigo").toLowerCase();
    const palette = colorPalettes[paletteKey] || colorPalettes.indigo;

    nodePositions.set(n.id, {
      x,
      y,
      width: w,
      height: h,
      strokeColor: palette.stroke,
      column: col,
      row,
      id: n.id,
      label: n.label,
    });

    elements.push({
      type: n.type === "diamond" ? "diamond" : n.type === "ellipse" ? "ellipse" : "rectangle",
      x,
      y,
      width: w,
      height: h,
      backgroundColor: palette.bg,
      strokeColor: palette.stroke,
      fillStyle: "solid",
      strokeWidth: 2,
      roughness: 0,
      roundness: { type: 3 },
    });

    const titleY = n.sublabel ? y + 20 : y + Math.floor(h / 2) - 8;
    elements.push({
      type: "text",
      x: x + 16,
      y: titleY,
      text: n.label,
      fontSize: 14,
      strokeColor: palette.text,
    });

    if (n.sublabel) {
      elements.push({
        type: "text",
        x: x + 16,
        y: y + 45,
        text: n.sublabel,
        fontSize: 11,
        strokeColor: palette.sub,
      });
    }
  });

  const normalizedNodeMap = new Map<string, typeof nodePositions extends Map<any, infer V> ? V : never>();
  nodes.forEach((n) => {
    const pos = nodePositions.get(n.id);
    if (!pos) return;
    normalizedNodeMap.set(n.id.toLowerCase().trim(), pos);
    normalizedNodeMap.set(n.id.toLowerCase().replace(/[^a-z0-9]/g, ""), pos);
    normalizedNodeMap.set(n.label.toLowerCase().trim(), pos);
    normalizedNodeMap.set(n.label.toLowerCase().replace(/[^a-z0-9]/g, ""), pos);
  });

  const findNode = (ref: string) => {
    if (!ref) return undefined;
    if (nodePositions.has(ref)) return nodePositions.get(ref);
    const direct = normalizedNodeMap.get(ref.toLowerCase().trim());
    if (direct) return direct;
    const stripped = ref.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalizedNodeMap.has(stripped)) return normalizedNodeMap.get(stripped);
    for (const [key, val] of normalizedNodeMap.entries()) {
      if (key.length > 3 && (key.includes(stripped) || stripped.includes(key))) {
        return val;
      }
    }
    return undefined;
  };

  const incomingCounts: Record<string, number> = {};
  const outgoingCounts: Record<string, number> = {};
  nodes.forEach((n) => {
    incomingCounts[n.id] = 0;
    outgoingCounts[n.id] = 0;
  });

  const drawnPairs = new Set<string>();

  const renderArrow = (
    src: NonNullable<ReturnType<typeof findNode>>,
    tgt: NonNullable<ReturnType<typeof findNode>>,
    label?: string
  ) => {
    const pairKey = `${src.id}->${tgt.id}`;
    if (drawnPairs.has(pairKey)) return;
    drawnPairs.add(pairKey);

    incomingCounts[tgt.id] = (incomingCounts[tgt.id] || 0) + 1;
    outgoingCounts[src.id] = (outgoingCounts[src.id] || 0) + 1;

    let sX: number, sY: number, eX: number, eY: number;

    if (tgt.x > src.x + 50) {
      sX = src.x + src.width;
      sY = src.y + Math.floor(src.height / 2);
      eX = tgt.x;
      eY = tgt.y + Math.floor(tgt.height / 2);
    } else if (tgt.y > src.y + 50) {
      sX = src.x + Math.floor(src.width / 2);
      sY = src.y + src.height;
      eX = tgt.x + Math.floor(tgt.width / 2);
      eY = tgt.y;
    } else if (tgt.x < src.x - 50) {
      sX = src.x;
      sY = src.y + Math.floor(src.height / 2);
      eX = tgt.x + tgt.width;
      eY = tgt.y + Math.floor(tgt.height / 2);
    } else {
      sX = src.x + Math.floor(src.width / 2);
      sY = src.y;
      eX = tgt.x + Math.floor(tgt.width / 2);
      eY = tgt.y + tgt.height;
    }

    const dx = eX - sX;
    const dy = eY - sY;

    elements.push({
      type: "arrow",
      x: sX,
      y: sY,
      width: Math.max(Math.abs(dx), 2),
      height: Math.max(Math.abs(dy), 2),
      points: [[0, 0], [dx, dy]],
      strokeColor: src.strokeColor || "#6366f1",
      strokeWidth: 2,
      roughness: 0,
    });

    if (label) {
      const midX = sX + Math.floor(dx / 2) - Math.floor(label.length * 3.2);
      const midY = sY + Math.floor(dy / 2) - 16;
      elements.push({
        type: "text",
        x: Math.max(10, midX),
        y: Math.max(10, midY),
        text: label,
        fontSize: 11,
        strokeColor: "#64748b",
      });
    }
  };

  connections.forEach((conn) => {
    const src = findNode(conn.from);
    const tgt = findNode(conn.to);
    if (!src || !tgt || src.id === tgt.id) return;
    renderArrow(src, tgt, conn.label);
  });

  const nodesByColumn = new Map<number, NonNullable<ReturnType<typeof findNode>>[]>();
  nodes.forEach((n) => {
    const pos = nodePositions.get(n.id);
    if (!pos) return;
    const colList = nodesByColumn.get(pos.column) || [];
    colList.push(pos);
    nodesByColumn.set(pos.column, colList);
  });

  const sortedCols = Array.from(nodesByColumn.keys()).sort((a, b) => a - b);
  for (let i = 1; i < sortedCols.length; i++) {
    const prevColNodes = nodesByColumn.get(sortedCols[i - 1]) || [];
    const currColNodes = nodesByColumn.get(sortedCols[i]) || [];

    if (prevColNodes.length === 0 || currColNodes.length === 0) continue;

    currColNodes.forEach((currNode) => {
      if ((incomingCounts[currNode.id] || 0) > 0) return;

      const currClean = currNode.id.toLowerCase().replace(/[^a-z0-9]/g, "");
      let bestSource = prevColNodes.find((p) => {
        const pClean = p.id.toLowerCase().replace(/[^a-z0-9]/g, "");
        return (
          pClean.includes(currClean.replace(/(service|db|database|cache|store)/g, "")) ||
          currClean.includes(pClean.replace(/(service|db|database|cache|store)/g, ""))
        );
      });

      if (!bestSource) {
        bestSource = prevColNodes.find((p) => {
          const pLabel = p.label.toLowerCase();
          return pLabel.includes("gateway") || pLabel.includes("ingress") || pLabel.includes("proxy");
        });
      }

      if (!bestSource) {
        bestSource = prevColNodes[Math.min(currNode.row, prevColNodes.length - 1)];
      }

      if (bestSource && bestSource.id !== currNode.id) {
        renderArrow(bestSource, currNode);
      }
    });
  }

  if (Array.isArray(groups) && groups.length > 0) {
    const groupElements: ExcalidrawElementStub[] = [];
    groups.forEach((g) => {
      const groupNodes = (g.nodeIds || [])
        .map((id) => nodePositions.get(id))
        .filter(Boolean) as { x: number; y: number; width: number; height: number }[];

      if (groupNodes.length === 0) return;

      const minX = Math.min(...groupNodes.map((n) => n.x)) - 25;
      const minY = Math.min(...groupNodes.map((n) => n.y)) - 38;
      const maxX = Math.max(...groupNodes.map((n) => n.x + n.width)) + 25;
      const maxY = Math.max(...groupNodes.map((n) => n.y + n.height)) + 25;

      groupElements.push(
        {
          type: "rectangle",
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          backgroundColor: "#f8fafc",
          strokeColor: "#cbd5e1",
          fillStyle: "solid",
          strokeWidth: 1,
          roughness: 0,
          roundness: { type: 3 },
        },
        {
          type: "text",
          x: minX + 16,
          y: minY + 12,
          text: g.title,
          fontSize: 13,
          strokeColor: "#475569",
        }
      );
    });
    elements.unshift(...groupElements);
  }

  return elements;
}

function sanitizeRawElements(rawElements: ExcalidrawElementStub[]): ExcalidrawElementStub[] {
  const shapes = rawElements.filter(
    (el) => el.type === "rectangle" || el.type === "diamond" || el.type === "ellipse"
  );

  return rawElements.map((el) => {
    if (el.type !== "arrow") return el;

    let currentX = el.x ?? 0;
    let currentY = el.y ?? 0;
    let points = el.points || [[0, 0], [100, 0]];

    if (points.length > 1 && (points[0][0] !== 0 || points[0][1] !== 0)) {
      const p0x = points[0][0];
      const p0y = points[0][1];
      currentX += p0x;
      currentY += p0y;
      points = points.map((p) => [p[0] - p0x, p[1] - p0y]);
    }

    if (currentX <= 10 && currentY <= 10 && shapes.length > 0) {
      const targetPoint = points[1] || [100, 0];
      const endAbsX = currentX + targetPoint[0];
      const endAbsY = currentY + targetPoint[1];

      const nearestShape = shapes.reduce(
        (best, s) => {
          const dist = Math.hypot(s.x - endAbsX, s.y - endAbsY);
          return dist < best.dist ? { shape: s, dist } : best;
        },
        { shape: shapes[0], dist: Infinity }
      ).shape;

      currentX = nearestShape.x + (nearestShape.width || 180);
      currentY = nearestShape.y + Math.floor((nearestShape.height || 80) / 2);
    }

    return {
      ...el,
      x: currentX,
      y: currentY,
      points,
    };
  });
}

function generateFallbackElements(type: string, prompt: string): { elements: ExcalidrawElementStub[]; summary: string } {
  const cleanPrompt = prompt.toLowerCase();

  if (
    cleanPrompt.includes("world") ||
    cleanPrompt.includes("countr") ||
    cleanPrompt.includes("earth") ||
    cleanPrompt.includes("continent") ||
    cleanPrompt.includes("geograph")
  ) {
    const summary = `### World Overview & Continental Breakdown\n\n- **Asia**: High-density hubs featuring China, India, and Japan.\n- **Europe**: Developed economic block featuring United Kingdom, Germany, and France.\n- **Americas**: Pan-continental alliance spanning North & South America with USA, Canada, and Brazil.\n- **Africa & Oceania**: Dynamic emerging regions featuring Egypt, Nigeria, and Australia.`;

    const nodes: GraphNode[] = [
      { id: "asia_china", label: "China", sublabel: "Beijing | Asia", type: "rectangle", color: "blue", column: 0, row: 0 },
      { id: "asia_india", label: "India", sublabel: "New Delhi | Asia", type: "rectangle", color: "blue", column: 0, row: 1 },
      { id: "asia_japan", label: "Japan", sublabel: "Tokyo | Asia", type: "rectangle", color: "blue", column: 0, row: 2 },
      { id: "eur_uk", label: "United Kingdom", sublabel: "London | Europe", type: "rectangle", color: "purple", column: 1, row: 0 },
      { id: "eur_germany", label: "Germany", sublabel: "Berlin | Europe", type: "rectangle", color: "purple", column: 1, row: 1 },
      { id: "eur_france", label: "France", sublabel: "Paris | Europe", type: "rectangle", color: "purple", column: 1, row: 2 },
      { id: "ame_usa", label: "United States", sublabel: "Washington D.C. | N. America", type: "rectangle", color: "green", column: 2, row: 0 },
      { id: "ame_canada", label: "Canada", sublabel: "Ottawa | N. America", type: "rectangle", color: "green", column: 2, row: 1 },
      { id: "ame_brazil", label: "Brazil", sublabel: "Brasília | S. America", type: "rectangle", color: "green", column: 2, row: 2 },
      { id: "afr_egypt", label: "Egypt", sublabel: "Cairo | Africa", type: "rectangle", color: "amber", column: 3, row: 0 },
      { id: "afr_nigeria", label: "Nigeria", sublabel: "Abuja | Africa", type: "rectangle", color: "amber", column: 3, row: 1 },
      { id: "oce_australia", label: "Australia", sublabel: "Canberra | Oceania", type: "rectangle", color: "cyan", column: 3, row: 2 },
    ];

    const connections: GraphConnection[] = [
      { from: "asia_china", to: "eur_germany", label: "Trade Route" },
      { from: "eur_uk", to: "ame_usa", label: "Transatlantic Ties" },
      { from: "ame_usa", to: "ame_canada", label: "USMCA Accord" },
      { from: "eur_france", to: "afr_egypt", label: "Mediterranean Hub" },
      { from: "asia_japan", to: "oce_australia", label: "Pacific Partnership" },
    ];

    const groups: GraphGroup[] = [
      { title: "Asia", nodeIds: ["asia_china", "asia_india", "asia_japan"] },
      { title: "Europe", nodeIds: ["eur_uk", "eur_germany", "eur_france"] },
      { title: "The Americas", nodeIds: ["ame_usa", "ame_canada", "ame_brazil"] },
      { title: "Africa & Oceania", nodeIds: ["afr_egypt", "afr_nigeria", "oce_australia"] },
    ];

    return {
      elements: compileGraphToExcalidraw(nodes, connections, groups),
      summary,
    };
  }

  if (type === "Flowchart" || cleanPrompt.includes("flow") || cleanPrompt.includes("auth") || cleanPrompt.includes("login") || cleanPrompt.includes("checkout")) {
    const summary = `### Process Workflow\n\n1. **User Request**: Initial state trigger from user interaction.\n2. **Validation Engine**: Evaluates constraints, eligibility, and format rules.\n3. **Decision Branch**: Routes execution based on condition outcome.\n4. **Execution Stage**: Processes verified action state.\n5. **Completion**: Emits resolved response and feedback state.`;

    const nodes: GraphNode[] = [
      { id: "flow_start", label: "Start Action", sublabel: prompt.slice(0, 24), type: "rectangle", color: "blue", column: 0, row: 0 },
      { id: "flow_validate", label: "Validation Gate", sublabel: "Rules & Integrity Check", type: "rectangle", color: "purple", column: 1, row: 0 },
      { id: "flow_decision", label: "Condition Met?", sublabel: "Decision Check", type: "diamond", color: "amber", column: 2, row: 0 },
      { id: "flow_success", label: "Execute State", sublabel: "Success Handler", type: "rectangle", color: "green", column: 3, row: 0 },
      { id: "flow_fallback", label: "Error Handler", sublabel: "Retry / Exception", type: "rectangle", color: "red", column: 2, row: 1 },
      { id: "flow_complete", label: "Completion", sublabel: "Resolved State", type: "rectangle", color: "cyan", column: 4, row: 0 },
    ];

    const connections: GraphConnection[] = [
      { from: "flow_start", to: "flow_validate", label: "Trigger" },
      { from: "flow_validate", to: "flow_decision", label: "Evaluate" },
      { from: "flow_decision", to: "flow_success", label: "Yes / Pass" },
      { from: "flow_decision", to: "flow_fallback", label: "No / Fail" },
      { from: "flow_success", to: "flow_complete", label: "Done" },
    ];

    const groups: GraphGroup[] = [
      { title: "Input & Ingress", nodeIds: ["flow_start", "flow_validate"] },
      { title: "Processing & Resolution", nodeIds: ["flow_decision", "flow_success", "flow_fallback", "flow_complete"] },
    ];

    return {
      elements: compileGraphToExcalidraw(nodes, connections, groups),
      summary,
    };
  }

  if (type === "Architecture" || cleanPrompt.includes("microservice") || cleanPrompt.includes("server") || cleanPrompt.includes("database") || cleanPrompt.includes("kubernetes")) {
    const summary = `### Enterprise System Architecture Blueprint\n\n- **Client & Edge Tier**: Multi-platform web and mobile clients connected via reverse proxy with TLS termination.\n- **Application Services Cluster**: Decoupled core microservices processing business logic and dispatching asynchronous events.\n- **Asynchronous Messaging**: High-throughput message streaming broker coordinating background worker pools.\n- **Persistence & Caching Tier**: Serverless PostgreSQL with Redis in-memory query caching.\n- **Observability**: Centralized logging, distributed tracing, and metrics instrumentation across all tiers.`;

    const nodes: GraphNode[] = [
      { id: "web_client", label: "Web Client", sublabel: "Modern UI App", type: "rectangle", color: "blue", column: 0, row: 0 },
      { id: "mobile_client", label: "Mobile Client", sublabel: "Native Client", type: "rectangle", color: "blue", column: 0, row: 1 },
      { id: "gateway", label: "API Gateway", sublabel: "Reverse Proxy & TLS", type: "rectangle", color: "purple", column: 1, row: 0.5 },
      { id: "core_service", label: "Core API Service", sublabel: "Business Logic Engine", type: "rectangle", color: "indigo", column: 2, row: 0 },
      { id: "worker_service", label: "Background Worker", sublabel: "Async Job Processor", type: "rectangle", color: "cyan", column: 2, row: 1 },
      { id: "event_bus", label: "Event Streaming", sublabel: "Pub/Sub Broker", type: "rectangle", color: "orange", column: 2, row: 2 },
      { id: "postgres_db", label: "Primary Database", sublabel: "Relational Store", type: "rectangle", color: "teal", column: 3, row: 0 },
      { id: "redis_cache", label: "Redis Cache", sublabel: "Sub-ms In-Memory", type: "rectangle", color: "red", column: 3, row: 1 },
      { id: "metrics_service", label: "Telemetry & Logs", sublabel: "Metrics Collector", type: "rectangle", color: "slate", column: 3, row: 2 },
    ];

    const connections: GraphConnection[] = [
      { from: "web_client", to: "gateway", label: "HTTPS / TLS" },
      { from: "mobile_client", to: "gateway", label: "HTTPS / TLS" },
      { from: "gateway", to: "core_service", label: "gRPC / REST" },
      { from: "core_service", to: "event_bus", label: "Publish" },
      { from: "event_bus", to: "worker_service", label: "Consume" },
      { from: "core_service", to: "postgres_db", label: "SQL Query" },
      { from: "core_service", to: "redis_cache", label: "Cache Aside" },
      { from: "core_service", to: "metrics_service", label: "Emit Spans" },
    ];

    const groups: GraphGroup[] = [
      { title: "Client Applications", nodeIds: ["web_client", "mobile_client"] },
      { title: "Gateway & Microservices", nodeIds: ["gateway", "core_service", "worker_service", "event_bus"] },
      { title: "Data & Observability Tier", nodeIds: ["postgres_db", "redis_cache", "metrics_service"] },
    ];

    return {
      elements: compileGraphToExcalidraw(nodes, connections, groups),
      summary,
    };
  }

  const capitalizedPrompt = prompt.trim().charAt(0).toUpperCase() + prompt.trim().slice(1);
  const summary = `### Conceptual Breakdown: ${capitalizedPrompt}\n\n- **Foundations**: Key principles and preliminary requirements.\n- **Core Engine**: Processing, central mechanics, and transformations.\n- **Impact & Outputs**: Concrete outcomes, deliverables, and ecosystem effects.`;

  const nodes: GraphNode[] = [
    { id: "c_input1", label: `${capitalizedPrompt.slice(0, 18)} Specs`, sublabel: "Initial Parameters", type: "rectangle", color: "blue", column: 0, row: 0 },
    { id: "c_input2", label: "Context & Domain", sublabel: "Environment Rules", type: "rectangle", color: "blue", column: 0, row: 1 },
    { id: "c_proc1", label: "Core Processing", sublabel: "Analysis & Synthesis", type: "rectangle", color: "purple", column: 1, row: 0 },
    { id: "c_proc2", label: "Optimization Layer", sublabel: "Refinement Engine", type: "rectangle", color: "indigo", column: 1, row: 1 },
    { id: "c_out1", label: "Primary Deliverable", sublabel: "Expected Result", type: "rectangle", color: "green", column: 2, row: 0 },
    { id: "c_out2", label: "Feedback & Telemetry", sublabel: "Continuous Evaluation", type: "rectangle", color: "cyan", column: 2, row: 1 },
  ];

  const connections: GraphConnection[] = [
    { from: "c_input1", to: "c_proc1", label: "Supplies" },
    { from: "c_input2", to: "c_proc1", label: "Informs" },
    { from: "c_proc1", to: "c_proc2", label: "Iterates" },
    { from: "c_proc2", to: "c_out1", label: "Generates" },
    { from: "c_out1", to: "c_out2", label: "Monitors" },
  ];

  const groups: GraphGroup[] = [
    { title: "Foundations & Input", nodeIds: ["c_input1", "c_input2"] },
    { title: "Processing & Mechanics", nodeIds: ["c_proc1", "c_proc2"] },
    { title: "Outputs & Deliverables", nodeIds: ["c_out1", "c_out2"] },
  ];

  return {
    elements: compileGraphToExcalidraw(nodes, connections, groups),
    summary,
  };
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userInput, type, systemPrompt, action, context } = body;

    const groqKey = process.env.GROQ_API_KEY;

    if (!groqKey || groqKey === "gsk_placeholder" || groqKey.trim() === "") {
      if (action === "explain" || action === "summarize" || action === "brainstorm" || action === "smartdoc") {
        return NextResponse.json({
          response: `### Comprehensive Analysis for "${userInput}":\n\n1. **High-Level Overview**: Categorizes components with clear separation of responsibilities.\n2. **Component Interactions**: Direct connections link source entities to target destinations.\n3. **Domain Alignment**: Structure reflects the requested topic.\n\nConfigure GROQ_API_KEY in .env for dynamic AI generation.`,
        });
      }

      const fallback = generateFallbackElements(type || "Generate Diagrams", userInput || "Diagram");
      return NextResponse.json(fallback);
    }

    let userMessageContent = userInput;
    let systemInstruction = systemPrompt || "You are an AI whiteboard assistant.";

    if (action === "explain") {
      systemInstruction = `You are a principal architect and visual reviewer.
Analyze the provided whiteboard context in exhaustive depth.
Produce a structured markdown review covering:
1. Executive Summary & Design Principles
2. Structural Patterns & Topology
3. Data Flow & Communication Relationships
4. Bottlenecks, Gaps, & Considerations
5. Specific Next Step Recommendations`;
      userMessageContent = `Please review and explain in exhaustive technical detail the following whiteboard context:\n${context ? JSON.stringify(context) : userInput}`;
    } else if (action === "smartdoc") {
      systemInstruction = `You are an elite technical specification writer.
Generate exhaustive, comprehensive, professional documentation based on the user prompt.
Include:
- Overview & Strategic Purpose
- Component Responsibility Breakdown
- Protocols, Schemas, & Contracts
- Non-Functional Specifications (Scalability, Reliability, Security)
- Phased Implementation Roadmap`;
      userMessageContent = userInput;
    } else if (action === "brainstorm") {
      systemInstruction = `You are a chief product strategist and creative ideator.
Generate 6-8 deep, highly detailed, innovative visual proposals and structural feature sets based on the user prompt.
For each item, specify:
- Concept Name
- Structural Impact
- Value Proposition
- Implementation Complexity`;
      userMessageContent = userInput;
    } else {
      systemInstruction = `You are an expert AI whiteboard diagram visualizer.
Your mission is to decompose the user's prompt into an accurate, clean, structured visual graph matching their EXACT subject, topic, and domain.

CRITICAL DOMAIN RULES:
1. Subject Matter Precision:
   - If the user asks about world, geography, or countries: create groups for continents/regions (e.g. Asia, Europe, Americas, Africa, Oceania) and nodes for major countries in those regions with capitals or key facts as sublabels.
   - If the user asks about a flowchart or process: create sequential steps with diamond decision nodes and labeled outcomes.
   - If the user asks about software, cloud, or microservices: create tiers (Client, Gateway, Services, Databases).
   - If the user asks about business, marketing, or products: create marketing funnels, customer lifecycle stages, or feature matrices.
   - If the user asks about biology, science, or concepts: create categorical groups with related entities.
   - NEVER return an unrelated software architecture when the user asked for a different topic!

2. MANDATORY JSON OUTPUT FORMAT:
Output ONLY a valid JSON object matching this schema:
{
  "summary": "Detailed markdown explanation of the diagram, explaining each group, its key components, and relationships.",
  "groups": [
    { "title": "Group Name (e.g. Continent, Tier, or Category)", "nodeIds": ["node1", "node2"] }
  ],
  "nodes": [
    { "id": "unique_id", "label": "Main Label", "sublabel": "Subtitle or detail", "type": "rectangle", "color": "blue", "column": 0, "row": 0 }
  ],
  "connections": [
    { "from": "source_id", "to": "target_id", "label": "Relationship / action" }
  ]
}

DESIGN RULES:
- Layout: Columns 0, 1, 2, 3, etc. represent left-to-right progression or categories. Rows 0, 1, 2, etc. position nodes vertically within columns.
- Shapes: "rectangle" (default), "diamond" (decisions), "ellipse" (terminals or start/end).
- Colors: "blue", "purple", "green", "amber", "red", "cyan", "slate", "indigo", "orange", "teal".
- Return between 8 to 22 nodes depending on complexity.
- MANDATORY FULL CONNECTIVITY: Every single node MUST be connected with arrows. Connect upstream nodes to downstream nodes (e.g. clients to gateway, gateway to all microservices, each service to its database, queue, or cache). In flowcharts, connect each step sequentially.
- Use exact node 'id' values in 'from' and 'to'.
- NO markdown ticks, NO extra text outside the JSON object.`;
    }

    const candidateModels = [
      "openai/gpt-oss-120b",
      "groq/compound-mini",
      "qwen/qwen3.8-27b",
      "openai/gpt-oss-20b",
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
    ];

    let availableModels: string[] = [];
    try {
      const modelsRes = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${groqKey}` },
      });
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        const rawIds: string[] = modelsData?.data?.map((m: any) => m.id) || [];
        const cleanIds = rawIds.filter(
          (id) =>
            !id.includes("whisper") &&
            !id.includes("vision") &&
            !id.includes("guard") &&
            !id.includes("orpheus") &&
            !id.includes("safeguard")
        );
        availableModels = cleanIds;
      }
    } catch (e) {
      console.error(e);
    }

    const modelsToTry: string[] = [];
    candidateModels.forEach((cm) => {
      if (availableModels.includes(cm)) {
        modelsToTry.push(cm);
      }
    });

    availableModels.forEach((am) => {
      if (!modelsToTry.includes(am)) {
        modelsToTry.push(am);
      }
    });

    if (modelsToTry.length === 0) {
      modelsToTry.push("openai/gpt-oss-120b", "groq/compound-mini", "llama-3.1-8b-instant");
    }

    let completionSuccess = false;
    let rawContent = "";

    for (const modelName of modelsToTry) {
      try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: userMessageContent },
            ],
            temperature: 0.2,
            max_tokens: 1800,
            response_format:
              action === "explain" || action === "smartdoc" || action === "brainstorm"
                ? undefined
                : { type: "json_object" },
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          rawContent = data.choices?.[0]?.message?.content || "";
          if (rawContent.trim().length > 0) {
            completionSuccess = true;
            break;
          }
        } else {
          const errText = await groqResponse.text();
          console.error(`Model ${modelName} returned error:`, errText);
        }
      } catch (callErr) {
        console.error(`Failed calling model ${modelName}:`, callErr);
      }
    }

    if (!completionSuccess || !rawContent) {
      if (action === "explain" || action === "smartdoc" || action === "brainstorm") {
        return NextResponse.json({
          response: `### Structured Analysis for "${userInput}":\n\n1. **Core Topology**: Nodes organized by logical domain groups.\n2. **Protocol Standards**: Defined communication paths between related components.\n3. **Resilience & Coverage**: Clear boundaries with separation of responsibilities.`,
        });
      }

      const fallback = generateFallbackElements(type || "Generate Diagrams", userInput || "Diagram");
      return NextResponse.json(fallback);
    }

    if (action === "explain" || action === "smartdoc" || action === "brainstorm") {
      return NextResponse.json({ response: rawContent });
    }

    try {
      let cleaned = rawContent.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleaned);
      let outputElements: ExcalidrawElementStub[] = [];

      if (Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
        outputElements = compileGraphToExcalidraw(
          parsed.nodes,
          parsed.connections || [],
          parsed.groups || []
        );
      } else if (Array.isArray(parsed.elements) && parsed.elements.length > 0) {
        outputElements = sanitizeRawElements(parsed.elements);
      } else if (Array.isArray(parsed) && parsed.length > 0) {
        outputElements = sanitizeRawElements(parsed);
      }

      if (outputElements.length === 0) {
        const fallback = generateFallbackElements(type || "Generate Diagrams", userInput || "Diagram");
        return NextResponse.json(fallback);
      }

      return NextResponse.json({
        elements: outputElements,
        summary: parsed.summary || `Diagram generated with ${outputElements.length} elements reflecting "${userInput}".`,
      });
    } catch (parseError) {
      console.error("Failed to parse JSON from AI response:", parseError);
      const fallback = generateFallbackElements(type || "Generate Diagrams", userInput || "Diagram");
      return NextResponse.json(fallback);
    }
  } catch (error) {
    console.error("AI Route error:", error);
    return NextResponse.json(
      { error: "Failed to generate detailed AI response" },
      { status: 500 }
    );
  }
}

