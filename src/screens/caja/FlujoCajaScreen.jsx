import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Table, Badge, Pagination } from 'react-bootstrap';
import { cajaService } from '../../api/services/cajaService';
import { ventasService } from '../../api/services/ventasService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { toast } from 'react-toastify';
import AbrirCajaModal from '../../components/caja/AbrirCajaModal';
import CerrarCajaModal from '../../components/caja/CerrarCajaModal';
import TransaccionModal from '../../components/caja/TransaccionModal';
import DetalleVentaModal from '../../components/ventas/DetalleVentaModal';

const VENTAS_POR_PAGINA = 15;
const num = (v) => parseFloat(v) || 0;

const getFechaLocal = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
};

const buildFiltroParams = (filtros) => {
  const params = {};
  if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
  if (filtros.fechaFin)    params.fechaFin    = filtros.fechaFin;
  return params;
};

/* ─── Genera rango de fechas entre dos strings YYYY-MM-DD ─── */
const generarRangoFechas = (inicio, fin) => {
  const fechas = [];
  const d = new Date(inicio + 'T00:00:00');
  const dFin = new Date(fin + 'T00:00:00');
  while (d <= dFin) {
    fechas.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return fechas;
};

/* ─── Agrupa ventas por fecha (YYYY-MM-DD) ─── */
const agruparVentasPorDia = (ventas) => {
  const map = {};
  ventas.forEach((v) => {
    const dia = (v.fecha_venta || '').slice(0, 10);
    if (!map[dia]) map[dia] = { ventas: [], total_usd: 0, total_ves: 0, total_cop: 0 };
    map[dia].ventas.push(v);
    if (v.codigo_moneda === 'USD') map[dia].total_usd += num(v.total);
    if (v.codigo_moneda === 'VES') map[dia].total_ves += num(v.total);
    if (v.codigo_moneda === 'COP') map[dia].total_cop += num(v.total);
  });
  return map;
};

/* ─── Modal detalle de cierre diario ─── */
const CierreDiaModal = ({ dia, ventasDia, onClose, onVerVenta, formatCurrency }) => {
  const [paginaModal, setPaginaModal] = useState(1);
  const POR_PAGINA = 10;
  const totalPags = Math.ceil(ventasDia.length / POR_PAGINA);
  const ventasPag = ventasDia.slice((paginaModal - 1) * POR_PAGINA, paginaModal * POR_PAGINA);

  const totales = ventasDia.reduce(
    (acc, v) => {
      if (v.codigo_moneda === 'USD') acc.usd += num(v.total);
      if (v.codigo_moneda === 'VES') acc.ves += num(v.total);
      if (v.codigo_moneda === 'COP') acc.cop += num(v.total);
      return acc;
    },
    { usd: 0, ves: 0, cop: 0 }
  );

  const colorEstado = { COMPLETADA: '#16a34a', PENDIENTE: '#f59e0b', EN_PROCESO: '#0284c7', CANCELADA: '#dc2626' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1055,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      animation: 'fadeOverlay 0.2s ease',
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, width: '92%', maxWidth: 820,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
        animation: 'slideModal 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        overflow: 'hidden',
      }}>

        {/* Header del modal */}
        <div style={{
          background: '#1a1a1a', padding: '18px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '2px solid #FFD700', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,215,0,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
              Cierre del día
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: '#fff', letterSpacing: '0.05em', lineHeight: 1 }}>
              {new Date(dia + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 10, width: 36, height: 36, color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,215,0,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <i className="bi bi-x" />
          </button>
        </div>

        {/* Tarjetas de totales */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fafafa', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Total USD', valor: totales.usd, moneda: 'USD', color: '#16a34a', bg: 'rgba(22,163,74,0.08)', icon: 'bi-currency-dollar' },
              { label: 'Total Bolívares', valor: totales.ves, moneda: 'VES', color: '#0284c7', bg: 'rgba(2,132,199,0.08)', icon: 'bi-cash-coin' },
              { label: 'Total Pesos', valor: totales.cop, moneda: 'COP', color: '#b45309', bg: 'rgba(180,83,9,0.08)', icon: 'bi-cash' },
              { label: 'Ventas', valor: null, extra: `${ventasDia.length} ventas`, color: '#1a1a1a', bg: 'rgba(255,215,0,0.1)', icon: 'bi-receipt' },
            ].map((item, i) => (
              <div key={i} style={{
                flex: '1 1 140px', background: item.bg, borderRadius: 12,
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: item.color + '18', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: item.color, fontSize: '1.1rem', flexShrink: 0,
                }}>
                  <i className={`bi ${item.icon}`} />
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: item.color, letterSpacing: '0.04em', lineHeight: 1.2 }}>
                    {item.valor !== null ? formatCurrency(item.valor, item.moneda) : item.extra}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla de ventas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          <Table style={{ margin: 0, fontSize: '0.85rem' }}>
            <thead>
              <tr>
                {['Factura', 'Hora', 'Cliente', 'Moneda', 'Total', 'Estado', ''].map((h, i) => (
                  <th key={i} style={{
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.07em', color: '#888', background: '#f9f9f9',
                    padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)',
                    position: 'sticky', top: 0, zIndex: 1, textAlign: i === 6 ? 'center' : 'left',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventasPag.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#aaa' }}>
                    <i className="bi bi-inbox me-2" />Sin ventas
                  </td>
                </tr>
              ) : ventasPag.map((venta) => (
                <tr key={venta.id_venta} style={{ borderTop: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,215,0,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                  onClick={() => onVerVenta(venta.id_venta)}
                >
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', background: 'rgba(255,215,0,0.12)', borderRadius: 6, padding: '2px 8px', letterSpacing: '0.05em' }}>
                      {venta.numero_factura}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#888', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {new Date(venta.fecha_venta).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                    {venta.nombre_cliente || <span style={{ color: '#ccc' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: '#f0f0f0', color: '#444', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                      {venta.codigo_moneda}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: '#1a1a1a', letterSpacing: '0.03em' }}>
                    {formatCurrency(venta.total, venta.codigo_moneda)}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      background: (colorEstado[venta.estado_venta] || '#888') + '18',
                      color: colorEstado[venta.estado_venta] || '#888',
                      fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px',
                      borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {venta.estado_venta}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }} onClick={e => { e.stopPropagation(); onVerVenta(venta.id_venta); }}>
                    <button style={{
                      background: 'rgba(255,215,0,0.12)', border: '1.5px solid rgba(255,215,0,0.3)',
                      color: '#1a1a1a', borderRadius: 7, padding: '4px 12px',
                      fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,215,0,0.28)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,215,0,0.12)'}
                    >
                      <i className="bi bi-eye" /> Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Footer paginación */}
        {totalPags > 1 && (
          <div style={{ padding: '10px 24px', borderTop: '1px solid rgba(0,0,0,0.06)', background: '#f9f9f9', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            <Pagination size="sm" className="pf-pagination mb-0">
              <Pagination.Prev disabled={paginaModal === 1} onClick={() => setPaginaModal(p => p - 1)} />
              {Array.from({ length: totalPags }, (_, i) => (
                <Pagination.Item key={i + 1} active={paginaModal === i + 1} onClick={() => setPaginaModal(i + 1)}>{i + 1}</Pagination.Item>
              ))}
              <Pagination.Next disabled={paginaModal === totalPags} onClick={() => setPaginaModal(p => p + 1)} />
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════ */
const FlujoCajaScreen = () => {
  const [estadoCaja, setEstadoCaja]     = useState(null);
  const [flujo, setFlujo]               = useState([]);
  const [resumenVentas, setResumenVentas] = useState(null);
  const [todasLasVentas, setTodasLasVentas] = useState([]);
  const [historialArqueos, setHistorialArqueos] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [showAbrirModal, setShowAbrirModal] = useState(false);
  const [showCerrarModal, setShowCerrarModal] = useState(false);
  const [showTransaccionModal, setShowTransaccionModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ventaDetalleId, setVentaDetalleId] = useState(null);
  const [cierreDiaSeleccionado, setCierreDiaSeleccionado] = useState(null); // 'YYYY-MM-DD'
  const [filtros, setFiltros] = useState({ fechaInicio: getFechaLocal(), fechaFin: getFechaLocal() });

  /* vista activa: 'cierres' | 'movimientos' */
  const [vistaActiva, setVistaActiva] = useState('cierres');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const filtroParams = buildFiltroParams(filtros);
      const [estadoRes, flujoRes, resumenRes, historialRes] = await Promise.allSettled([
        cajaService.getEstado(),
        cajaService.getFlujo(filtroParams),
        cajaService.getResumenVentas(filtroParams),
        cajaService.getHistorial({ limit: 60 }),
      ]);
      if (estadoRes.status === 'fulfilled')
        setEstadoCaja(estadoRes.value.data?.data || estadoRes.value.data);
      if (flujoRes.status === 'fulfilled') {
        const d = flujoRes.value.data?.data || [];
        setFlujo(Array.isArray(d) ? d : []);
      } else setFlujo([]);
      if (resumenRes.status === 'fulfilled')
        setResumenVentas(resumenRes.value.data?.data || resumenRes.value.data);
      if (historialRes.status === 'fulfilled')
        setHistorialArqueos(historialRes.value.data?.data || historialRes.value.data || []);

      await loadTodasLasVentas();
    } catch (e) {
      toast.error('Error al cargar datos de caja');
    } finally {
      setLoading(false);
    }
  };

  const loadTodasLasVentas = async () => {
    try {
      setLoadingVentas(true);
      const params = {
        fecha_inicio: filtros.fechaInicio,
        fecha_fin: filtros.fechaFin + 'T23:59:59',
        limit: 500,
        offset: 0,
      };
      const res = await ventasService.getAll(params);
      const raw = res.data?.data || res.data || {};
      if (Array.isArray(raw)) setTodasLasVentas(raw);
      else setTodasLasVentas(raw.items || raw.ventas || raw.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVentas(false);
    }
  };

  const handleFiltrar = () => loadData();
  const handleVerDetalle = (id) => { setVentaDetalleId(id); setShowDetalleModal(true); };

  const calcularTotalesFlujo = () => {
    const t = {};
    if (Array.isArray(flujo)) {
      flujo.forEach(item => {
        const m = item.codigo_moneda;
        if (!t[m]) t[m] = 0;
        if (item.tipo_transaccion === 'INGRESO') t[m] += num(item.monto);
        else t[m] -= num(item.monto);
      });
    }
    return t;
  };

  const calcularTotalesVentas = () => {
    const t = {};
    const usd = num(resumenVentas?.total_usd_original);
    const ves = num(resumenVentas?.total_ves);
    const cop = num(resumenVentas?.total_cop);
    if (usd > 0) t['USD'] = usd;
    if (ves > 0) t['VES'] = ves;
    if (cop > 0) t['COP'] = cop;
    return t;
  };

  const totalesFlujo   = calcularTotalesFlujo();
  const totalesVentas  = calcularTotalesVentas();
  const cajaAbierta    = estadoCaja?.estado === 'ABIERTA' || estadoCaja?.abierta === true;

  /* ── Construir tabla de cierres diarios ── */
  const ventasPorDia   = agruparVentasPorDia(todasLasVentas);
  const rangoFechas    = filtros.fechaInicio && filtros.fechaFin
    ? generarRangoFechas(filtros.fechaInicio, filtros.fechaFin).reverse()
    : Object.keys(ventasPorDia).sort().reverse();

  /* ── Arqueos agrupados por fecha para mostrar cierre oficial ── */
  const arqueosPorDia = {};
  historialArqueos.forEach(a => {
    const dia = (a.fecha_cierre || a.fecha_apertura || '').slice(0, 10);
    if (!arqueosPorDia[dia]) arqueosPorDia[dia] = [];
    arqueosPorDia[dia].push(a);
  });

  /* ── Estilos de botones ── */
  const btn = (bg, color, shadow) => ({
    background: bg, border: 'none', color,
    fontWeight: 700, borderRadius: 8, padding: '0.55rem 1.2rem',
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'all 0.2s ease', fontSize: '0.875rem',
    boxShadow: shadow || 'none',
  });

  const statIconBox = (bg, color) => ({
    width: 48, height: 48, borderRadius: 12,
    background: bg, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '1.3rem', color, flexShrink: 0,
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(255,215,0,0.2)', borderTopColor: '#FFD700', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#888', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, margin: 0 }}>Cargando caja...</p>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes fadeOverlay { from { opacity:0; } to { opacity:1; } }
        @keyframes slideModal  { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes slideUp     { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin        { to { transform:rotate(360deg); } }

        .pf-screen-title { font-family:'Bebas Neue',sans-serif; font-weight:400; font-size:1.8rem; color:#1a1a1a; margin:0; letter-spacing:0.04em; }
        .pf-screen-title i { color:#FFD700; }
        .pf-card { background:#fff; border:1.5px solid rgba(0,0,0,0.07) !important; border-radius:14px !important; box-shadow:0 2px 12px rgba(0,0,0,0.05) !important; }
        .pf-card-header { background:#fff !important; border-bottom:1px solid rgba(0,0,0,0.06) !important; padding:14px 20px !important; border-radius:14px 14px 0 0 !important; }
        .pf-card-header h5 { font-family:'Bebas Neue',sans-serif; font-weight:400; font-size:1.05rem; color:#1a1a1a; margin:0; letter-spacing:0.06em; }
        .pf-card-header h5 i { color:#FFD700; }

        .pf-table thead th { font-size:0.67rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#888; background:#f9f9f9; border:none; padding:11px 16px; position:sticky; top:0; z-index:1; }
        .pf-table tbody td { padding:12px 16px; vertical-align:middle; border-top:1px solid rgba(0,0,0,0.05); font-size:0.875rem; color:#1a1a1a; }
        .pf-table tbody tr { transition:background 0.15s; }
        .pf-table tbody tr:hover td { background:rgba(255,215,0,0.04); }
        .pf-table tfoot td { background:#f9f9f9; padding:11px 16px; border-top:2px solid rgba(0,0,0,0.07); }

        .pf-input:focus { border-color:#FFD700 !important; box-shadow:0 0 0 3px rgba(255,215,0,0.2) !important; outline:none; }
        .pf-spinner-sm { width:1rem; height:1rem; border-radius:50%; border:2px solid rgba(255,215,0,0.2); border-top-color:#FFD700; animation:spin 0.8s linear infinite; display:inline-block; vertical-align:middle; margin-right:6px; }
        .pf-stat-label { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#888; margin-bottom:4px; }
        .pf-stat-value { font-family:'Bebas Neue',sans-serif; font-weight:400; font-size:1.6rem; color:#1a1a1a; line-height:1.1; letter-spacing:0.02em; }
        .pf-stat-value.green { color:#16a34a; }
        .pf-stat-value.blue  { color:#0284c7; }
        .pf-stat-value.amber { color:#b45309; }

        .pf-caja-banner { border-radius:14px; padding:18px 22px; margin-bottom:24px; border-left:5px solid; }
        .pf-caja-banner.open   { background:rgba(22,163,74,0.06);  border-left-color:#16a34a; }
        .pf-caja-banner.closed { background:rgba(220,38,38,0.06);  border-left-color:#dc2626; }

        .pf-info-alert { background:rgba(255,215,0,0.08); border:1.5px solid rgba(255,215,0,0.25); border-radius:10px; padding:12px 16px; color:#1a1a1a; font-size:0.875rem; display:flex; align-items:center; gap:8px; }
        .pf-info-alert i { color:#FFD700; font-size:1.1rem; }

        /* Vista tabs */
        .pf-view-tabs { display:flex; background:rgba(255,215,0,0.1); border-radius:12px; padding:4px; gap:3px; }
        .pf-view-tab { padding:7px 18px; border-radius:9px; border:none; background:transparent; font-family:'DM Sans',sans-serif; font-weight:600; font-size:0.82rem; color:#888; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:6px; }
        .pf-view-tab.active { background:#1a1a1a; color:#FFD700; box-shadow:0 2px 8px rgba(0,0,0,0.2); }
        .pf-view-tab:not(.active):hover { color:#1a1a1a; background:rgba(255,215,0,0.15); }

        /* Tabla de cierres */
        .pf-cierre-row { cursor:pointer; transition:all 0.15s; }
        .pf-cierre-row:hover td { background:rgba(255,215,0,0.05) !important; }
        .pf-cierre-row.has-ventas td:first-child { border-left:3px solid #FFD700; }
        .pf-cierre-row.no-ventas { opacity:0.55; }
        .pf-cierre-row.no-ventas td:first-child { border-left:3px solid transparent; }

        .pf-btn-cierre { background:rgba(255,215,0,0.12); border:1.5px solid rgba(255,215,0,0.3); color:#1a1a1a; border-radius:8px; padding:5px 14px; font-size:0.78rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all 0.15s; white-space:nowrap; }
        .pf-btn-cierre:hover { background:rgba(255,215,0,0.28); border-color:#FFD700; transform:translateY(-1px); }
        .pf-btn-cierre:disabled { opacity:0.4; cursor:not-allowed; transform:none; }

        .pf-estado-cierre { font-size:0.68rem; font-weight:700; padding:3px 10px; border-radius:999px; text-transform:uppercase; letter-spacing:0.06em; display:inline-block; }
        .pf-estado-cierre.cerrada { background:rgba(220,38,38,0.1); color:#dc2626; }
        .pf-estado-cierre.abierta { background:rgba(22,163,74,0.1); color:#16a34a; }
        .pf-estado-cierre.sin-arqueo { background:#f0f0f0; color:#888; }

        .pf-moneda-num { font-family:'Bebas Neue',sans-serif; font-size:0.95rem; letter-spacing:0.03em; }
        .pf-moneda-tag { background:#f0f0f0; color:#555; font-size:0.67rem; font-weight:700; padding:2px 7px; border-radius:5px; margin-left:4px; vertical-align:middle; }

        .pf-factura { font-family:'Bebas Neue',sans-serif; font-size:0.85rem; color:#1a1a1a; background:rgba(255,215,0,0.12); border-radius:6px; padding:2px 8px; letter-spacing:0.05em; }
        .pf-ver-btn { background:rgba(255,215,0,0.12); border:1.5px solid rgba(255,215,0,0.3); color:#1a1a1a; border-radius:7px; padding:4px 12px; font-size:0.78rem; font-weight:700; cursor:pointer; transition:all 0.15s; display:inline-flex; align-items:center; gap:4px; }
        .pf-ver-btn:hover { background:rgba(255,215,0,0.28); border-color:#FFD700; }
        .pf-moneda-badge { background:#f0f0f0; color:#444; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:6px; display:inline-block; }

        /* Pagination */
        .pf-pagination .page-link { color:#1a1a1a; border-color:#ddd; font-size:0.8rem; }
        .pf-pagination .page-item.active .page-link { background:#1a1a1a; border-color:#1a1a1a; color:#FFD700; font-weight:700; }
        .pf-pagination .page-link:hover { background:rgba(255,215,0,0.12); border-color:#FFD700; color:#1a1a1a; }
        .pf-pagination .page-item.disabled .page-link { color:#ccc; }

        .pf-section-sep { font-family:'DM Sans',sans-serif; font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#aaa; margin-bottom:8px; padding-left:2px; }
        .pf-badge-count { background:#1a1a1a; color:#FFD700; font-weight:700; font-size:0.75rem; padding:3px 10px; border-radius:999px; display:inline-flex; align-items:center; }
      `}</style>

      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2" style={{ animation: 'slideUp 0.35s ease' }}>
        <h2 className="pf-screen-title">
          <i className="bi bi-cash-stack me-2" />
          Flujo de Caja
        </h2>
        <div className="d-flex gap-2 flex-wrap">
          {cajaAbierta ? (
            <>
              <button style={btn('transparent', '#1a1a1a')}
                onClick={() => setShowTransaccionModal(true)}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                className="border"
              >
                <i className="bi bi-plus-circle" /> Nueva Transacción
              </button>
              <button style={btn('#dc2626', '#fff')}
                onClick={() => setShowCerrarModal(true)}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >
                <i className="bi bi-lock" /> Cerrar Caja
              </button>
            </>
          ) : (
            <button style={btn('#16a34a', '#fff')}
              onClick={() => setShowAbrirModal(true)}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              <i className="bi bi-unlock" /> Abrir Caja
            </button>
          )}
        </div>
      </div>

      {/* ── Banner estado caja ── */}
      <div className={`pf-caja-banner ${cajaAbierta ? 'open' : 'closed'} mb-4`}>
        <Row className="align-items-center">
          <Col md={3}>
            <div className="pf-stat-label">Estado de Caja</div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: cajaAbierta ? '#16a34a' : '#dc2626',
              color: '#fff', borderRadius: 999, padding: '4px 16px',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', letterSpacing: '0.06em',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'inline-block' }} />
              {cajaAbierta ? 'ABIERTA' : 'CERRADA'}
            </span>
          </Col>
          {cajaAbierta && estadoCaja && (
            <>
              <Col md={3}>
                <div className="pf-stat-label">Apertura</div>
                <strong style={{ fontSize: '0.88rem' }}>{formatDateTime(estadoCaja.fecha_apertura)}</strong>
              </Col>
              <Col md={3}>
                <div className="pf-stat-label">Monto Inicial</div>
                <strong style={{ fontSize: '0.88rem' }}>
                  {num(estadoCaja.monto_inicial_cop) > 0 && <div>{formatCurrency(estadoCaja.monto_inicial_cop, 'COP')}</div>}
                  {num(estadoCaja.monto_inicial_usd) > 0 && <div>{formatCurrency(estadoCaja.monto_inicial_usd, 'USD')}</div>}
                  {num(estadoCaja.monto_inicial_ves) > 0 && <div>{formatCurrency(estadoCaja.monto_inicial_ves, 'VES')}</div>}
                </strong>
              </Col>
              <Col md={3}>
                {estadoCaja.ventas_dia && (
                  <div>
                    <div className="pf-stat-label">Ventas desde apertura</div>
                    <strong style={{ color: '#16a34a', fontSize: '0.88rem' }}>
                      {parseInt(estadoCaja.ventas_dia.total_ventas) || 0} ventas
                    </strong>
                    {num(estadoCaja.ventas_dia.total_cop) > 0 && <div style={{ fontSize: '0.8rem', color: '#444' }}>{formatCurrency(estadoCaja.ventas_dia.total_cop, 'COP')}</div>}
                    {num(estadoCaja.ventas_dia.total_usd_original) > 0 && <div style={{ fontSize: '0.8rem', color: '#444' }}>{formatCurrency(estadoCaja.ventas_dia.total_usd_original, 'USD')}</div>}
                    {num(estadoCaja.ventas_dia.total_ves) > 0 && <div style={{ fontSize: '0.8rem', color: '#444' }}>{formatCurrency(estadoCaja.ventas_dia.total_ves, 'VES')}</div>}
                  </div>
                )}
              </Col>
            </>
          )}
          {!cajaAbierta && (
            <Col md={9}>
              <div className="pf-info-alert">
                <i className="bi bi-info-circle" />
                No hay caja abierta. Abre una caja para comenzar a registrar transacciones.
              </div>
            </Col>
          )}
        </Row>
      </div>

      {/* ── Tarjetas resumen ── */}
      <div className="pf-section-sep">Resumen del período</div>
      <Row className="g-3 mb-4">
        {[
          { label: 'Ventas en USD', value: num(resumenVentas?.total_usd_original), moneda: 'USD', cls: 'green', icon: 'bi-currency-dollar', ibg: 'rgba(22,163,74,0.1)', ic: '#16a34a' },
          { label: 'Ventas en Bolívares', value: num(resumenVentas?.total_ves), moneda: 'VES', cls: 'blue', icon: 'bi-cash-coin', ibg: 'rgba(2,132,199,0.1)', ic: '#0284c7' },
          { label: 'Ventas en Pesos', value: num(resumenVentas?.total_cop), moneda: 'COP', cls: 'amber', icon: 'bi-cash', ibg: 'rgba(180,83,9,0.1)', ic: '#b45309', sub: resumenVentas?.total_ventas > 0 ? `${resumenVentas.total_ventas} ventas completadas` : null },
        ].map((s, i) => (
          <Col md={4} key={i}>
            <Card className="pf-card border-0 h-100">
              <Card.Body className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="pf-stat-label">{s.label}</div>
                  <div className={`pf-stat-value ${s.cls}`}>{formatCurrency(s.value, s.moneda)}</div>
                  {s.sub && <div style={{ color: '#888', fontSize: '0.75rem', marginTop: 4 }}>{s.sub}</div>}
                </div>
                <div style={statIconBox(s.ibg, s.ic)}><i className={`bi ${s.icon}`} /></div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Filtros ── */}
      <Card className="pf-card border-0 mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Fecha Inicio</Form.Label>
                <Form.Control className="pf-input" type="date" value={filtros.fechaInicio}
                  onChange={e => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                  style={{ borderColor: '#ddd', borderRadius: 8 }} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Fecha Fin</Form.Label>
                <Form.Control className="pf-input" type="date" value={filtros.fechaFin}
                  onChange={e => setFiltros({ ...filtros, fechaFin: e.target.value })}
                  style={{ borderColor: '#ddd', borderRadius: 8 }} />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <button
                style={{ ...btn('#FFD700', '#1a1a1a', '0 2px 8px rgba(255,215,0,0.3)'), width: '100%', justifyContent: 'center' }}
                onClick={handleFiltrar}
                onMouseEnter={e => e.currentTarget.style.background = '#FFE566'}
                onMouseLeave={e => e.currentTarget.style.background = '#FFD700'}
              >
                <i className="bi bi-funnel" /> Filtrar
              </button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ── Tabs de vista ── */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="pf-view-tabs">
          <button className={`pf-view-tab ${vistaActiva === 'cierres' ? 'active' : ''}`} onClick={() => setVistaActiva('cierres')}>
            <i className="bi bi-calendar3" /> Cierres por Día
          </button>
          <button className={`pf-view-tab ${vistaActiva === 'movimientos' ? 'active' : ''}`} onClick={() => setVistaActiva('movimientos')}>
            <i className="bi bi-arrow-left-right" /> Movimientos de Caja
          </button>
        </div>
        {vistaActiva === 'cierres' && (
          <span className="pf-badge-count">
            {rangoFechas.length} días · {todasLasVentas.length} ventas
          </span>
        )}
      </div>

      {/* ══════════════════════════════════════════
          VISTA: CIERRES POR DÍA
      ══════════════════════════════════════════ */}
      {vistaActiva === 'cierres' && (
        <Card className="pf-card border-0 mb-4">
          <Card.Body className="p-0">
            {loadingVentas ? (
              <div className="text-center py-5" style={{ color: '#888' }}>
                <div className="pf-spinner-sm" /> Cargando datos...
              </div>
            ) : (
              <div className="table-responsive">
                <Table className="pf-table mb-0">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th className="text-center">Ventas</th>
                      <th>Total USD</th>
                      <th>Total Bolívares</th>
                      <th>Total Pesos</th>
                      <th>Estado Arqueo</th>
                      <th className="text-center">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rangoFechas.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5" style={{ color: '#aaa' }}>
                          <div style={{ fontSize: '2rem', marginBottom: 8 }}>☕</div>
                          Selecciona un rango de fechas y filtra para ver los cierres
                        </td>
                      </tr>
                    ) : rangoFechas.map((fecha) => {
                      const diaData = ventasPorDia[fecha];
                      const tieneVentas = diaData && diaData.ventas.length > 0;
                      const arqueosDia = arqueosPorDia[fecha] || [];
                      const arqueo = arqueosDia.find(a => a.estado === 'CERRADA') || arqueosDia[0];

                      const fechaDisplay = new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {
                        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
                      });

                      const esHoy = fecha === getFechaLocal();

                      return (
                        <tr key={fecha} className={`pf-cierre-row ${tieneVentas ? 'has-ventas' : 'no-ventas'}`}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                background: tieneVentas ? 'rgba(255,215,0,0.15)' : '#f5f5f5',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1rem',
                              }}>
                                {tieneVentas ? '📋' : '—'}
                              </div>
                              <div>
                                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', letterSpacing: '0.04em' }}>
                                  {fechaDisplay}
                                </div>
                                {esHoy && (
                                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#16a34a', background: 'rgba(22,163,74,0.1)', padding: '1px 6px', borderRadius: 999 }}>
                                    HOY
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="text-center">
                            {tieneVentas ? (
                              <span style={{
                                fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.15rem',
                                background: '#1a1a1a', color: '#FFD700',
                                padding: '2px 12px', borderRadius: 999, letterSpacing: '0.04em',
                              }}>
                                {diaData.ventas.length}
                              </span>
                            ) : (
                              <span style={{ color: '#ccc', fontSize: '0.82rem' }}>0</span>
                            )}
                          </td>

                          <td>
                            {tieneVentas && diaData.total_usd > 0 ? (
                              <span className="pf-moneda-num" style={{ color: '#16a34a' }}>
                                {formatCurrency(diaData.total_usd, 'USD')}
                                <span className="pf-moneda-tag">USD</span>
                              </span>
                            ) : <span style={{ color: '#ddd' }}>—</span>}
                          </td>

                          <td>
                            {tieneVentas && diaData.total_ves > 0 ? (
                              <span className="pf-moneda-num" style={{ color: '#0284c7' }}>
                                {formatCurrency(diaData.total_ves, 'VES')}
                                <span className="pf-moneda-tag">VES</span>
                              </span>
                            ) : <span style={{ color: '#ddd' }}>—</span>}
                          </td>

                          <td>
                            {tieneVentas && diaData.total_cop > 0 ? (
                              <span className="pf-moneda-num" style={{ color: '#b45309' }}>
                                {formatCurrency(diaData.total_cop, 'COP')}
                                <span className="pf-moneda-tag">COP</span>
                              </span>
                            ) : <span style={{ color: '#ddd' }}>—</span>}
                          </td>

                          <td>
                            {arqueo ? (
                              <span className={`pf-estado-cierre ${arqueo.estado === 'CERRADA' ? 'cerrada' : 'abierta'}`}>
                                {arqueo.estado === 'CERRADA' ? '🔒 Cerrada' : '🟢 Abierta'}
                              </span>
                            ) : (
                              <span className="pf-estado-cierre sin-arqueo">Sin arqueo</span>
                            )}
                          </td>

                          <td className="text-center">
                            <button
                              className="pf-btn-cierre"
                              disabled={!tieneVentas}
                              onClick={() => tieneVentas && setCierreDiaSeleccionado(fecha)}
                            >
                              <i className="bi bi-clipboard2-data" />
                              Ver cierre
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* ══════════════════════════════════════════
          VISTA: MOVIMIENTOS DE CAJA
      ══════════════════════════════════════════ */}
      {vistaActiva === 'movimientos' && (
        <Card className="pf-card border-0 mb-4">
          <Card.Header className="pf-card-header d-flex justify-content-between align-items-center">
            <h5><i className="bi bi-arrow-left-right me-2" />Movimientos de Caja</h5>
            <span className="pf-badge-count">{flujo.length} movimientos</span>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table className="pf-table mb-0">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Concepto</th>
                    <th>Moneda</th>
                    <th className="text-end">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {!Array.isArray(flujo) || flujo.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5" style={{ color: '#aaa' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 8 }}>🧾</div>
                        No hay movimientos en el período seleccionado
                      </td>
                    </tr>
                  ) : flujo.map((item, i) => {
                    const tipo = item.tipo_transaccion;
                    return (
                      <tr key={item.id_transaccion || i}>
                        <td style={{ color: '#888', fontSize: '0.82rem' }}>{formatDateTime(item.fecha_transaccion)}</td>
                        <td>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                            background: tipo === 'INGRESO' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                            color: tipo === 'INGRESO' ? '#16a34a' : '#dc2626',
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                          }}>
                            {tipo === 'INGRESO' ? '↑ ' : '↓ '}{tipo}
                          </span>
                        </td>
                        <td>{item.concepto}</td>
                        <td><span className="pf-moneda-badge">{item.codigo_moneda}</span></td>
                        <td className="text-end" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: tipo === 'INGRESO' ? '#16a34a' : '#dc2626', letterSpacing: '0.02em' }}>
                          {tipo === 'INGRESO' ? '+' : '−'}{formatCurrency(item.monto, item.codigo_moneda)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {Array.isArray(flujo) && flujo.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="text-end" style={{ fontWeight: 700, fontSize: '0.78rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Balance del período:
                      </td>
                      <td className="text-end">
                        {Object.entries(totalesFlujo).map(([moneda, balance]) => (
                          <div key={moneda} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: balance >= 0 ? '#16a34a' : '#dc2626', letterSpacing: '0.02em' }}>
                            {balance >= 0 ? '+' : ''}{formatCurrency(balance, moneda)}{' '}
                            <span className="pf-moneda-badge">{moneda}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* ── Modal cierre diario ── */}
      {cierreDiaSeleccionado && ventasPorDia[cierreDiaSeleccionado] && (
        <CierreDiaModal
          dia={cierreDiaSeleccionado}
          ventasDia={ventasPorDia[cierreDiaSeleccionado].ventas}
          onClose={() => setCierreDiaSeleccionado(null)}
          onVerVenta={(id) => { setCierreDiaSeleccionado(null); handleVerDetalle(id); }}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Modales existentes */}
      <AbrirCajaModal show={showAbrirModal} onHide={() => setShowAbrirModal(false)} onSuccess={loadData} />
      <CerrarCajaModal show={showCerrarModal} onHide={() => setShowCerrarModal(false)} estadoCaja={estadoCaja} resumenVentas={resumenVentas} ventasDelDia={todasLasVentas} onSuccess={loadData} />
      <TransaccionModal show={showTransaccionModal} onHide={() => setShowTransaccionModal(false)} onSuccess={loadData} />
      <DetalleVentaModal
        show={showDetalleModal}
        onHide={() => { setShowDetalleModal(false); setVentaDetalleId(null); }}
        ventaId={ventaDetalleId}
        onStatusChange={() => { loadData(); setShowDetalleModal(false); setVentaDetalleId(null); }}
      />
    </div>
  );
};

export default FlujoCajaScreen;