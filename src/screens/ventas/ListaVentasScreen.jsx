import { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { ventasService } from '../../api/services/ventasService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { toast } from 'react-toastify';
import DetalleVentaModal from '../../components/ventas/DetalleVentaModal';

const COLORES_ESTADO = {
  COMPLETADA: { bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "rgba(16,185,129,0.2)", dot: "#10b981" },
  EN_PROCESO: { bg: "rgba(245,158,11,0.1)", color: "#d97706", border: "rgba(245,158,11,0.2)", dot: "#f59e0b" },
  PENDIENTE:  { bg: "rgba(99,102,241,0.1)", color: "#6366f1", border: "rgba(99,102,241,0.1)", dot: "#6366f1" },
  CANCELADA:  { bg: "rgba(239,68,68,0.08)", color: "#ef4444", border: "rgba(239,68,68,0.15)", dot: "#ef4444" },
  DEVUELTA:   { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "rgba(139,92,246,0.2)", dot: "#8b5cf6" },
};

const MONEDA_FLAGS = { COP: "🇨🇴", USD: "🇺🇸", VES: "🇻🇪" };

const ListaVentasScreen = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [filtros, setFiltros] = useState({ estado_venta: '', fecha_inicio: '', fecha_fin: '' });
  const [filtroActivo, setFiltroActivo] = useState('');

  useEffect(() => { loadVentas(); }, []);

  const loadVentas = async (filtrosParam) => {
    try {
      setLoading(true);
      const f = filtrosParam !== undefined ? filtrosParam : filtros;
      const params = {};
      if (f.estado_venta) params.estado_venta = f.estado_venta;
      if (f.fecha_inicio) params.fecha_inicio = f.fecha_inicio;
      if (f.fecha_fin) params.fecha_fin = f.fecha_fin;
      const response = await ventasService.getAll(params);
      if (response.data.success) setVentas(response.data.data || []);
    } catch (error) {
      toast.error('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (venta) => {
    setVentaSeleccionada(venta.id_venta);
    setShowModal(true);
  };

  const handleFiltrarEstado = (estado) => {
    const nuevo = filtroActivo === estado ? '' : estado;
    setFiltroActivo(nuevo);
    const nuevos = { ...filtros, estado_venta: nuevo };
    setFiltros(nuevos);
    loadVentas(nuevos);
  };

  const handleFiltrarFechas = () => { loadVentas(); };

  const handleLimpiar = () => {
    const limpios = { estado_venta: '', fecha_inicio: '', fecha_fin: '' };
    setFiltros(limpios);
    setFiltroActivo('');
    loadVentas(limpios);
  };

  // Stats rápidos
  const stats = {
    total: ventas.length,
    completadas: ventas.filter(v => v.estado_venta === 'COMPLETADA').length,
    pendientes: ventas.filter(v => v.estado_venta === 'PENDIENTE').length,
    en_proceso: ventas.filter(v => v.estado_venta === 'EN_PROCESO').length,
  };

  return (
    <>
      <style>{`
        /* ===== LISTA VENTAS SCREEN ===== */
        .lv-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: fadeInUp 0.3s ease;
        }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

        /* Header */
        .lv-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .lv-title {
          font-family: 'Arial Black', sans-serif;
          font-weight: 800;
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          color: #1a1a1a;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lv-title-icon {
          width: 40px; height: 40px;
          background: #1a1a1a;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 1.1rem;
          box-shadow: 0 4px 16px rgba(255,204,0,0.4);
          flex-shrink: 0;
        }

        /* Stats cards */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .stat-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid rgba(255,204,0,0.1);
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.2s;
          cursor: pointer;
          touch-action: manipulation;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,204,0,0.2); }
        .stat-card.active { border-color: #1a1a1a; box-shadow: 0 4px 16px rgba(255,204,0,0.25); }
        .stat-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .stat-num {
          font-family: 'Arial Black', sans-serif;
          font-weight: 800;
          font-size: 1.4rem;
          color: #1a1a1a;
          line-height: 1;
        }
        .stat-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          line-height: 1.2;
        }

        /* Panel de filtros */
        .filtros-panel {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(255,204,0,0.1);
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .filtros-title {
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #888;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .filtros-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* Estado chips */
        .estado-chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          flex: 1;
        }
        .estado-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 999px;
          border: 1.5px solid transparent;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.2s;
          background: #f9f9f9;
          color: #444;
          touch-action: manipulation;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .estado-chip:hover { transform: translateY(-1px); }
        .estado-chip.active {
          color: #fff !important;
          background: linear-gradient(135deg, #FFCC00, #1a1a1a) !important;
          border-color: transparent !important;
          box-shadow: 0 4px 14px rgba(255,204,0,0.4);
        }
        .chip-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Inputs de fecha */
        .fecha-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .fecha-group {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .fecha-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #888;
        }
        .fecha-input {
          border: 1.5px solid rgba(255,204,0,0.2);
          border-radius: 9px;
          padding: 7px 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          color: #1a1a1a;
          background: #f9f9f9;
          outline: none;
          transition: border-color 0.2s;
          cursor: pointer;
        }
        .fecha-input:focus { border-color: #1a1a1a; background: #fff; }

        .filtrar-btn {
          background: #1a1a1a;
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 9px 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(255,204,0,0.4);
          transition: all 0.2s;
          touch-action: manipulation;
          white-space: nowrap;
        }
        .filtrar-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }

        .limpiar-btn {
          background: #f9f9f9;
          border: 1.5px solid rgba(255,204,0,0.2);
          border-radius: 10px;
          color: #1a1a1a;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 9px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          touch-action: manipulation;
          white-space: nowrap;
        }
        .limpiar-btn:hover { background: rgba(255,204,0,0.1); }

        /* Tabla/Cards de ventas */
        .ventas-panel {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(255,204,0,0.1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .ventas-panel-header {
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255,204,0,0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ventas-count {
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 0.82rem;
          color: #888;
        }
        .ventas-count span {
          color: #1a1a1a;
          font-family: 'Arial Black', sans-serif;
          font-size: 1rem;
        }

        /* Tabla desktop */
        .ventas-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'DM Sans', sans-serif;
        }
        .ventas-table thead th {
          background: #f9f9f9;
          padding: 10px 16px;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #888;
          border-bottom: 1px solid rgba(255,204,0,0.1);
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .ventas-table tbody tr {
          border-bottom: 1px solid rgba(0,0,0,0.04);
          transition: background 0.15s;
          cursor: pointer;
        }
        .ventas-table tbody tr:hover { background: #f9f9f9; }
        .ventas-table tbody tr:last-child { border-bottom: none; }
        .ventas-table tbody td {
          padding: 12px 16px;
          font-size: 0.875rem;
          color: #1a1a1a;
          vertical-align: middle;
        }

        .factura-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,204,0,0.1);
          color: #1a1a1a;
          border-radius: 8px;
          padding: 3px 10px;
          font-family: 'Arial Black', sans-serif;
          font-weight: 700;
          font-size: 0.78rem;
          white-space: nowrap;
        }

        .estado-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          white-space: nowrap;
          border: 1px solid;
        }
        .estado-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
        }

        .moneda-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 6px;
          background: #f9f9f9;
          color: #444;
          font-size: 0.75rem;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
        }

        .total-cell {
          font-family: 'Arial Black', sans-serif;
          font-weight: 800;
          font-size: 0.95rem;
          color: #1a1a1a;
        }

        .usuario-cell {
          font-size: 0.82rem;
          color: #444;
        }

        .ver-detail-btn {
          background: rgba(255,204,0,0.1);
          border: 1.5px solid rgba(255,204,0,0.25);
          border-radius: 9px;
          color: #1a1a1a;
          cursor: pointer;
          padding: 7px 14px;
          font-size: 0.78rem;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.15s;
          white-space: nowrap;
          touch-action: manipulation;
        }
        .ver-detail-btn:hover { background: rgba(255,204,0,0.2); border-color: #1a1a1a; transform: scale(1.03); }
        .ver-detail-btn:active { transform: scale(0.97); }

        /* Cards en móvil */
        .ventas-cards {
          display: none;
          flex-direction: column;
          gap: 0;
        }
        .venta-card {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          cursor: pointer;
          transition: background 0.15s;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .venta-card:hover, .venta-card:active { background: #f9f9f9; }
        .venta-card:last-child { border-bottom: none; }
        .venta-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }
        .venta-card-left { flex: 1; min-width: 0; }
        .venta-card-factura {
          font-family: 'Arial Black', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          color: #1a1a1a;
          margin-bottom: 3px;
        }
        .venta-card-cliente {
          font-weight: 600;
          font-size: 0.88rem;
          color: #1a1a1a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 2px;
        }
        .venta-card-fecha {
          font-size: 0.72rem;
          color: #888;
        }
        .venta-card-total {
          font-family: 'Arial Black', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          color: #1a1a1a;
          text-align: right;
          flex-shrink: 0;
        }
        .venta-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        /* Loading skeleton */
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 24px;
          text-align: center;
        }
        .empty-icon { font-size: 4rem; margin-bottom: 16px; opacity: 0.4; }
        .empty-title {
          font-family: 'Arial Black', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          color: #444;
          margin-bottom: 8px;
        }
        .empty-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          color: #ccc;
        }

        /* Responsive */
        @media (max-width: 767px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .ventas-table { display: none; }
          .ventas-cards { display: flex !important; }
          .filtros-row { flex-direction: column; align-items: stretch; }
          .fecha-wrap { flex-direction: column; align-items: stretch; }
          .fecha-input { width: 100%; }
          .estado-chips { justify-content: flex-start; }
          .filtrar-btn, .limpiar-btn { justify-content: center; }
        }

        @media (min-width: 768px) and (max-width: 991px) {
          .stats-row { grid-template-columns: repeat(4, 1fr); }
          .ventas-table td:nth-child(3), .ventas-table th:nth-child(3) { display: none; }
        }

        @media (max-width: 480px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .stat-card { padding: 12px; }
          .stat-num { font-size: 1.2rem; }
        }
      `}</style>

      <div className="lv-container">
        {/* Header */}
        <div className="lv-header">
          <h2 className="lv-title">
            <div className="lv-title-icon"><i className="bi bi-receipt-cutoff"></i></div>
            Lista de Ventas
          </h2>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#888" }}>
            {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="stats-row">
            {[
              { key: "", label: "Total", num: stats.total, icon: "📋", bg: "rgba(255,204,0,0.1)", iconColor: "#888" },
              { key: "COMPLETADA", label: "Completadas", num: stats.completadas, icon: "✅", bg: "rgba(16,185,129,0.08)", iconColor: "#10b981" },
              { key: "PENDIENTE", label: "Pendientes", num: stats.pendientes, icon: "⏳", bg: "rgba(99,102,241,0.1)", iconColor: "#6366f1" },
              { key: "EN_PROCESO", label: "En Proceso", num: stats.en_proceso, icon: "⚡", bg: "rgba(245,158,11,0.08)", iconColor: "#f59e0b" },
            ].map((s) => (
              <div
                key={s.key}
                className={`stat-card ${filtroActivo === s.key && s.key !== "" ? "active" : ""}`}
                onClick={() => s.key !== "" ? handleFiltrarEstado(s.key) : handleLimpiar()}
              >
                <div className="stat-icon" style={{ background: s.bg }}>
                  <span style={{ fontSize: "1.2rem" }}>{s.icon}</span>
                </div>
                <div>
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <div className="filtros-panel">
          <div className="filtros-title">
            <i className="bi bi-funnel-fill"></i>
            Filtros
          </div>
          <div className="filtros-row">
            <div className="estado-chips">
              {["PENDIENTE", "EN_PROCESO", "COMPLETADA", "CANCELADA", "DEVUELTA"].map((e) => {
                const col = COLORES_ESTADO[e] || {};
                return (
                  <button key={e} className={`estado-chip ${filtroActivo === e ? "active" : ""}`} onClick={() => handleFiltrarEstado(e)} style={filtroActivo !== e ? { borderColor: col.border, color: col.color, background: col.bg } : {}}>
                    <span className="chip-dot" style={{ background: col.dot || "#888" }}></span>
                    {e.replace("_", " ")}
                  </button>
                );
              })}
            </div>

            <div className="fecha-wrap">
              <div className="fecha-group">
                <div className="fecha-label">Desde</div>
                <input className="fecha-input" type="date" value={filtros.fecha_inicio} onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })} />
              </div>
              <div className="fecha-group">
                <div className="fecha-label">Hasta</div>
                <input className="fecha-input" type="date" value={filtros.fecha_fin} onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })} />
              </div>
              <button className="filtrar-btn" onClick={handleFiltrarFechas}>
                <i className="bi bi-search"></i>
                Buscar
              </button>
              {(filtros.fecha_inicio || filtros.fecha_fin || filtroActivo) && (
                <button className="limpiar-btn" onClick={handleLimpiar}>
                  <i className="bi bi-x-circle"></i>
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panel de ventas */}
        <div className="ventas-panel">
          <div className="ventas-panel-header">
            <div className="ventas-count">
              Mostrando <span>{ventas.length}</span> ventas
              {filtroActivo && <> con estado <span>{filtroActivo}</span></>}
            </div>
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#888", fontSize: "0.78rem" }}>
                <div style={{ width: 14, height: 14, border: "2px solid rgba(255,204,0,0.25)", borderTopColor: "#FFCC00", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}></div>
                Actualizando...
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ padding: "16px" }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,0.04)", alignItems: "center" }}>
                  <div className="skeleton" style={{ width: 90, height: 28 }}></div>
                  <div className="skeleton" style={{ width: 120, height: 18 }}></div>
                  <div className="skeleton" style={{ flex: 1, height: 18 }}></div>
                  <div className="skeleton" style={{ width: 80, height: 28 }}></div>
                  <div className="skeleton" style={{ width: 70, height: 28 }}></div>
                </div>
              ))}
            </div>
          ) : ventas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">☕</div>
              <div className="empty-title">No hay ventas{filtroActivo ? ` con estado "${filtroActivo}"` : ""}</div>
              <div className="empty-sub">{filtroActivo ? "Prueba con otro filtro" : "Las ventas aparecerán aquí"}</div>
            </div>
          ) : (
            <>
              {/* Tabla desktop */}
              <div style={{ overflowX: "auto" }}>
                <table className="ventas-table">
                  <thead>
                    <tr>
                      <th>Factura</th>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Cliente</th>
                      <th>Total</th>
                      <th>Moneda</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((venta) => {
                      const col = COLORES_ESTADO[venta.estado_venta] || { bg: "#f5f5f5", color: "#888", border: "rgba(0,0,0,0.1)", dot: "#888" };
                      return (
                        <tr key={venta.id_venta} onClick={() => handleVerDetalle(venta)}>
                          <td><span className="factura-chip"><i className="bi bi-receipt"></i>{venta.numero_factura}</span></td>
                          <td style={{ fontSize: "0.8rem", color: "#444", whiteSpace: "nowrap" }}>{formatDateTime(venta.fecha_venta)}</td>
                          <td className="usuario-cell">{venta.nombre_usuario || "—"}</td>
                          <td style={{ fontWeight: 600, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{venta.nombre_cliente || "Cliente General"}</td>
                          <td className="total-cell">{formatCurrency(venta.total, venta.codigo_moneda)}</td>
                          <td>
                            <span className="moneda-chip">
                              {MONEDA_FLAGS[venta.codigo_moneda] || ""} {venta.codigo_moneda}
                            </span>
                          </td>
                          <td>
                            <span className="estado-badge" style={{ background: col.bg, color: col.color, borderColor: col.border }}>
                              <span className="estado-badge-dot" style={{ background: col.dot }}></span>
                              {venta.estado_venta}
                            </span>
                          </td>
                          <td>
                            <button className="ver-detail-btn" onClick={(e) => { e.stopPropagation(); handleVerDetalle(venta); }}>
                              <i className="bi bi-eye-fill"></i> Ver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cards móvil */}
              <div className="ventas-cards">
                {ventas.map((venta) => {
                  const col = COLORES_ESTADO[venta.estado_venta] || { bg: "#f5f5f5", color: "#888", border: "rgba(0,0,0,0.1)", dot: "#888" };
                  return (
                    <div key={venta.id_venta} className="venta-card" onClick={() => handleVerDetalle(venta)}>
                      <div className="venta-card-top">
                        <div className="venta-card-left">
                          <div className="venta-card-factura">{venta.numero_factura}</div>
                          <div className="venta-card-cliente">{venta.nombre_cliente || "Cliente General"}</div>
                          <div className="venta-card-fecha">{formatDateTime(venta.fecha_venta)}</div>
                        </div>
                        <div>
                          <div className="venta-card-total">{formatCurrency(venta.total, venta.codigo_moneda)}</div>
                          <div style={{ textAlign: "right", marginTop: 3 }}>
                            <span className="moneda-chip">{MONEDA_FLAGS[venta.codigo_moneda] || ""} {venta.codigo_moneda}</span>
                          </div>
                        </div>
                      </div>
                      <div className="venta-card-bottom">
                        <span className="estado-badge" style={{ background: col.bg, color: col.color, borderColor: col.border }}>
                          <span className="estado-badge-dot" style={{ background: col.dot }}></span>
                          {venta.estado_venta}
                        </span>
                        {venta.nombre_usuario && (
                          <span style={{ fontSize: "0.72rem", color: "#888" }}>
                            <i className="bi bi-person me-1"></i>{venta.nombre_usuario}
                          </span>
                        )}
                        <button className="ver-detail-btn" onClick={(e) => { e.stopPropagation(); handleVerDetalle(venta); }}>
                          <i className="bi bi-eye-fill"></i> Ver
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <DetalleVentaModal
        show={showModal}
        onHide={() => { setShowModal(false); setVentaSeleccionada(null); }}
        ventaId={ventaSeleccionada}
        onStatusChange={() => { loadVentas(); setShowModal(false); setVentaSeleccionada(null); }}
      />
    </>
  );
};

export default ListaVentasScreen;