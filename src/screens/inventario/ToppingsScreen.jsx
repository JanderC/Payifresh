import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Badge, InputGroup, Table } from 'react-bootstrap';
import { toppingsService } from '../../api/services/toppingsService';
import { toast } from 'react-toastify';
import ToppingFormModal from '../../components/toppings/ToppingFormModal';
import AjustarStockModal from '../../components/toppings/AjustarStockModal';
import { formatCurrency } from '../../utils/formatters';
import { useMoneda } from '../../context/MonedaContext';

const ToppingsScreen = () => {
  const [toppings, setToppings]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [toppingEdit, setToppingEdit]     = useState(null);
  const [toppingStock, setToppingStock]   = useState(null);
  const [busqueda, setBusqueda]           = useState('');
  const { convertirPrecio }               = useMoneda();

  useEffect(() => { loadToppings(); }, []);

  const loadToppings = async () => {
    try {
      setLoading(true);
      const response = await toppingsService.getAll();
      if (response.data.success) setToppings(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar toppings:', error);
      toast.error('Error al cargar toppings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit            = (t) => { setToppingEdit(t); setShowModal(true); };
  const handleAjustarStock    = (t) => { setToppingStock(t); setShowStockModal(true); };
  const handleCloseModal      = () => { setShowModal(false); setToppingEdit(null); };
  const handleCloseStockModal = () => { setShowStockModal(false); setToppingStock(null); };
  const handleSaveSuccess     = () => { loadToppings(); handleCloseModal(); };
  const handleStockSuccess    = () => { loadToppings(); handleCloseStockModal(); };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este topping?')) {
      try {
        await toppingsService.delete(id);
        toast.success('Topping eliminado correctamente');
        loadToppings();
      } catch (error) {
        toast.error('Error al eliminar topping');
      }
    }
  };

  const toppingsFiltrados = toppings.filter(t =>
    t.nombre_topping.toLowerCase().includes(busqueda.toLowerCase())
  );

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
        .pf-input:focus { border-color:#FFCC00 !important; box-shadow:0 0 0 3px rgba(255,204,0,0.2) !important; outline:none; }
        .pf-input-icon { background:#f9f9f9 !important; border-color:#ddd !important; color:#888; }
        .pf-badge-count { background:#1a1a1a; color:#FFCC00; font-weight:700; font-size:0.78rem; padding:4px 12px; border-radius:999px; display:inline-block; }
        .pf-btn-act:hover { opacity:0.75; transform:translateY(-1px); }
        .pf-spinner { width:2.5rem; height:2.5rem; border-radius:50%; border:3px solid rgba(255,204,0,0.2); border-top-color:#FFCC00; animation:spin 0.8s linear infinite; margin:0 auto; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ animation: 'slideUp 0.35s ease' }}>
        <h2 className="pf-screen-title">
          <i className="bi bi-stars me-2" />
          Adicionales
        </h2>
        <button
          style={btnPrimary}
          onClick={() => setShowModal(true)}
          onMouseEnter={e => { e.currentTarget.style.background='#FFD93D'; e.currentTarget.style.transform='translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='#FFCC00'; e.currentTarget.style.transform='translateY(0)'; }}
        >
          <i className="bi bi-plus-circle" />
          Nuevo Adicional
        </button>
      </div>

      {/* Buscador + contador */}
      <Card className="pf-card border-0 mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={6}>
              <Form.Label style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '0.88rem' }}>Buscar</Form.Label>
              <InputGroup>
                <InputGroup.Text className="pf-input-icon">
                  <i className="bi bi-search" />
                </InputGroup.Text>
                <Form.Control
                  className="pf-input"
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{ borderColor: '#ddd', borderRadius: '0 8px 8px 0' }}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex align-items-end mt-3 mt-md-0">
              <span className="pf-badge-count">{toppingsFiltrados.length} adicionales encontrados</span>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-5"><div className="pf-spinner" /></div>
      ) : toppingsFiltrados.length === 0 ? (
        <Card className="pf-card border-0">
          <Card.Body className="text-center py-5">
            <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#ccc' }} />
            <h5 className="mt-3" style={{ color: '#888' }}>No hay adicionales</h5>
            <p style={{ color: '#aaa' }}>Agrega tu primer adicional para comenzar</p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="pf-card border-0">
          <Card.Body>
            <div className="table-responsive">
              <Table className="pf-table mb-0">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Precio Adicional</th>
                    <th>Costo Unitario</th>
                    <th className="text-center">Stock</th>
                    <th className="text-center">Mínimo</th>
                    <th className="text-center">Unidad</th>
                    <th className="text-center">Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {toppingsFiltrados.map((topping) => {
                    const stockBajo = topping.stock_actual <= topping.stock_minimo;
                    const precioConvertido = convertirPrecio(topping.precio_adicional_cop, topping.precio_adicional_usd);
                    const costoConvertido  = convertirPrecio(topping.costo_unitario_cop, topping.costo_unitario_usd);

                    return (
                      <tr key={topping.id_topping}>
                        <td style={{ fontWeight: '600' }}>{topping.nombre_topping}</td>
                        <td style={{ color: '#888', fontSize: '0.82rem' }}>{topping.descripcion || '-'}</td>
                        <td>{formatCurrency(precioConvertido.monto, precioConvertido.moneda)}</td>
                        <td>
                          {(topping.costo_unitario_cop || topping.costo_unitario_usd)
                            ? formatCurrency(costoConvertido.monto, costoConvertido.moneda)
                            : '-'}
                        </td>
                        <td className="text-center">
                          <Badge bg={stockBajo ? 'danger' : 'success'}>{topping.stock_actual}</Badge>
                        </td>
                        <td className="text-center" style={{ color: '#888' }}>{topping.stock_minimo}</td>
                        <td className="text-center">
                          <span style={{
                            background: 'rgba(255,204,0,0.15)', color: '#1a1a1a',
                            borderRadius: '6px', padding: '2px 10px',
                            fontSize: '0.78rem', fontWeight: '700'
                          }}>
                            {topping.unidad_medida}
                          </span>
                        </td>
                        <td className="text-center">
                          {!topping.disponible ? (
                            <Badge bg="danger"><i className="bi bi-x-circle me-1" />No disponible</Badge>
                          ) : stockBajo ? (
                            <Badge bg="warning" text="dark"><i className="bi bi-exclamation-triangle me-1" />Stock bajo</Badge>
                          ) : (
                            <Badge bg="success"><i className="bi bi-check-circle me-1" />Normal</Badge>
                          )}
                        </td>
                        <td className="text-end">
                          <button className="pf-btn-act" style={btnOutline('#0ea5e9')} onClick={() => handleAjustarStock(topping)} title="Ajustar Stock">
                            <i className="bi bi-arrow-repeat" />
                          </button>
                          <button className="pf-btn-act" style={btnOutline('#1a1a1a')} onClick={() => handleEdit(topping)} title="Editar">
                            <i className="bi bi-pencil" />
                          </button>
                          <button className="pf-btn-act" style={{ ...btnOutline('#dc2626'), marginRight: 0 }} onClick={() => handleDelete(topping.id_topping)} title="Eliminar">
                            <i className="bi bi-trash" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      <ToppingFormModal show={showModal} onHide={handleCloseModal} topping={toppingEdit} onSaveSuccess={handleSaveSuccess} />
      <AjustarStockModal show={showStockModal} onHide={handleCloseStockModal} topping={toppingStock} onSuccess={handleStockSuccess} />
    </div>
  );
};

export default ToppingsScreen;