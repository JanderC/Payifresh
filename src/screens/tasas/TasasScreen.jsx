import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Table, Badge } from 'react-bootstrap';
import { monedasService } from '../../api/services/monedasService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { toast } from 'react-toastify';
import EditarTasaModal from '../../components/monedas/EditarTasaModal';
import ConvertidorModal from '../../components/monedas/ConvertidorModal';

const TasasScreen = () => {
  const [tasas, setTasas]                     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [actualizandoBCV, setActualizandoBCV] = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [showConvertidorModal, setShowConvertidorModal] = useState(false);
  const [tasaSeleccionada, setTasaSeleccionada] = useState(null);
  const [guardando, setGuardando]             = useState(false);
  const [tasasEditables, setTasasEditables]   = useState({ VES: '', COP: '', USD: '1' });

  useEffect(() => { loadTasas(); }, []);

  const loadTasas = async () => {
    try {
      setLoading(true);
      const response = await monedasService.getTasas();
      const tasasData = response.data?.data || response.data || [];
      if (Array.isArray(tasasData)) {
        setTasas(tasasData);
        const tasasObj = {};
        tasasData.forEach(t => { tasasObj[t.codigo_moneda] = t.tasa_cambio_usd; });
        setTasasEditables(tasasObj);
      } else {
        setTasas([]);
        toast.error('Error al cargar formato de tasas');
      }
    } catch (error) {
      setTasas([]);
      toast.error('Error al cargar tasas de cambio');
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarBCV = async () => {
    try {
      setActualizandoBCV(true);
      const response = await monedasService.actualizarBCV();
      toast.success('Tasa BCV actualizada correctamente');
      if (response.data?.data?.fuente) toast.info(`Fuente: ${response.data.data.fuente}`);
      await loadTasas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar tasa BCV.');
    } finally {
      setActualizandoBCV(false);
    }
  };

  const handleChangeTasa = (codigo, valor) => setTasasEditables({ ...tasasEditables, [codigo]: valor });

  const handleGuardarTasas = async () => {
    try {
      setGuardando(true);
      const tasasArray = Object.entries(tasasEditables)
        .filter(([codigo, tasa]) => codigo !== 'USD' && tasa && parseFloat(tasa) > 0)
        .map(([codigo_moneda, tasa_cambio_usd]) => ({ codigo_moneda, tasa_cambio_usd: parseFloat(tasa_cambio_usd) }));
      if (tasasArray.length === 0) { toast.warning('No hay tasas válidas para actualizar'); return; }
      await monedasService.actualizarMultiples(tasasArray);
      toast.success('Tasas actualizadas correctamente');
      await loadTasas();
    } catch (error) {
      toast.error('Error al actualizar tasas');
    } finally {
      setGuardando(false);
    }
  };

  const getTasaInfo        = (codigo) => tasas.find(t => t.codigo_moneda === codigo);
  const calcularEquivalencia = (codigo, monto = 1) => monto * (parseFloat(tasasEditables[codigo]) || 1);

  /* ── estilos ── */
  const btnPrimary = {
    background: '#FFCC00', border: 'none', color: '#1a1a1a',
    fontWeight: '700', borderRadius: '8px', padding: '0.55rem 1.2rem',
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
    transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(255,204,0,0.3)', fontSize: '0.875rem',
  };
  const inputStyle = { borderColor: '#ddd', borderRadius: '8px', transition: 'border-color 0.2s' };
  const cardHeaderStyle = {
    background: 'rgba(255,204,0,0.06)', borderBottom: '1px solid rgba(255,204,0,0.15)',
    borderRadius: '14px 14px 0 0', padding: '1.1rem 1.4rem',
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px', gap: '16px' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', border: '3px solid rgba(255,204,0,0.2)', borderTopColor: '#FFCC00', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#888', fontWeight: '600', margin: 0 }}>Cargando tasas de cambio...</p>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .pf-screen-title { font-family:'Arial Black',sans-serif; font-weight:900; font-size:clamp(1.3rem,4vw,1.8rem); color:#1a1a1a; margin:0; text-transform:uppercase; }
        .pf-screen-title i { color:#FFCC00; }
        .pf-card { background:#fff; border:1.5px solid rgba(0,0,0,0.07) !important; border-radius:14px !important; box-shadow:0 2px 12px rgba(0,0,0,0.06) !important; }
        .pf-input:focus { border-color:#FFCC00 !important; box-shadow:0 0 0 3px rgba(255,204,0,0.2) !important; outline:none; }
        .pf-input-prefix { background:#f9f9f9 !important; border-color:#ddd !important; color:#888; font-weight:600; }
        .pf-table thead th { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#888; background:#f9f9f9; border:none; padding:12px 16px; }
        .pf-table tbody td { padding:12px 16px; vertical-align:middle; border-top:1px solid rgba(0,0,0,0.05); font-size:0.875rem; color:#1a1a1a; }
        .pf-table tbody tr:hover td { background:rgba(255,204,0,0.04); }
        .pf-info-alert { background:rgba(255,204,0,0.07); border-left:4px solid #FFCC00; border-radius:10px; padding:12px 16px; margin-bottom:1.5rem; font-size:0.875rem; color:#1a1a1a; display:flex; align-items:flex-start; gap:10px; }
        .pf-info-alert i { color:#FFCC00; font-size:1.1rem; flex-shrink:0; margin-top:1px; }
        .pf-card-header-title { font-family:'Arial Black',sans-serif; font-weight:900; font-size:0.92rem; color:#1a1a1a; margin:0; text-transform:uppercase; display:flex; align-items:center; gap:8px; }
        .pf-card-header-title i { color:#FFCC00; }
        .pf-spinner-sm { width:1rem; height:1rem; border-radius:50%; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; animation:spin 0.8s linear infinite; display:inline-block; vertical-align:middle; margin-right:6px; }
        .pf-spinner-sm.dark { border-color:rgba(255,204,0,0.2); border-top-color:#FFCC00; }
        .pf-symbol-badge { background:rgba(255,204,0,0.12); color:#1a1a1a; border-radius:6px; padding:3px 10px; font-size:0.78rem; font-weight:700; display:inline-block; }
        .pf-currency-card { border-radius:14px !important; border:none !important; box-shadow:0 2px 12px rgba(0,0,0,0.07) !important; border-left:5px solid !important; height:100%; }
      `}</style>

      {/* ── Header ── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3" style={{ animation: 'slideUp 0.35s ease' }}>
        <div>
          <h2 className="pf-screen-title">
            <i className="bi bi-currency-exchange me-2" />
            Gestión de Tasas de Cambio
          </h2>
          <p style={{ color: '#94a3b8', margin: '3px 0 0', fontSize: '0.85rem' }}>Administra las tasas de conversión de monedas</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button
            style={{ ...btnPrimary, background: 'transparent', border: '1.5px solid #1a1a1a', color: '#1a1a1a', boxShadow: 'none', opacity: tasas.length === 0 ? 0.5 : 1, cursor: tasas.length === 0 ? 'not-allowed' : 'pointer' }}
            onClick={() => setShowConvertidorModal(true)}
            disabled={tasas.length === 0}
            onMouseEnter={e => { if (tasas.length > 0) e.currentTarget.style.background='#f5f5f5'; }}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <i className="bi bi-calculator" />
            Convertidor
          </button>
          <button
            style={btnPrimary}
            onClick={loadTasas}
            onMouseEnter={e => { e.currentTarget.style.background='#FFD93D'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='#FFCC00'; e.currentTarget.style.transform='translateY(0)'; }}
          >
            <i className="bi bi-arrow-clockwise" />
            Actualizar
          </button>
        </div>
      </div>

      {/* ── Alerta informativa ── */}
      <div className="pf-info-alert">
        <i className="bi bi-info-circle" />
        <span><strong>Importante:</strong> Las tasas de cambio se utilizan para convertir todas las transacciones a USD (moneda base). Actualice las tasas regularmente para mantener cálculos precisos.</span>
      </div>

      {/* ── Tarjetas de tasas ── */}
      <Row className="mb-4 g-3">
        {/* USD */}
        <Col xs={12} md={4}>
          <Card className="pf-currency-card" style={{ borderLeftColor: '#16a34a' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Dólar Estadounidense</div>
                  <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: '900', fontSize: '1.6rem', color: '#16a34a' }}>USD</div>
                </div>
                <div style={{ background: 'rgba(22,163,74,0.1)', padding: '12px', borderRadius: '12px' }}>
                  <i className="bi bi-currency-dollar" style={{ fontSize: '2rem', color: '#16a34a' }} />
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span style={{ color: '#888', fontSize: '0.82rem' }}>Tasa Base</span>
                <Badge bg="success" className="px-3 py-2">1.00</Badge>
              </div>
              {getTasaInfo('USD') && (
                <small style={{ color: '#aaa', display: 'block', marginTop: '8px', fontSize: '0.75rem' }}>
                  Actualizado: {formatDateTime(getTasaInfo('USD').fecha_actualizacion)}
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* VES */}
        <Col xs={12} md={4}>
          <Card className="pf-currency-card" style={{ borderLeftColor: '#0284c7' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Bolívar Venezolano</div>
                  <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: '900', fontSize: '1.6rem', color: '#0284c7' }}>VES (Bs.)</div>
                </div>
                <div style={{ background: 'rgba(2,132,199,0.1)', padding: '12px', borderRadius: '12px' }}>
                  <i className="bi bi-cash-coin" style={{ fontSize: '2rem', color: '#0284c7' }} />
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ color: '#888', fontSize: '0.82rem' }}>1 USD =</span>
                <Badge bg="info" className="px-3 py-2">{parseFloat(tasasEditables.VES || 0).toFixed(2)} Bs.</Badge>
              </div>
              <button
                style={{
                  width: '100%', background: '#0284c7', border: 'none', color: '#fff',
                  fontWeight: '700', borderRadius: '8px', padding: '0.5rem',
                  cursor: actualizandoBCV ? 'not-allowed' : 'pointer', opacity: actualizandoBCV ? 0.8 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                }}
                onClick={handleActualizarBCV}
                disabled={actualizandoBCV}
              >
                {actualizandoBCV
                  ? <><div className="pf-spinner-sm" />Actualizando...</>
                  : <><i className="bi bi-cloud-download" />Actualizar desde BCV</>
                }
              </button>
              {getTasaInfo('VES') && (
                <small style={{ color: '#aaa', display: 'block', marginTop: '8px', fontSize: '0.75rem' }}>
                  Actualizado: {formatDateTime(getTasaInfo('VES').fecha_actualizacion)}
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* COP */}
        <Col xs={12} md={4}>
          <Card className="pf-currency-card" style={{ borderLeftColor: '#b45309' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Peso Colombiano</div>
                  <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: '900', fontSize: '1.6rem', color: '#b45309' }}>COP ($)</div>
                </div>
                <div style={{ background: 'rgba(180,83,9,0.1)', padding: '12px', borderRadius: '12px' }}>
                  <i className="bi bi-cash" style={{ fontSize: '2rem', color: '#b45309' }} />
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span style={{ color: '#888', fontSize: '0.82rem' }}>1 USD =</span>
                <Badge bg="warning" text="dark" className="px-3 py-2">{parseFloat(tasasEditables.COP || 0).toFixed(2)} $</Badge>
              </div>
              {getTasaInfo('COP') && (
                <small style={{ color: '#aaa', display: 'block', marginTop: '8px', fontSize: '0.75rem' }}>
                  Actualizado: {formatDateTime(getTasaInfo('COP').fecha_actualizacion)}
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Actualización manual ── */}
      <Card className="pf-card border-0 mb-4">
        <Card.Header style={cardHeaderStyle}>
          <p className="pf-card-header-title"><i className="bi bi-pencil-square" />Actualización Manual de Tasas</p>
        </Card.Header>
        <Card.Body className="p-4">
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#1a1a1a', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <i className="bi bi-exclamation-triangle" style={{ color: '#b45309', flexShrink: 0, marginTop: '1px' }} />
            <span><strong>Atención:</strong> Ingrese las tasas de cambio con respecto al dólar (USD). Por ejemplo, si 1 USD = 4,000 COP, ingrese 4000 en el campo de COP.</span>
          </div>

          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label style={{ fontWeight: '600', fontSize: '0.88rem', color: '#1a1a1a' }}>
                  Bolívar Venezolano (VES)
                  <small style={{ color: '#888', fontWeight: '400', marginLeft: '6px' }}>1 USD = ? Bs.</small>
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text pf-input-prefix">Bs.</span>
                  <Form.Control className="pf-input" type="number" step="0.01" value={tasasEditables.VES} onChange={(e) => handleChangeTasa('VES', e.target.value)} placeholder="Ej: 205.50" style={inputStyle} />
                </div>
                <Form.Text style={{ color: '#888', fontSize: '0.75rem' }}>
                  Equivalencia: 1 Bs. = ${(1 / parseFloat(tasasEditables.VES || 1)).toFixed(6)} USD
                </Form.Text>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label style={{ fontWeight: '600', fontSize: '0.88rem', color: '#1a1a1a' }}>
                  Peso Colombiano (COP)
                  <small style={{ color: '#888', fontWeight: '400', marginLeft: '6px' }}>1 USD = ? $</small>
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text pf-input-prefix">$</span>
                  <Form.Control className="pf-input" type="number" step="0.01" value={tasasEditables.COP} onChange={(e) => handleChangeTasa('COP', e.target.value)} placeholder="Ej: 4000" style={inputStyle} />
                </div>
                <Form.Text style={{ color: '#888', fontSize: '0.75rem' }}>
                  Equivalencia: 1 $ = ${(1 / parseFloat(tasasEditables.COP || 1)).toFixed(6)} USD
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              style={{ background: '#f0f0f0', border: 'none', color: '#444', fontWeight: '700', borderRadius: '8px', padding: '0.55rem 1.2rem', cursor: guardando ? 'not-allowed' : 'pointer', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={loadTasas}
              disabled={guardando}
              onMouseEnter={e => e.currentTarget.style.background='#e0e0e0'}
              onMouseLeave={e => e.currentTarget.style.background='#f0f0f0'}
            >
              <i className="bi bi-x-circle" />
              Cancelar
            </button>
            <button
              style={{ background: '#16a34a', border: 'none', color: '#fff', fontWeight: '700', borderRadius: '8px', padding: '0.55rem 1.2rem', cursor: guardando ? 'not-allowed' : 'pointer', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: guardando ? 0.8 : 1, boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}
              onClick={handleGuardarTasas}
              disabled={guardando}
              onMouseEnter={e => { if (!guardando) e.currentTarget.style.filter='brightness(1.1)'; }}
              onMouseLeave={e => e.currentTarget.style.filter='none'}
            >
              {guardando
                ? <><div className="pf-spinner-sm" />Guardando...</>
                : <><i className="bi bi-check-circle" />Guardar Tasas</>
              }
            </button>
          </div>
        </Card.Body>
      </Card>

      {/* ── Tabla de conversiones rápidas ── */}
      <Card className="pf-card border-0">
        <Card.Header style={cardHeaderStyle}>
          <p className="pf-card-header-title"><i className="bi bi-table" />Tabla de Conversiones Rápidas</p>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table className="pf-table mb-0">
              <thead>
                <tr>
                  <th>Moneda</th>
                  <th>Símbolo</th>
                  <th>Tasa vs USD</th>
                  <th className="text-end">10 USD</th>
                  <th className="text-end">50 USD</th>
                  <th className="text-end">100 USD</th>
                  <th className="text-end">500 USD</th>
                </tr>
              </thead>
              <tbody>
                {tasas.map((tasa) => (
                  <tr key={tasa.codigo_moneda}>
                    <td>
                      <strong>{tasa.codigo_moneda}</strong>
                      <br />
                      <small style={{ color: '#888' }}>{tasa.nombre_moneda || tasa.codigo_moneda}</small>
                    </td>
                    <td><span className="pf-symbol-badge">{tasa.simbolo || tasa.codigo_moneda}</span></td>
                    <td><strong>{parseFloat(tasa.tasa_cambio_usd).toFixed(2)}</strong></td>
                    <td className="text-end">{formatCurrency(calcularEquivalencia(tasa.codigo_moneda, 10), tasa.codigo_moneda)}</td>
                    <td className="text-end">{formatCurrency(calcularEquivalencia(tasa.codigo_moneda, 50), tasa.codigo_moneda)}</td>
                    <td className="text-end">{formatCurrency(calcularEquivalencia(tasa.codigo_moneda, 100), tasa.codigo_moneda)}</td>
                    <td className="text-end">{formatCurrency(calcularEquivalencia(tasa.codigo_moneda, 500), tasa.codigo_moneda)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modales */}
      <EditarTasaModal show={showEditModal} onHide={() => setShowEditModal(false)} tasa={tasaSeleccionada} onSuccess={loadTasas} />
      {tasas.length > 0 && (
        <ConvertidorModal show={showConvertidorModal} onHide={() => setShowConvertidorModal(false)} tasas={tasas} />
      )}
    </div>
  );
};

export default TasasScreen;