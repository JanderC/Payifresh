import { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, Row, Col, Modal } from 'react-bootstrap';
import { saboresService } from '../../api/services/saboresService';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/formatters';
import { useMoneda } from '../../context/MonedaContext';

const SaboresScreen = () => {
  const [sabores, setSabores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saborActual, setSaborActual] = useState(null);
  const [formData, setFormData] = useState({
    nombre_sabor: '',
    descripcion: '',
    precio_adicional_cop: '0.00',
    precio_adicional_usd: '0.00'
  });
  const [errors, setErrors] = useState({});
  const [filtroDisponible, setFiltroDisponible] = useState('');
  const { convertirPrecio } = useMoneda();

  useEffect(() => { loadSabores(); }, [filtroDisponible]);

  const loadSabores = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroDisponible !== '') params.disponible = filtroDisponible;
      const response = await saboresService.getAll(params);
      setSabores(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error al cargar sabores:', error);
      toast.error('Error al cargar sabores');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (sabor = null) => {
    if (sabor) {
      setSaborActual(sabor);
      setFormData({
        nombre_sabor: sabor.nombre_sabor,
        descripcion: sabor.descripcion || '',
        precio_adicional_cop: sabor.precio_adicional_cop || '0.00',
        precio_adicional_usd: sabor.precio_adicional_usd || '0.00'
      });
    } else {
      setSaborActual(null);
      setFormData({ nombre_sabor: '', descripcion: '', precio_adicional_cop: '0.00', precio_adicional_usd: '0.00' });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSaborActual(null);
    setFormData({ nombre_sabor: '', descripcion: '', precio_adicional_cop: '0.00', precio_adicional_usd: '0.00' });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre_sabor.trim()) newErrors.nombre_sabor = 'El nombre es requerido';
    if (!formData.precio_adicional_cop || parseFloat(formData.precio_adicional_cop) < 0) newErrors.precio_adicional_cop = 'El precio en COP no puede ser negativo';
    if (!formData.precio_adicional_usd || parseFloat(formData.precio_adicional_usd) < 0) newErrors.precio_adicional_usd = 'El precio en USD no puede ser negativo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const data = {
        nombre_sabor: formData.nombre_sabor.trim(),
        descripcion: formData.descripcion.trim() || null,
        precio_adicional_cop: parseFloat(formData.precio_adicional_cop),
        precio_adicional_usd: parseFloat(formData.precio_adicional_usd)
      };
      if (saborActual) {
        await saboresService.update(saborActual.id_sabor, data);
        toast.success('Sabor actualizado correctamente');
      } else {
        await saboresService.create(data);
        toast.success('Sabor creado correctamente');
      }
      handleCloseModal();
      loadSabores();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar sabor');
    }
  };

  const handleToggleDisponible = async (sabor) => {
    try {
      await saboresService.update(sabor.id_sabor, { disponible: !sabor.disponible });
      toast.success('Estado actualizado correctamente');
      loadSabores();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este sabor?')) return;
    try {
      await saboresService.delete(id);
      toast.success('Sabor eliminado correctamente');
      loadSabores();
    } catch (error) {
      toast.error('Error al eliminar sabor');
    }
  };

  /* ── estilos reutilizables ── */
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

  const inputStyle = {
    borderColor: '#ddd', borderRadius: '8px', padding: '0.7rem',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

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
        .pf-input:focus { border-color:#FFCC00 !important; box-shadow:0 0 0 3px rgba(255,204,0,0.2) !important; outline:none; }
        .pf-input.is-invalid { border-color:#dc2626 !important; }
        .pf-badge-count { background:#1a1a1a; color:#FFCC00; font-weight:700; font-size:0.78rem; padding:4px 12px; border-radius:999px; display:inline-block; }
        .pf-spinner { width:1.3rem; height:1.3rem; border-radius:50%; border:2.5px solid rgba(255,204,0,0.2); border-top-color:#FFCC00; animation:spin 0.8s linear infinite; display:inline-block; vertical-align:middle; margin-right:8px; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .pf-btn-act:hover { opacity:0.75; transform:translateY(-1px); }
        .pf-switch input:checked { background-color:#FFCC00 !important; border-color:#FFCC00 !important; }
        .pf-modal .modal-content { border-radius:16px !important; border:none !important; box-shadow:0 20px 60px rgba(0,0,0,0.18) !important; overflow:hidden; }
        .pf-modal .modal-header { background:#1a1a1a; border-bottom:2px solid #FFCC00; padding:1rem 1.5rem; }
        .pf-modal .modal-title { color:#fff !important; font-family:'Arial Black',sans-serif; font-weight:900; font-size:1rem; text-transform:uppercase; display:flex; align-items:center; gap:8px; }
        .pf-modal .modal-title i { color:#FFCC00; }
        .pf-modal .btn-close { filter:invert(1) brightness(2); }
        .pf-modal .modal-body { padding:1.5rem; }
        .pf-modal .modal-footer { padding:1rem 1.5rem; border-top:1px solid rgba(0,0,0,0.08); background:#f9f9f9; }
        .pf-modal .form-label { font-weight:600; color:#1a1a1a; font-size:0.88rem; }
        .pf-modal .form-text { color:#888; font-size:0.78rem; }
        .pf-prices-box { background:#f9f9f9; border:1.5px solid rgba(255,204,0,0.2); border-radius:12px; padding:1rem 1.2rem; margin-bottom:1rem; }
        .pf-prices-box h6 { font-family:'Arial Black',sans-serif; font-weight:900; font-size:0.88rem; color:#1a1a1a; margin-bottom:0.75rem; text-transform:uppercase; }
        .pf-prices-box h6 i { color:#FFCC00; }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ animation: 'slideUp 0.35s ease' }}>
        <h2 className="pf-screen-title">
          <i className="bi bi-ice-cream me-2" />
          Gestión de Sabores
        </h2>
        <button
          style={btnPrimary}
          onClick={() => handleShowModal()}
          onMouseEnter={e => { e.currentTarget.style.background='#FFD93D'; e.currentTarget.style.transform='translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='#FFCC00'; e.currentTarget.style.transform='translateY(0)'; }}
        >
          <i className="bi bi-plus-circle" />
          Nuevo Sabor
        </button>
      </div>

      <Card className="pf-card border-0">
        <Card.Body>
          {/* Filtros */}
          <Row className="mb-3 align-items-center">
            <Col md={4}>
              <Form.Select
                className="pf-select"
                value={filtroDisponible}
                onChange={(e) => setFiltroDisponible(e.target.value)}
                style={{ borderColor: '#ddd', borderRadius: '8px' }}
              >
                <option value="">Todos los sabores</option>
                <option value="true">Solo disponibles</option>
                <option value="false">Solo no disponibles</option>
              </Form.Select>
            </Col>
            <Col md={8} className="text-end">
              <span className="pf-badge-count">{sabores.length} sabores encontrados</span>
            </Col>
          </Row>

          {/* Tabla */}
          <div className="table-responsive">
            <Table className="pf-table mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Precio Adicional</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4" style={{ color: '#888' }}>
                      <div className="pf-spinner" />
                      Cargando sabores...
                    </td>
                  </tr>
                ) : sabores.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: '#ccc', display: 'block', marginBottom: '0.5rem' }} />
                      <span style={{ color: '#aaa', fontSize: '0.9rem' }}>No hay sabores registrados</span>
                    </td>
                  </tr>
                ) : (
                  sabores.map((sabor) => {
                    const precioConvertido = convertirPrecio(sabor.precio_adicional_cop, sabor.precio_adicional_usd);
                    return (
                      <tr key={sabor.id_sabor}>
                        <td style={{ fontWeight: '700' }}>{sabor.nombre_sabor}</td>
                        <td style={{ color: '#888', fontSize: '0.82rem' }}>{sabor.descripcion || 'Sin descripción'}</td>
                        <td>
                          <span style={{
                            background: 'rgba(255,204,0,0.12)', color: '#1a1a1a',
                            borderRadius: '6px', padding: '2px 10px',
                            fontSize: '0.78rem', fontWeight: '700'
                          }}>
                            {formatCurrency(precioConvertido.monto, precioConvertido.moneda)}
                          </span>
                        </td>
                        <td>
                          <Form.Check
                            className="pf-switch"
                            type="switch"
                            checked={sabor.disponible}
                            onChange={() => handleToggleDisponible(sabor)}
                            label={
                              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: sabor.disponible ? '#16a34a' : '#888' }}>
                                {sabor.disponible ? 'Disponible' : 'No disponible'}
                              </span>
                            }
                          />
                        </td>
                        <td className="text-end">
                          <button className="pf-btn-act" style={btnOutline('#1a1a1a')} onClick={() => handleShowModal(sabor)} title="Editar">
                            <i className="bi bi-pencil" />
                          </button>
                          <button className="pf-btn-act" style={{ ...btnOutline('#dc2626'), marginRight: 0 }} onClick={() => handleDelete(sabor.id_sabor)} title="Eliminar">
                            <i className="bi bi-trash" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg" dialogClassName="pf-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-ice-cream" />
            {saborActual ? 'Editar Sabor' : 'Nuevo Sabor'}
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Sabor *</Form.Label>
              <Form.Control
                className={`pf-input ${errors.nombre_sabor ? 'is-invalid' : ''}`}
                type="text"
                name="nombre_sabor"
                value={formData.nombre_sabor}
                onChange={handleChange}
                placeholder="Ej: Vainilla Francesa"
                style={inputStyle}
              />
              {errors.nombre_sabor && (
                <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px' }}>{errors.nombre_sabor}</div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                className="pf-input"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción del sabor..."
                style={inputStyle}
              />
            </Form.Group>

            <div className="pf-prices-box">
              <h6><i className="bi bi-cash-stack me-2" />Precios Adicionales</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Precio en Pesos (COP) *</Form.Label>
                    <Form.Control
                      className={`pf-input ${errors.precio_adicional_cop ? 'is-invalid' : ''}`}
                      type="number"
                      step="0.01"
                      name="precio_adicional_cop"
                      value={formData.precio_adicional_cop}
                      onChange={handleChange}
                      placeholder="0.00"
                      style={inputStyle}
                    />
                    <Form.Text>Costo extra en pesos colombianos (0 si no aplica)</Form.Text>
                    {errors.precio_adicional_cop && (
                      <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px' }}>{errors.precio_adicional_cop}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Precio Referencia (USD) *</Form.Label>
                    <Form.Control
                      className={`pf-input ${errors.precio_adicional_usd ? 'is-invalid' : ''}`}
                      type="number"
                      step="0.01"
                      name="precio_adicional_usd"
                      value={formData.precio_adicional_usd}
                      onChange={handleChange}
                      placeholder="0.00"
                      style={inputStyle}
                    />
                    <Form.Text>Usado para conversión a bolívares</Form.Text>
                    {errors.precio_adicional_usd && (
                      <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px' }}>{errors.precio_adicional_usd}</div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              onClick={handleCloseModal}
              style={{ background: '#f0f0f0', border: 'none', color: '#444', fontWeight: '700', borderRadius: '8px', padding: '0.6rem 1.4rem', cursor: 'pointer', fontSize: '0.9rem' }}
              onMouseEnter={e => e.currentTarget.style.background='#e0e0e0'}
              onMouseLeave={e => e.currentTarget.style.background='#f0f0f0'}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{ ...btnPrimary, boxShadow: '0 4px 12px rgba(255,204,0,0.35)' }}
              onMouseEnter={e => { e.currentTarget.style.background='#FFD93D'; e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#FFCC00'; e.currentTarget.style.transform='translateY(0)'; }}
            >
              {saborActual ? 'Actualizar' : 'Crear'}
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default SaboresScreen;