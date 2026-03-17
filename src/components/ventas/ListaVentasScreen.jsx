import { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, Row, Col } from 'react-bootstrap';
import { ventasService } from '../../api/services/ventasService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ESTADOS_PEDIDO, COLORES_ESTADO } from '../../utils/constants';
import { toast } from 'react-toastify';
import DetalleVentaModal from '../../components/ventas/DetalleVentaModal';

const ListaVentasScreen = () => {
  const [ventas, setVentas]                   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [showModal, setShowModal]             = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [filtros, setFiltros] = useState({ estado_venta: '', fecha_inicio: '', fecha_fin: '' });

  useEffect(() => { loadVentas(); }, []);

  const loadVentas = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtros.estado_venta) params.estado_venta = filtros.estado_venta;
      if (filtros.fecha_inicio) params.fecha_inicio = filtros.fecha_inicio;
      if (filtros.fecha_fin)    params.fecha_fin    = filtros.fecha_fin;
      const response = await ventasService.getAll(params);
      if (response.data.success) setVentas(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      toast.error('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (venta) => { setVentaSeleccionada(venta.id_venta); setShowModal(true); };
  const handleFiltrar    = () => loadVentas();
  const handleLimpiarFiltros = () => {
    setFiltros({ estado_venta: '', fecha_inicio: '', fecha_fin: '' });
    setTimeout(() => loadVentas(), 100);
  };

  const inputStyle  = { borderColor: '#ddd', borderRadius: '8px' };
  const btnPrimary  = { background: '#FFCC00', border: 'none', color: '#1a1a1a', fontWeight: '700', borderRadius: '8px', padding: '0.55rem 1.1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(255,204,0,0.3)' };
  const btnOutline  = { background: 'transparent', border: '1.5px solid #ddd', color: '#444', fontWeight: '600', borderRadius: '8px', padding: '0.55rem 0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontSize: '0.875rem', transition: 'all 0.2s' };
  const btnVerStyle = { background: 'rgba(255,204,0,0.1)', border: '1.5px solid rgba(255,204,0,0.3)', color: '#1a1a1a', fontWeight: '700', borderRadius: '7px', padding: '4px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', transition: 'all 0.15s' };

  return (
    <div>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .pf-screen-title { font-family:'Arial Black',sans-serif; font-weight:900; font-size:1.5rem; color:#1a1a1a; margin:0; text-transform:uppercase; }
        .pf-screen-title i { color:#FFCC00; }
        .pf-card { background:#fff; border:1.5px solid rgba(0,0,0,0.07) !important; border-radius:14px !important; box-shadow:0 2px 12px rgba(0,0,0,0.06) !important; }
        .pf-table thead th { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#888; background:#f9f9f9; border:none; padding:12px 16px; }
        .pf-table tbody td { padding:12px 16px; vertical-align:middle; border-top:1px solid rgba(0,0,0,0.05); font-size:0.875rem; color:#1a1a1a; }
        .pf-table tbody tr:hover td { background:rgba(255,204,0,0.04); }
        .pf-select:focus, .pf-input:focus { border-color:#FFCC00 !important; box-shadow:0 0 0 3px rgba(255,204,0,0.2) !important; outline:none; }
        .pf-ver-btn:hover { background:rgba(255,204,0,0.2) !important; border-color:#FFCC00 !important; }
        .pf-spinner { width:2.5rem; height:2.5rem; border-radius:50%; border:3px solid rgba(255,204,0,0.2); border-top-color:#FFCC00; animation:spin 0.8s linear infinite; margin:0 auto; }
        .pf-factura { font-family:'Arial Black',sans-serif; font-weight:900; font-size:0.82rem; }
        .pf-moneda-chip { background:rgba(255,204,0,0.1); color:#1a1a1a; border-radius:6px; padding:2px 8px; font-size:0.75rem; font-weight:700; display:inline-block; }
      `}</style>

      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ animation: 'slideUp 0.35s ease' }}>
        <h2 className="pf-screen-title">
          <i className="bi bi-list-ul me-2" />
          Lista de Ventas
        </h2>
      </div>

      {/* ── Filtros ── */}
      <Card className="pf-card border-0 mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontWeight: '600', fontSize: '0.88rem', color: '#1a1a1a' }}>Estado</Form.Label>
                <Form.Select className="pf-select" value={filtros.estado_venta} onChange={(e) => setFiltros({ ...filtros, estado_venta: e.target.value })} style={inputStyle}>
                  <option value="">Todos</option>
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="EN_PROCESO">EN PROCESO</option>
                  <option value="COMPLETADA">COMPLETADA</option>
                  <option value="CANCELADA">CANCELADA</option>
                  <option value="DEVUELTA">DEVUELTA</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontWeight: '600', fontSize: '0.88rem', color: '#1a1a1a' }}>Fecha Inicio</Form.Label>
                <Form.Control className="pf-input" type="date" value={filtros.fecha_inicio} onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })} style={inputStyle} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontWeight: '600', fontSize: '0.88rem', color: '#1a1a1a' }}>Fecha Fin</Form.Label>
                <Form.Control className="pf-input" type="date" value={filtros.fecha_fin} onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })} style={inputStyle} />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end gap-2">
              <button
                style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}
                onClick={handleFiltrar}
                onMouseEnter={e => e.currentTarget.style.background='#FFD93D'}
                onMouseLeave={e => e.currentTarget.style.background='#FFCC00'}
              >
                <i className="bi bi-funnel" />
                Filtrar
              </button>
              <button
                style={btnOutline}
                onClick={handleLimpiarFiltros}
                title="Limpiar filtros"
                onMouseEnter={e => { e.currentTarget.style.borderColor='#bbb'; e.currentTarget.style.background='#f5f5f5'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#ddd'; e.currentTarget.style.background='transparent'; }}
              >
                <i className="bi bi-x-circle" />
              </button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ── Tabla ── */}
      <Card className="pf-card border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="pf-spinner" />
            </div>
          ) : ventas.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#ccc' }} />
              <h5 className="mt-3" style={{ color: '#888' }}>No hay ventas</h5>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="pf-table mb-0">
                <thead>
                  <tr>
                    <th>Factura</th>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Moneda</th>
                    <th>Estado</th>
                    <th className="text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta) => (
                    <tr key={venta.id_venta} style={{ cursor: 'pointer' }} onClick={() => handleVerDetalle(venta)}>
                      <td><span className="pf-factura">{venta.numero_factura}</span></td>
                      <td style={{ color: '#888', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{formatDateTime(venta.fecha_venta)}</td>
                      <td style={{ color: '#444' }}>{venta.nombre_usuario || '-'}</td>
                      <td style={{ fontWeight: '600' }}>{venta.nombre_cliente || 'Cliente General'}</td>
                      <td style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: '900', fontSize: '0.9rem' }}>{formatCurrency(venta.total, venta.codigo_moneda)}</td>
                      <td><span className="pf-moneda-chip">{venta.codigo_moneda}</span></td>
                      <td>
                        <Badge bg={COLORES_ESTADO[venta.estado_venta] || 'secondary'}>
                          {venta.estado_venta}
                        </Badge>
                      </td>
                      <td className="text-center" onClick={e => e.stopPropagation()}>
                        <button
                          className="pf-ver-btn"
                          style={btnVerStyle}
                          onClick={() => handleVerDetalle(venta)}
                        >
                          <i className="bi bi-eye" /> Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <DetalleVentaModal
        show={showModal}
        onHide={() => { setShowModal(false); setVentaSeleccionada(null); }}
        ventaId={ventaSeleccionada}
        onStatusChange={() => { loadVentas(); setShowModal(false); setVentaSeleccionada(null); }}
      />
    </div>
  );
};

export default ListaVentasScreen;