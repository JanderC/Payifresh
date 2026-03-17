import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Form } from 'react-bootstrap';
import { siropesService } from '../../api/services/siropesService';
import SiropeFormModal from '../../components/siropes/SiropeFormModal';
import AjustarStockSiropeModal from '../../components/siropes/AjustarStockSiropeModal';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/formatters';
import { useMoneda } from '../../context/MonedaContext';

const SiropesScreen = () => {
  const [siropes, setSiropes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedSirope, setSelectedSirope] = useState(null);
  const [filtroDisponible, setFiltroDisponible] = useState('todos');
  const { monedaActual } = useMoneda();

  useEffect(() => { loadSiropes(); }, [filtroDisponible]);

  const loadSiropes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroDisponible !== 'todos') params.disponible = filtroDisponible === 'disponibles';
      const response = await siropesService.getAll(params);
      setSiropes(response.data.data);
    } catch (error) {
      console.error('Error al cargar siropes:', error);
      toast.error('Error al cargar siropes');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoSirope   = () => { setSelectedSirope(null); setShowModal(true); };
  const handleEditarSirope  = (s) => { setSelectedSirope(s); setShowModal(true); };
  const handleAjustarStock  = (s) => { setSelectedSirope(s); setShowStockModal(true); };

  const handleEliminarSirope = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el sirope "${nombre}"?`)) return;
    try {
      await siropesService.delete(id);
      toast.success('Sirope eliminado correctamente');
      loadSiropes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar sirope');
    }
  };

  const handleSaveSuccess = () => {
    setShowModal(false); setShowStockModal(false); setSelectedSirope(null); loadSiropes();
  };

  const getPrecioMostrar = (sirope) =>
    monedaActual === 'COP'
      ? formatCurrency(sirope.precio_adicional_cop, 'COP')
      : formatCurrency(sirope.precio_adicional_usd, 'USD');

  const getBadgeVariant = (sirope) => {
    const stock  = parseFloat(sirope.stock_actual);
    const minimo = parseFloat(sirope.stock_minimo);
    if (stock <= 0)       return 'danger';
    if (stock <= minimo)  return 'warning';
    return 'success';
  };

  /* ── estilos ── */
  const btnPrimary = {
    background: '#FFCC00', border: 'none', color: '#1a1a1a',
    fontWeight: '700', borderRadius: '8px', padding: '0.55rem 1.3rem',
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
    transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(255,204,0,0.3)',
    fontSize: '0.9rem',
  };

  const btnOutline = (color = '#1a1a1a') => ({
    background: 'transparent', border: `1.5px solid ${color}`, color,
    borderRadius: '7px', padding: '4px 10px', cursor: 'pointer',
    fontSize: '0.8rem', transition: 'all 0.15s ease', marginRight: '4px',
  });

  const statIconBox = (bg, color) => ({
    width: 48, height: 48, borderRadius: 12,
    background: bg, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '1.3rem', color, flexShrink: 0,
  });

  return (
    <div>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .pf-screen-title { font-family:'Arial Black',sans-serif; font-weight:900; font-size:1.5rem; color:#1a1a1a; margin:0; text-transform:uppercase; }
        .pf-screen-title i { color:#FFCC00; }
        .pf-card { background:#fff; border:1.5px solid rgba(0,0,0,0.07) !important; border-radius:14px !important; box-shadow:0 2px 12px rgba(0,0,0,0.06) !important; }
        .pf-table thead th { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#888; background:#f9f9f9; border:none; padding:12px 16px; }
        .pf-table tbody td { padding:12px 16px; vertical-align:middle; border-top:1px solid rgba(0,0,0,0.05); font-size:0.88rem; color:#1a1a1a; }
        .pf-table tbody tr:hover td { background:rgba(255,204,0,0.04); }
        .pf-select:focus { border-color:#FFCC00 !important; box-shadow:0 0 0 3px rgba(255,204,0,0.2) !important; outline:none; }
        .pf-btn-act:hover { opacity:0.75; transform:translateY(-1px); }
        .pf-spinner { width:2.5rem; height:2.5rem; border-radius:50%; border:3px solid rgba(255,204,0,0.2); border-top-color:#FFCC00; animation:spin 0.8s linear infinite; margin:0 auto; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .pf-stat-num { font-family:'Arial Black',sans-serif; font-weight:900; font-size:1.6rem; color:#1a1a1a; margin:0; line-height:1; }
        .pf-stat-label { font-size:0.75rem; color:#888; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px; }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ animation: 'slideUp 0.35s ease' }}>
        <div>
          <h2 className="pf-screen-title">
            <i className="bi bi-droplet-half me-2" />
            Concentrados
          </h2>
          <p style={{ color: '#94a3b8', margin: '2px 0 0', fontSize: '0.88rem' }}>
            Gestión de concentrados disponibles
          </p>
        </div>
        <button style={btnPrimary} onClick={handleNuevoSirope}
          onMouseEnter={e => { e.currentTarget.style.background='#FFD93D'; e.currentTarget.style.transform='translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='#FFCC00'; e.currentTarget.style.transform='translateY(0)'; }}
        >
          <i className="bi bi-plus-circle" />
          Nuevo Sirope
        </button>
      </div>

      {/* Stats + filtro */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="pf-card border-0">
            <Card.Body className="d-flex align-items-center gap-3">
              <div style={statIconBox('rgba(255,204,0,0.12)', '#1a1a1a')}>
                <i className="bi bi-droplet-half" />
              </div>
              <div>
                <div className="pf-stat-label">Total Siropes</div>
                <div className="pf-stat-num">{siropes.length}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="pf-card border-0">
            <Card.Body className="d-flex align-items-center gap-3">
              <div style={statIconBox('rgba(22,163,74,0.1)', '#16a34a')}>
                <i className="bi bi-check-circle" />
              </div>
              <div>
                <div className="pf-stat-label">Disponibles</div>
                <div className="pf-stat-num">{siropes.filter(s => s.disponible).length}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="pf-card border-0">
            <Card.Body className="d-flex align-items-center gap-3">
              <div style={statIconBox('rgba(245,158,11,0.1)', '#b45309')}>
                <i className="bi bi-exclamation-triangle" />
              </div>
              <div>
                <div className="pf-stat-label">Stock Bajo</div>
                <div className="pf-stat-num">
                  {siropes.filter(s => parseFloat(s.stock_actual) <= parseFloat(s.stock_minimo)).length}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="d-flex flex-column justify-content-end">
          <Form.Group>
            <Form.Label style={{ fontWeight: '600', fontSize: '0.88rem', color: '#1a1a1a' }}>
              Filtrar por estado
            </Form.Label>
            <Form.Select
              className="pf-select"
              value={filtroDisponible}
              onChange={(e) => setFiltroDisponible(e.target.value)}
              style={{ borderColor: '#ddd', borderRadius: '8px' }}
            >
              <option value="todos">Todos</option>
              <option value="disponibles">Disponibles</option>
              <option value="no_disponibles">No Disponibles</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Tabla */}
      <Card className="pf-card border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5"><div className="pf-spinner" /></div>
          ) : siropes.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-droplet-half" style={{ fontSize: '3rem', color: '#ccc' }} />
              <p style={{ color: '#aaa', marginTop: '1rem' }}>No hay concentrados registrados</p>
              <button style={btnPrimary} onClick={handleNuevoSirope}>
                Crear primer concentrado
              </button>
            </div>
          ) : (
            <Table responsive className="pf-table mb-0">
              <thead>
                <tr>
                  <th>Sirope</th>
                  <th>Descripción</th>
                  <th>Precio Adicional</th>
                  <th className="text-center">Stock</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {siropes.map((sirope) => (
                  <tr key={sirope.id_sirope}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-droplet-half" style={{ color: '#FFCC00' }} />
                        <strong>{sirope.nombre_sirope}</strong>
                      </div>
                    </td>
                    <td style={{ color: '#888', fontSize: '0.82rem' }}>
                      {sirope.descripcion || 'Sin descripción'}
                    </td>
                    <td style={{ fontWeight: '600' }}>{getPrecioMostrar(sirope)}</td>
                    <td className="text-center">
                      <Badge bg={getBadgeVariant(sirope)}>
                        {parseFloat(sirope.stock_actual).toFixed(2)} {sirope.unidad_medida}
                      </Badge>
                      {parseFloat(sirope.stock_actual) <= parseFloat(sirope.stock_minimo) && (
                        <div style={{ fontSize: '0.7rem', color: '#b45309', marginTop: '3px' }}>
                          <i className="bi bi-exclamation-triangle me-1" />
                          Bajo stock
                        </div>
                      )}
                    </td>
                    <td className="text-center">
                      <Badge bg={sirope.disponible ? 'success' : 'secondary'}>
                        {sirope.disponible ? 'Disponible' : 'No Disponible'}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <button className="pf-btn-act" style={btnOutline('#0ea5e9')} onClick={() => handleAjustarStock(sirope)} title="Ajustar Stock">
                        <i className="bi bi-arrow-repeat" />
                      </button>
                      <button className="pf-btn-act" style={btnOutline('#1a1a1a')} onClick={() => handleEditarSirope(sirope)} title="Editar">
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="pf-btn-act" style={{ ...btnOutline('#dc2626'), marginRight: 0 }} onClick={() => handleEliminarSirope(sirope.id_sirope, sirope.nombre_sirope)} title="Eliminar">
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <SiropeFormModal show={showModal} onHide={() => setShowModal(false)} sirope={selectedSirope} onSaveSuccess={handleSaveSuccess} />
      <AjustarStockSiropeModal show={showStockModal} onHide={() => setShowStockModal(false)} sirope={selectedSirope} onSuccess={handleSaveSuccess} />
    </div>
  );
};

export default SiropesScreen;