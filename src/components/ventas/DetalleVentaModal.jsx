import { useState, useEffect } from 'react';
import { Modal, Badge, ListGroup, Row, Col } from 'react-bootstrap';
import { ventasService } from '../../api/services/ventasService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { useSocket } from "../../context/SocketContext";

const DetalleVentaModal = ({ show, onHide, ventaId, onStatusChange }) => {
  const [venta, setVenta]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [procesando, setProcesando] = useState(false);

  const { emitirCambioEstado } = useSocket();

  useEffect(() => {
    if (show && ventaId) cargarDetalleVenta();
  }, [show, ventaId]);

  const cargarDetalleVenta = async () => {
    try {
      setLoading(true);
      const response = await ventasService.getById(ventaId);
      const ventaData = response.data?.data || response.data;
      setVenta(ventaData);
    } catch (error) {
      console.error('Error al cargar detalle de venta:', error);
      toast.error('Error al cargar detalle de venta');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    try {
      setProcesando(true);
      await ventasService.cambiarEstado(ventaId, nuevoEstado);
      toast.success(`Venta ${nuevoEstado.toLowerCase()} correctamente`);
      setVenta({ ...venta, estado_venta: nuevoEstado });
      emitirCambioEstado(ventaId, nuevoEstado);
      if (onStatusChange) onStatusChange();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado');
    } finally {
      setProcesando(false);
    }
  };

  const handleClose = () => { setVenta(null); onHide(); };

  const getEstadoBadge = (estado) => {
    const badges = {
      PENDIENTE:  { bg: 'warning',   text: 'Pendiente' },
      EN_PROCESO: { bg: 'info',      text: 'En Proceso' },
      COMPLETADA: { bg: 'success',   text: 'Completada' },
      CANCELADA:  { bg: 'danger',    text: 'Cancelada' },
    };
    return badges[estado] || { bg: 'secondary', text: estado };
  };

  const calcularSubtotal = (item) => {
    const base     = parseFloat(item.precio_unitario || item.precio || 0) * parseInt(item.cantidad || 0);
    const toppings = (item.toppings || []).reduce((s, t) => s + parseFloat(t.precio || t.precio_unitario || t.precio_adicional || 0) * parseInt(item.cantidad || 0), 0);
    const sabores  = (item.sabores  || []).reduce((s, x) => s + parseFloat(x.precio || x.precio_unitario || x.precio_adicional || 0) * parseInt(item.cantidad || 0), 0);
    const siropes  = (item.siropes  || []).reduce((s, x) => s + parseFloat(x.precio || x.precio_unitario || x.precio_adicional || 0) * parseInt(item.cantidad || 0), 0);
    return base + toppings + sabores + siropes;
  };

  const getCodigoMoneda = () => venta?.codigo_moneda || venta?.moneda || 'USD';
  const codigoMoneda    = venta ? getCodigoMoneda() : 'USD';

  /* ── estilos ── */
  const btnAction = (bg, shadow) => ({
    background: bg, border: 'none', color: '#fff', fontWeight: '700',
    borderRadius: '8px', padding: '6px 14px', cursor: procesando ? 'not-allowed' : 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem',
    opacity: procesando ? 0.75 : 1, transition: 'all 0.2s',
    boxShadow: `0 2px 8px ${shadow}`,
  });
  const spinnerStyle = { width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite', display: 'inline-block', marginRight: '4px', verticalAlign: 'middle' };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        .pf-dv-modal .modal-content { border-radius:16px !important; border:none !important; box-shadow:0 20px 60px rgba(0,0,0,0.18) !important; overflow:hidden; }
        .pf-dv-modal .modal-header { background:#1a1a1a; border-bottom:2px solid #FFCC00; padding:1rem 1.5rem; }
        .pf-dv-modal .modal-title { color:#fff !important; font-family:'Arial Black',sans-serif; font-weight:900; font-size:1rem; text-transform:uppercase; display:flex; align-items:center; gap:8px; }
        .pf-dv-modal .modal-title i { color:#FFCC00; }
        .pf-dv-modal .btn-close { filter:invert(1) brightness(2); }
        .pf-dv-modal .modal-body { padding:1.5rem; }
        .pf-dv-modal .modal-footer { padding:1rem 1.5rem; border-top:1px solid rgba(0,0,0,0.07); background:#f9f9f9; }
        .pf-meta-label { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#888; display:block; margin-bottom:3px; }
        .pf-meta-value { font-weight:700; font-size:0.92rem; color:#1a1a1a; }
        .pf-section-title { font-family:'Arial Black',sans-serif; font-weight:900; font-size:0.88rem; color:#1a1a1a; text-transform:uppercase; margin:0 0 12px; padding-bottom:10px; border-bottom:2px solid rgba(255,204,0,0.25); display:flex; align-items:center; gap:6px; }
        .pf-section-title i { color:#FFCC00; }
        .pf-item-row { padding:12px 0; border-bottom:1px solid rgba(0,0,0,0.05); }
        .pf-item-row:last-child { border-bottom:none; }
        .pf-item-name { font-weight:700; font-size:0.95rem; color:#1a1a1a; margin-bottom:2px; }
        .pf-item-qty { color:#888; font-size:0.82rem; }
        .pf-item-subtotal { font-family:'Arial Black',sans-serif; font-weight:900; font-size:1.05rem; color:#1a1a1a; }
        .pf-extra-badge { border-radius:6px; padding:3px 9px; font-size:0.73rem; font-weight:700; display:inline-flex; align-items:center; gap:4px; margin:2px 3px 2px 0; }
        .pf-extra-badge.sabor  { background:rgba(99,102,241,0.1); color:#4f46e5; }
        .pf-extra-badge.topping { background:rgba(245,158,11,0.1); color:#b45309; }
        .pf-extra-badge.sirope { background:rgba(16,185,129,0.1); color:#059669; }
        .pf-total-section { border-top:2px solid rgba(255,204,0,0.25); padding-top:16px; margin-top:4px; }
        .pf-total-usd { background:rgba(255,204,0,0.07); border:1.5px solid rgba(255,204,0,0.2); border-radius:10px; padding:10px 14px; }
        .pf-action-box { border-radius:12px; padding:14px 16px; margin-top:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
        .pf-action-box.pendiente { background:rgba(255,204,0,0.07); border:1.5px solid rgba(255,204,0,0.25); }
        .pf-action-box.en-proceso { background:rgba(2,132,199,0.06); border:1.5px solid rgba(2,132,199,0.2); }
        .pf-moneda-chip { background:#f0f0f0; color:#1a1a1a; border-radius:8px; padding:6px 14px; font-size:0.88rem; font-weight:700; display:inline-flex; align-items:center; gap:6px; border:1.5px solid rgba(255,204,0,0.2); }
        .pf-img-placeholder { height:60px; background:#f5f5f5; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:1.4rem; }
        .pf-spinner-modal { width:2.5rem; height:2.5rem; border-radius:50%; border:3px solid rgba(255,204,0,0.2); border-top-color:#FFCC00; animation:spin 0.8s linear infinite; margin:0 auto; }
      `}</style>

      <Modal show={show} onHide={handleClose} size="lg" centered dialogClassName="pf-dv-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-receipt" />
            Detalle de Venta {ventaId ? `#${ventaId}` : ''}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="pf-spinner-modal" />
              <p className="mt-3" style={{ color: '#888', fontSize: '0.9rem' }}>Cargando detalle...</p>
            </div>
          ) : venta ? (
            <>
              {/* ── Info general ── */}
              <Row className="mb-4">
                <Col md={6}>
                  <div className="mb-3">
                    <span className="pf-meta-label">Fecha y Hora</span>
                    <span className="pf-meta-value">{formatDateTime(venta.fecha_venta || venta.created_at)}</span>
                  </div>
                  <div className="mb-3">
                    <span className="pf-meta-label">Estado</span>
                    <Badge bg={getEstadoBadge(venta.estado_venta).bg} className="fs-6">
                      {getEstadoBadge(venta.estado_venta).text}
                    </Badge>
                  </div>
                  {venta.nombre_cliente && (
                    <div className="mb-3">
                      <span className="pf-meta-label"><i className="bi bi-person me-1" />Cliente</span>
                      <span className="pf-meta-value">{venta.nombre_cliente}</span>
                    </div>
                  )}
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <span className="pf-meta-label">Moneda de Pago</span>
                    <div>
                      <span className="pf-moneda-chip">
                        {codigoMoneda === 'USD' && '💵 Dólares (USD)'}
                        {codigoMoneda === 'VES' && '💰 Bolívares (VES)'}
                        {codigoMoneda === 'COP' && '💵 Pesos (COP)'}
                        {!['USD','VES','COP'].includes(codigoMoneda) && codigoMoneda}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="pf-meta-label">Número de Factura</span>
                    <span className="pf-meta-value" style={{ fontFamily: "'Arial Black',sans-serif" }}>{venta.numero_factura || 'N/A'}</span>
                  </div>
                  <div className="mb-3">
                    <span className="pf-meta-label">Atendido por</span>
                    <span className="pf-meta-value">{venta.usuario?.nombre || venta.nombre_usuario || 'N/A'}</span>
                  </div>
                </Col>
              </Row>

              {/* ── Productos ── */}
              <div className="mb-4">
                <p className="pf-section-title"><i className="bi bi-basket" />Productos</p>
                <ListGroup variant="flush">
                  {(venta.items || venta.detalles || []).map((item, index) => (
                    <ListGroup.Item key={index} className="px-0 py-0 border-0">
                      <div className="pf-item-row">
                        <Row className="align-items-start">
                          <Col xs={3} md={2}>
                            {item.imagen_url || item.imagenUrl ? (
                              <img
                                src={item.imagen_url || item.imagenUrl}
                                alt={item.nombre_producto || item.nombre}
                                className="img-fluid rounded"
                                style={{ maxHeight: '60px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="pf-img-placeholder rounded">
                                <i className="bi bi-image" />
                              </div>
                            )}
                          </Col>
                          <Col xs={9} md={10}>
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                              <div className="flex-grow-1">
                                <div className="pf-item-name">{item.nombre_producto || item.nombre}</div>
                                <div className="pf-item-qty">
                                  {formatCurrency(item.precio_unitario || item.precio, codigoMoneda)}
                                  <span className="mx-1">×</span>
                                  {item.cantidad}
                                </div>

                                {/* Sabores */}
                                {item.sabores?.length > 0 && (
                                  <div className="mt-2">
                                    <small style={{ color: '#888', display: 'block', marginBottom: '4px', fontSize: '0.72rem' }}>
                                      <i className="bi bi-snow2 me-1" />Sabores:
                                    </small>
                                    {item.sabores.map((s, idx) => (
                                      <span key={idx} className="pf-extra-badge sabor">
                                        <i className="bi bi-snow2" />
                                        {s.nombre_sabor || s.nombre}
                                        {(s.precio || s.precio_unitario || s.precio_adicional) > 0 && (
                                          <span>(+{formatCurrency(s.precio || s.precio_unitario || s.precio_adicional, codigoMoneda)})</span>
                                        )}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Toppings */}
                                {item.toppings?.length > 0 && (
                                  <div className="mt-2">
                                    <small style={{ color: '#888', display: 'block', marginBottom: '4px', fontSize: '0.72rem' }}>
                                      <i className="bi bi-stars me-1" />Toppings:
                                    </small>
                                    {item.toppings.map((t, idx) => (
                                      <span key={idx} className="pf-extra-badge topping">
                                        <i className="bi bi-plus-circle" />
                                        {t.nombre_topping || t.nombre}
                                        <span>(+{formatCurrency(t.precio || t.precio_unitario || t.precio_adicional, codigoMoneda)})</span>
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Siropes */}
                                {item.siropes?.length > 0 && (
                                  <div className="mt-2">
                                    <small style={{ color: '#888', display: 'block', marginBottom: '4px', fontSize: '0.72rem' }}>
                                      <i className="bi bi-droplet-fill me-1" />Siropes:
                                    </small>
                                    {item.siropes.map((s, idx) => (
                                      <span key={idx} className="pf-extra-badge sirope">
                                        <i className="bi bi-droplet-fill" />
                                        {s.nombre_sirope || s.nombre}
                                        <span>(+{formatCurrency(s.precio || s.precio_unitario || s.precio_adicional, codigoMoneda)})</span>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-end">
                                <span className="pf-item-subtotal">{formatCurrency(calcularSubtotal(item), codigoMoneda)}</span>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>

              {/* ── Total ── */}
              <div className="pf-total-section">
                <Row className="align-items-center">
                  <Col xs={12} md={6} className="mb-3 mb-md-0">
                    {codigoMoneda !== 'USD' && venta.total_usd && (
                      <div className="pf-total-usd">
                        <small style={{ color: '#888', display: 'block', marginBottom: '3px', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <i className="bi bi-currency-exchange me-1" />Equivalente en USD:
                        </small>
                        <strong style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: '900', color: '#1a1a1a', fontSize: '1rem' }}>
                          {formatCurrency(venta.total_usd, 'USD')}
                        </strong>
                      </div>
                    )}
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ fontWeight: '700', fontSize: '1rem', color: '#1a1a1a' }}>Total:</span>
                      <span style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: '900', fontSize: '1.8rem', color: '#16a34a' }}>
                        {formatCurrency(venta.total || venta.monto_total, codigoMoneda)}
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* ── Acciones PENDIENTE ── */}
              {venta.estado_venta === 'PENDIENTE' && (
                <div className="pf-action-box pendiente">
                  <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#1a1a1a' }}>
                    <i className="bi bi-info-circle me-2" style={{ color: '#FFCC00' }} />
                    ¿Deseas cambiar el estado de esta venta?
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button style={btnAction('#0284c7', 'rgba(2,132,199,0.3)')} onClick={() => cambiarEstado('EN_PROCESO')} disabled={procesando}>
                      {procesando ? <div style={spinnerStyle} /> : <i className="bi bi-hourglass-split" />}
                      En Proceso
                    </button>
                    <button style={btnAction('#16a34a', 'rgba(22,163,74,0.3)')} onClick={() => cambiarEstado('COMPLETADA')} disabled={procesando}>
                      {procesando ? <div style={spinnerStyle} /> : <i className="bi bi-check-circle" />}
                      Completar
                    </button>
                    <button style={btnAction('#dc2626', 'rgba(220,38,38,0.2)')} onClick={() => cambiarEstado('CANCELADA')} disabled={procesando}>
                      <i className="bi bi-x-circle" />
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* ── Acciones EN_PROCESO ── */}
              {venta.estado_venta === 'EN_PROCESO' && (
                <div className="pf-action-box en-proceso">
                  <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#1a1a1a' }}>
                    <i className="bi bi-hourglass-split me-2" style={{ color: '#0284c7' }} />
                    Pedido en preparación
                  </div>
                  <button style={btnAction('#16a34a', 'rgba(22,163,74,0.3)')} onClick={() => cambiarEstado('COMPLETADA')} disabled={procesando}>
                    {procesando ? <div style={spinnerStyle} /> : <i className="bi bi-check-circle" />}
                    Marcar como Completado
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.25)', borderRadius: '10px', padding: '12px 16px', fontSize: '0.875rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-exclamation-triangle" />
              No se pudo cargar la información de la venta
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <button
            style={{ background: '#1a1a1a', border: 'none', color: '#fff', fontWeight: '700', borderRadius: '8px', padding: '0.6rem 1.4rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', transition: 'all 0.2s' }}
            onClick={handleClose}
            onMouseEnter={e => e.currentTarget.style.background='#333'}
            onMouseLeave={e => e.currentTarget.style.background='#1a1a1a'}
          >
            <i className="bi bi-x-lg" />
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DetalleVentaModal;