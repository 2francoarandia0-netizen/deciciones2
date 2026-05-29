import { useState, useEffect, useRef } from "react";

const OPERATORS = ["AND", "OR", "NOT", "IF→THEN", "XOR"];

const PRESETS = [
  {
    label: "Decisión de Inversión",
    propositions: [
      { id: "p1", label: "El mercado está estable", value: true },
      { id: "p2", label: "Tengo capital disponible", value: false },
      { id: "p3", label: "El riesgo es bajo", value: true },
      { id: "p4", label: "Hay potencial de ganancia", value: true },
    ],
    rules: [
      { a: "p1", op: "AND", b: "p2", id: "r1" },
      { a: "r1", op: "AND", b: "p3", id: "r2" },
      { a: "r2", op: "OR", b: "p4", id: "r3" },
    ],
    suggestions: {
      true: ["✅ Proceder con la inversión", "📊 Diversificar el portafolio", "💼 Consultar a un asesor financiero"],
      false: ["⏳ Esperar mejores condiciones", "🔍 Analizar alternativas de bajo riesgo", "💰 Acumular capital primero"],
    },
  },
  {
    label: "Contratación de Personal",
    propositions: [
      { id: "p1", label: "Tiene experiencia relevante", value: true },
      { id: "p2", label: "Aprobó las pruebas técnicas", value: true },
      { id: "p3", label: "Encaja con la cultura", value: false },
      { id: "p4", label: "El salario es competitivo", value: true },
    ],
    rules: [
      { a: "p1", op: "AND", b: "p2", id: "r1" },
      { a: "p3", op: "AND", b: "p4", id: "r2" },
      { a: "r1", op: "OR", b: "r2", id: "r3" },
    ],
    suggestions: {
      true: ["✅ Enviar oferta de trabajo", "📝 Preparar contrato", "🎯 Asignar mentor de onboarding"],
      false: ["🔄 Continuar búsqueda", "📋 Revisar perfil del cargo", "🏫 Considerar candidatos con formación adicional"],
    },
  },
  {
    label: "Lanzamiento de Producto",
    propositions: [
      { id: "p1", label: "El producto está terminado", value: true },
      { id: "p2", label: "El mercado está listo", value: true },
      { id: "p3", label: "El presupuesto está aprobado", value: false },
      { id: "p4", label: "El equipo está capacitado", value: true },
    ],
    rules: [
      { a: "p1", op: "AND", b: "p2", id: "r1" },
      { a: "p3", op: "AND", b: "p4", id: "r2" },
      { a: "r1", op: "AND", b: "r2", id: "r3" },
    ],
    suggestions: {
      true: ["🚀 Lanzar al mercado", "📢 Activar campaña de marketing", "📦 Coordinar logística de distribución"],
      false: ["⚙️ Completar fases pendientes", "💰 Gestionar aprobación de presupuesto", "📅 Reprogramar fecha de lanzamiento"],
    },
  },
];

function evaluate(rules, props, targetId) {
  const vals = {};
  props.forEach((p) => (vals[p.id] = p.value));
  
  const evalNode = (id) => {
    if (id in vals) return vals[id];
    const rule = rules.find((r) => r.id === id);
    if (!rule) return false;
    const a = evalNode(rule.a);
    const b = rule.b ? evalNode(rule.b) : null;
    switch (rule.op) {
      case "AND": return a && b;
      case "OR": return a || b;
      case "NOT": return !a;
      case "XOR": return (a || b) && !(a && b);
      case "IF→THEN": return !a || b;
      default: return false;
    }
  };

  if (!targetId) return false;
  return evalNode(targetId);
}

function LogicGateIcon({ op }) {
  const colors = {
    AND: "#00f5d4", OR: "#f72585", NOT: "#ff9f1c",
    "IF→THEN": "#7b2ff7", XOR: "#4cc9f0",
  };
  return (
    <span style={{
      background: colors[op] || "#555",
      color: "#000",
      fontWeight: 900,
      fontSize: "0.6rem",
      padding: "2px 6px",
      borderRadius: 4,
      letterSpacing: 1,
    }}>{op}</span>
  );
}

