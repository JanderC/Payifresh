import { useState } from 'react';
import { Modal, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';

const ChangePasswordModal = ({ show, onHide }) => {
  const [formData, setFormData] = useState({
    passwordActual: '',
    passwordNuevo: '',
    confirmarPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { changePassword } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.passwordNuevo !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.passwordNuevo.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    const result = await changePassword(formData.passwordActual, formData.passwordNuevo);

    if (result.success) {
      setFormData({ passwordActual: '', passwordNuevo: '', confirmarPassword: '' });
      onHide();
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleClose = () => {
    setFormData({ passwordActual: '', passwordNuevo: '', confirmarPassword: '' });
    setError('');
    onHide();
  };

  const btnStyle = {
    border: 'none',
    borderRadius: '8px',
    padding: '0.6rem 1.4rem',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <>
      <style>{`
        .pf-modal .modal-content {
          border-radius: 16px !important;
          border: none !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2) !important;
          overflow: hidden;
        }
        .pf-modal .modal-header {
          background: #1a1a1a;
          border-bottom: 2px solid #FFCC00;
          padding: 1rem 1.5rem;
        }
        .pf-modal .modal-title {
          color: #fff !important;
          font-family: 'Arial Black', sans-serif;
          font-weight: 900;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pf-modal .modal-title i { color: #FFCC00; }
        .pf-modal .btn-close { filter: invert(1) brightness(2); }
        .pf-modal .modal-body { padding: 1.5rem; }
        .pf-modal .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(0,0,0,0.08);
          background: #f9f9f9;
        }
        .pf-modal .form-label {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 0.88rem;
        }
        .pf-modal .form-control {
          border-color: #ddd;
          border-radius: 8px;
          padding: 0.7rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .pf-modal .form-control:focus {
          border-color: #FFCC00 !important;
          box-shadow: 0 0 0 3px rgba(255,204,0,0.2) !important;
          outline: none;
        }
      `}</style>

      <Modal show={show} onHide={handleClose} centered dialogClassName="pf-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-key"></i>
            Cambiar Contraseña
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert
                style={{
                  background: 'rgba(220,38,38,0.08)',
                  border: '1px solid rgba(220,38,38,0.25)',
                  color: '#dc2626',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Contraseña Actual</Form.Label>
              <Form.Control
                type="password"
                name="passwordActual"
                value={formData.passwordActual}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="passwordNuevo"
                value={formData.passwordNuevo}
                onChange={handleChange}
                required
                disabled={loading}
                minLength={6}
              />
              <Form.Text style={{ color: '#888', fontSize: '0.78rem' }}>
                Mínimo 6 caracteres
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmar Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                ...btnStyle,
                background: '#f0f0f0',
                color: '#444',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e0e0e0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f0f0f0'}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...btnStyle,
                background: '#FFCC00',
                color: '#1a1a1a',
                boxShadow: '0 4px 12px rgba(255,204,0,0.35)',
                opacity: loading ? 0.75 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#FFD93D'; }}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FFCC00'}
            >
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};

export default ChangePasswordModal;