function NodeTree({ rules, props, level = 0, nodeId }) {
  const rule = rules.find((r) => r.id === nodeId);
  const prop = props.find((p) => p.id === nodeId);
  
  if (prop) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: level * 20 }}>
        <span style={{
          width: 10, height: 10, borderRadius: "50%",
          background: prop.value ? "#00f5d4" : "#f72585",
          boxShadow: prop.value ? "0 0 8px #00f5d4" : "0 0 8px #f72585",
          flexShrink: 0,
        }} />
        <span style={{ fontSize: "0.78rem", color: "#ccc" }}>{prop.label}</span>
        <span style={{ fontSize: "0.7rem", color: prop.value ? "#00f5d4" : "#f72585", fontWeight: 700 }}>
          {prop.value ? "V" : "F"}
        </span>
      </div>
    );
  }
  
  if (!rule) return null;
  
  return (
    <div style={{ paddingLeft: level * 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: "#333", flexShrink: 0, border: "1px solid #555" }} />
        <LogicGateIcon op={rule.op} />
      </div>
      <NodeTree rules={rules} props={props} level={level + 1} nodeId={rule.a} />
      {rule.b && <NodeTree rules={rules} props={props} level={level + 1} nodeId={rule.b} />}
    </div>
  );
}

export default function App() {
  const [activePreset, setActivePreset] = useState(0);
  const [propositions, setPropositions] = useState(PRESETS[0].propositions);
  const [rules, setRules] = useState(PRESETS[0].rules);
  const [suggestions, setSuggestions] = useState(PRESETS[0].suggestions);
  const [customMode, setCustomMode] = useState(false);
  const [newPropLabel, setNewPropLabel] = useState("");
  const [newRule, setNewRule] = useState({ a: "", op: "AND", b: "" });
  const [showTree, setShowTree] = useState(false);
  const [animResult, setAnimResult] = useState(false);
  const [tab, setTab] = useState("builder");

  const finalRuleId = rules.length > 0 ? rules[rules.length - 1].id : null;
  const result = finalRuleId ? evaluate(rules, propositions, finalRuleId) : null;

  useEffect(() => {
    setAnimResult(false);
    const t = setTimeout(() => setAnimResult(true), 100);
    return () => clearTimeout(t);
  }, [result, propositions]);

  const loadPreset = (idx) => {
    setActivePreset(idx);
    setPropositions(PRESETS[idx].propositions);
    setRules(PRESETS[idx].rules);
    setSuggestions(PRESETS[idx].suggestions);
    setCustomMode(false);
  };

  const toggleProp = (id) => {
    setPropositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value: !p.value } : p))
    );
  };

  const addProp = () => {
    if (!newPropLabel.trim()) return;
    const id = `p${propositions.length + 1}`;
    setPropositions((prev) => [...prev, { id, label: newPropLabel, value: false }]);
    setNewPropLabel("");
  };

  const addRule = () => {
    if (!newRule.a) return;
    const id = `r${rules.length + 1}`;
    setRules((prev) => [...prev, { ...newRule, id }]);
    setNewRule({ a: "", op: "AND", b: "" });
  };

  const allNodes = [
    ...propositions.map((p) => ({ id: p.id, label: p.label })),
    ...rules.map((r) => ({ id: r.id, label: `Regla ${r.id}` })),
  ];

  const resultSuggestions = result !== null ? (result ? suggestions.true : suggestions.false) : [];

  const colors = {
    bg: "#080b14",
    panel: "#0d1220",
    border: "#1e2a3d",
    accent1: "#00f5d4",
    accent2: "#f72585",
    accent3: "#7b2ff7",
    text: "#e8eaf0",
    muted: "#6b7a99",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.bg,
      fontFamily: "'Courier New', monospace",
      color: colors.text,
      padding: "0 0 60px",
      backgroundImage: `radial-gradient(ellipse at 20% 10%, rgba(123,47,247,0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 90%, rgba(0,245,212,0.06) 0%, transparent 50%)`,
    }}>
      {/* HEADER */}
      <div style={{
        borderBottom: `1px solid ${colors.border}`,
        padding: "20px 28px",
        background: "rgba(13,18,32,0.95)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: `linear-gradient(135deg, ${colors.accent3}, ${colors.accent1})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem", flexShrink: 0,
        }}>⊕</div>
        <div>
          <div style={{ fontSize: "0.65rem", letterSpacing: 4, color: colors.muted, textTransform: "uppercase" }}>
            Sistema de
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: 2, color: colors.accent1, lineHeight: 1.1 }}>
            TOMA DE DECISIONES
          </div>
          <div style={{ fontSize: "0.6rem", color: colors.muted, letterSpacing: 3 }}>
            PROPOSICIONES LÓGICAS · SUGERENCIAS MÚLTIPLES
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["builder", "árbol", "API"].map((t) => (
            <button key={t} onClick={() => { setTab(t); if (t === "árbol") setShowTree(true); }}
              style={{
                padding: "6px 14px", borderRadius: 6, border: `1px solid ${tab === t ? colors.accent1 : colors.border}`,
                background: tab === t ? `${colors.accent1}18` : "transparent",
                color: tab === t ? colors.accent1 : colors.muted,
                fontSize: "0.72rem", cursor: "pointer", letterSpacing: 1, fontFamily: "inherit",
              }}>{t.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        {/* PRESETS */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: "0.6rem", color: colors.muted, letterSpacing: 3, marginBottom: 10 }}>
            ESCENARIOS PREDEFINIDOS
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => loadPreset(i)}
                style={{
                  padding: "8px 16px", borderRadius: 8,
                  border: `1px solid ${activePreset === i && !customMode ? colors.accent3 : colors.border}`,
                  background: activePreset === i && !customMode ? `${colors.accent3}20` : "transparent",
                  color: activePreset === i && !customMode ? colors.text : colors.muted,
                  fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s",
                }}>{p.label}</button>
            ))}
            <button onClick={() => setCustomMode(true)}
              style={{
                padding: "8px 16px", borderRadius: 8,
                border: `1px dashed ${customMode ? colors.accent1 : colors.border}`,
                background: customMode ? `${colors.accent1}10` : "transparent",
                color: customMode ? colors.accent1 : colors.muted,
                fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit",
              }}>+ Personalizado</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* LEFT: PROPOSICIONES */}
          <div>
            <div style={{
              background: colors.panel,
              border: `1px solid ${colors.border}`,
              borderRadius: 12, overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 18px", borderBottom: `1px solid ${colors.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: "0.65rem", letterSpacing: 3, color: colors.muted }}>PROPOSICIONES</span>
                <span style={{ fontSize: "0.7rem", color: colors.accent3 }}>{propositions.length} vars</span>
              </div>
              <div style={{ padding: "14px 18px" }}>
                {propositions.map((p) => (
                  <div key={p.id} onClick={() => toggleProp(p.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                      marginBottom: 8,
                      border: `1px solid ${p.value ? `${colors.accent1}40` : `${colors.accent2}30`}`,
                      background: p.value ? `${colors.accent1}08` : `${colors.accent2}06`,
                      transition: "all 0.2s",
                    }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4,
                      border: `2px solid ${p.value ? colors.accent1 : colors.accent2}`,
                      background: p.value ? `${colors.accent1}30` : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.2s",
                      boxShadow: p.value ? `0 0 10px ${colors.accent1}60` : "none",
                    }}>
                      {p.value && <span style={{ fontSize: "0.65rem", color: colors.accent1, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{
                      fontSize: "0.78rem", flex: 1,
                      color: p.value ? colors.text : colors.muted,
                    }}>{p.label}</span>
                    <span style={{
                      fontSize: "0.7rem", fontWeight: 900,
                      color: p.value ? colors.accent1 : colors.accent2,
                      minWidth: 16,
                    }}>{p.value ? "V" : "F"}</span>
                  </div>
                ))}

                {customMode && (
                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <input value={newPropLabel} onChange={(e) => setNewPropLabel(e.target.value)}
                      placeholder="Nueva proposición..."
                      style={{
                        flex: 1, padding: "8px 10px", background: "#111827",
                        border: `1px solid ${colors.border}`, borderRadius: 6,
                        color: colors.text, fontSize: "0.75rem", fontFamily: "inherit",
                        outline: "none",
                      }} />
                    <button onClick={addProp} style={{
                      padding: "8px 14px", background: colors.accent3, border: "none",
                      borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: "0.75rem",
                    }}>+</button>
                  </div>
                )}
              </div>
            </div>

            {/* REGLAS */}
            <div style={{
              background: colors.panel,
              border: `1px solid ${colors.border}`,
              borderRadius: 12, overflow: "hidden", marginTop: 16,
            }}>
              <div style={{
                padding: "14px 18px", borderBottom: `1px solid ${colors.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: "0.65rem", letterSpacing: 3, color: colors.muted }}>REGLAS LÓGICAS</span>
                <span style={{ fontSize: "0.7rem", color: colors.accent3 }}>{rules.length} reglas</span>
              </div>
              <div style={{ padding: "14px 18px" }}>
                {rules.map((r, i) => {
                  const rVal = evaluate(rules.slice(0, i + 1), propositions, r.id);
                  const aProp = propositions.find((p) => p.id === r.a);
                  const aRule = rules.find((rl) => rl.id === r.a);
                  const bProp = r.b ? propositions.find((p) => p.id === r.b) : null;
                  const bRule = r.b ? rules.find((rl) => rl.id === r.b) : null;
                  const aLabel = aProp?.label || (aRule ? `(${r.a})` : r.a);
                  const bLabel = bProp?.label || (bRule ? `(${r.b})` : r.b);

                  return (
                    <div key={r.id} style={{
                      padding: "10px 12px", borderRadius: 8, marginBottom: 8,
                      border: `1px solid ${rVal ? `${colors.accent1}30` : `${colors.accent2}25`}`,
                      background: rVal ? `${colors.accent1}06` : `${colors.accent2}04`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.65rem", color: colors.muted }}>{r.id}:</span>
                        <span style={{ fontSize: "0.7rem", color: colors.text, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{aLabel}</span>
                        <LogicGateIcon op={r.op} />
                        {bLabel && <span style={{ fontSize: "0.7rem", color: colors.text, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bLabel}</span>}
                        <span style={{ marginLeft: "auto", fontSize: "0.7rem", fontWeight: 900, color: rVal ? colors.accent1 : colors.accent2 }}>
                          {rVal ? "V" : "F"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {customMode && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <select value={newRule.a} onChange={(e) => setNewRule((r) => ({ ...r, a: e.target.value }))}
                        style={{ flex: 1, minWidth: 80, padding: "6px 8px", background: "#111827", border: `1px solid ${colors.border}`, borderRadius: 6, color: colors.text, fontSize: "0.72rem", fontFamily: "inherit" }}>
                        <option value="">Nodo A</option>
                        {allNodes.map((n) => <option key={n.id} value={n.id}>{n.id}: {n.label.slice(0, 20)}</option>)}
                      </select>
                      <select value={newRule.op} onChange={(e) => setNewRule((r) => ({ ...r, op: e.target.value }))}
                        style={{ padding: "6px 8px", background: "#111827", border: `1px solid ${colors.border}`, borderRadius: 6, color: colors.text, fontSize: "0.72rem", fontFamily: "inherit" }}>
                        {OPERATORS.map((op) => <option key={op}>{op}</option>)}
                      </select>
                      <select value={newRule.b} onChange={(e) => setNewRule((r) => ({ ...r, b: e.target.value }))}
                        style={{ flex: 1, minWidth: 80, padding: "6px 8px", background: "#111827", border: `1px solid ${colors.border}`, borderRadius: 6, color: colors.text, fontSize: "0.72rem", fontFamily: "inherit" }}>
                        <option value="">Nodo B</option>
                        {allNodes.map((n) => <option key={n.id} value={n.id}>{n.id}: {n.label.slice(0, 20)}</option>)}
                      </select>
                      <button onClick={addRule} style={{
                        padding: "6px 14px", background: colors.accent3, border: "none",
                        borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: "0.75rem",
                      }}>+</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: RESULTADO Y SUGERENCIAS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* RESULTADO */}
            <div style={{
              background: colors.panel,
              border: `2px solid ${result === null ? colors.border : result ? colors.accent1 : colors.accent2}`,
              borderRadius: 12, padding: "24px",
              textAlign: "center",
              transition: "border-color 0.4s",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0, opacity: 0.06,
                background: result === null ? "none" : result
                  ? `radial-gradient(circle at 50% 50%, ${colors.accent1}, transparent 70%)`
                  : `radial-gradient(circle at 50% 50%, ${colors.accent2}, transparent 70%)`,
                transition: "background 0.4s",
              }} />
              <div style={{ fontSize: "0.6rem", letterSpacing: 4, color: colors.muted, marginBottom: 16 }}>
                RESULTADO DE EVALUACIÓN
              </div>
              {result === null ? (
                <div style={{ color: colors.muted, fontSize: "0.85rem" }}>Sin reglas definidas</div>
              ) : (
                <>
                  <div style={{
                    fontSize: "5rem", fontWeight: 900, lineHeight: 1,
                    color: result ? colors.accent1 : colors.accent2,
                    textShadow: `0 0 40px ${result ? colors.accent1 : colors.accent2}`,
                    opacity: animResult ? 1 : 0,
                    transform: animResult ? "scale(1)" : "scale(0.7)",
                    transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                  }}>
                    {result ? "V" : "F"}
                  </div>
                  <div style={{
                    marginTop: 10, fontSize: "0.85rem",
                    color: result ? colors.accent1 : colors.accent2,
                    fontWeight: 700, letterSpacing: 2,
                    opacity: animResult ? 1 : 0,
                    transition: "opacity 0.4s 0.15s",
                  }}>
                    {result ? "VERDADERO — DECISIÓN POSITIVA" : "FALSO — DECISIÓN NEGATIVA"}
                  </div>
                  <div style={{ marginTop: 8, fontSize: "0.7rem", color: colors.muted }}>
                    Última regla evaluada: <strong>{finalRuleId}</strong>
                  </div>
                </>
              )}
            </div>

            {/* TABLA DE VERDAD MINI */}
            <div style={{
              background: colors.panel,
              border: `1px solid ${colors.border}`,
              borderRadius: 12, overflow: "hidden",
            }}>
              <div style={{ padding: "12px 18px", borderBottom: `1px solid ${colors.border}` }}>
                <span style={{ fontSize: "0.65rem", letterSpacing: 3, color: colors.muted }}>TABLA DE EVALUACIÓN</span>
              </div>
              <div style={{ padding: "12px 18px", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem" }}>
                  <thead>
                    <tr>
                      {propositions.map((p) => (
                        <th key={p.id} style={{ padding: "4px 8px", color: colors.muted, fontWeight: 400, textAlign: "center", borderBottom: `1px solid ${colors.border}` }}>
                          {p.id}
                        </th>
                      ))}
                      <th style={{ padding: "4px 8px", color: colors.accent3, textAlign: "center", borderBottom: `1px solid ${colors.border}` }}>
                        RESULTADO
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Show current state */}
                    <tr>
                      {propositions.map((p) => (
                        <td key={p.id} style={{ padding: "6px 8px", textAlign: "center" }}>
                          <span style={{ color: p.value ? colors.accent1 : colors.accent2, fontWeight: 700 }}>
                            {p.value ? "V" : "F"}
                          </span>
                        </td>
                      ))}
                      <td style={{ padding: "6px 8px", textAlign: "center" }}>
                        <span style={{ color: result ? colors.accent1 : colors.accent2, fontWeight: 700 }}>
                          {result !== null ? (result ? "V" : "F") : "–"}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={propositions.length + 1} style={{ padding: "4px 8px", textAlign: "center", color: colors.muted, fontSize: "0.65rem" }}>
                        ↑ Estado actual (haz clic en proposiciones para cambiar)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SUGERENCIAS */}
            <div style={{
              background: colors.panel,
              border: `1px solid ${colors.border}`,
              borderRadius: 12, overflow: "hidden", flex: 1,
            }}>
              <div style={{
                padding: "14px 18px", borderBottom: `1px solid ${colors.border}`,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: "0.65rem", letterSpacing: 3, color: colors.muted }}>SUGERENCIAS</span>
                {result !== null && (
                  <span style={{
                    fontSize: "0.6rem", padding: "2px 8px", borderRadius: 10,
                    background: result ? `${colors.accent1}20` : `${colors.accent2}20`,
                    color: result ? colors.accent1 : colors.accent2,
                    border: `1px solid ${result ? colors.accent1 : colors.accent2}40`,
                  }}>
                    {result ? "Camino positivo" : "Camino alternativo"}
                  </span>
                )}
              </div>
              <div style={{ padding: "14px 18px" }}>
                {resultSuggestions.map((s, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "12px 14px", borderRadius: 8, marginBottom: 8,
                    border: `1px solid ${colors.border}`,
                    background: `rgba(255,255,255,0.02)`,
                    opacity: animResult ? 1 : 0,
                    transform: animResult ? "translateX(0)" : "translateX(-10px)",
                    transition: `all 0.35s ${0.1 + i * 0.1}s`,
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      background: result ? `${colors.accent1}20` : `${colors.accent2}20`,
                      border: `1px solid ${result ? colors.accent1 : colors.accent2}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.65rem", color: result ? colors.accent1 : colors.accent2, fontWeight: 900,
                    }}>{i + 1}</div>
                    <span style={{ fontSize: "0.8rem", color: colors.text, lineHeight: 1.4 }}>{s}</span>
                  </div>
                ))}

                {customMode && (
                  <div style={{ marginTop: 12, fontSize: "0.7rem", color: colors.muted }}>
                    <div style={{ marginBottom: 8 }}>Sugerencias para resultado VERDADERO:</div>
                    {suggestions.true.map((s, i) => (
                      <input key={i} defaultValue={s}
                        onChange={(e) => setSuggestions((prev) => ({ ...prev, true: prev.true.map((v, j) => j === i ? e.target.value : v) }))}
                        style={{ width: "100%", padding: "6px 10px", background: "#111827", border: `1px solid ${colors.border}`, borderRadius: 6, color: colors.text, fontSize: "0.72rem", fontFamily: "inherit", marginBottom: 6 }} />
                    ))}
                    <div style={{ margin: "8px 0" }}>Sugerencias para resultado FALSO:</div>
                    {suggestions.false.map((s, i) => (
                      <input key={i} defaultValue={s}
                        onChange={(e) => setSuggestions((prev) => ({ ...prev, false: prev.false.map((v, j) => j === i ? e.target.value : v) }))}
                        style={{ width: "100%", padding: "6px 10px", background: "#111827", border: `1px solid ${colors.border}`, borderRadius: 6, color: colors.text, fontSize: "0.72rem", fontFamily: "inherit", marginBottom: 6 }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ÁRBOL LÓGICO */}
        {tab === "árbol" && (
          <div style={{
            marginTop: 24, background: colors.panel,
            border: `1px solid ${colors.border}`,
            borderRadius: 12, overflow: "hidden",
          }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ fontSize: "0.65rem", letterSpacing: 3, color: colors.muted }}>ÁRBOL DE EVALUACIÓN LÓGICA</span>
            </div>
            <div style={{ padding: "20px 24px" }}>
              {finalRuleId ? (
                <NodeTree rules={rules} props={propositions} nodeId={finalRuleId} />
              ) : (
                <div style={{ color: colors.muted, fontSize: "0.8rem" }}>Sin reglas definidas</div>
              )}
            </div>
          </div>
        )}

        {/* OPERADORES REFERENCIA */}
        <div style={{
          marginTop: 24, background: colors.panel,
          border: `1px solid ${colors.border}`,
          borderRadius: 12, padding: "16px 20px",
        }}>
          <div style={{ fontSize: "0.6rem", letterSpacing: 3, color: colors.muted, marginBottom: 12 }}>
            REFERENCIA DE OPERADORES LÓGICOS
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { op: "AND", desc: "Conjunción: ambos verdaderos", truth: "V∧V=V, V∧F=F" },
              { op: "OR", desc: "Disyunción: al menos uno verdadero", truth: "V∨F=V, F∨F=F" },
              { op: "NOT", desc: "Negación: invierte el valor", truth: "¬V=F, ¬F=V" },
              { op: "IF→THEN", desc: "Implicación: si A entonces B", truth: "V→F=F, otros=V" },
              { op: "XOR", desc: "Disyunción exclusiva: exactamente uno", truth: "V⊕V=F, V⊕F=V" },
            ].map(({ op, desc, truth }) => (
              <div key={op} style={{
                padding: "10px 14px", borderRadius: 8, flex: 1, minWidth: 140,
                border: `1px solid ${colors.border}`, background: "rgba(255,255,255,0.01)",
              }}>
                <div style={{ marginBottom: 6 }}><LogicGateIcon op={op} /></div>
                <div style={{ fontSize: "0.72rem", color: colors.text, marginBottom: 4 }}>{desc}</div>
                <div style={{ fontSize: "0.62rem", color: colors.muted, fontFamily: "monospace" }}>{truth}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
