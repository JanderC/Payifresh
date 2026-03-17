import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.username, formData.password);

    if (result.success) {
      // El useEffect se encargará de redirigir cuando isAuthenticated cambie
    }

    setLoading(false);
  };

  return (
    <div
      className="login-screen min-vh-100 d-flex align-items-center"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #111111 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decoración de fondo con círculos */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 204, 0, 0.12)',
          top: '-100px',
          right: '-100px',
          filter: 'blur(60px)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 204, 0, 0.08)',
          bottom: '-50px',
          left: '-50px',
          filter: 'blur(60px)'
        }}
      />

      <Container style={{ position: 'relative', zIndex: 1 }}>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card
              className="border-0"
              style={{
                background: 'rgba(255, 255, 255, 0.97)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                borderRadius: '16px',
                borderTop: '4px solid #FFCC00'
              }}
            >
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  {/* Logo PAYIFRESH */}
                  <div className="mb-3">
                    <img
                      src="/payifresh.png"
                      alt="PAYIFRESH Logo"
                      style={{
                        maxWidth: '220px',
                        width: '100%',
                        height: 'auto'
                      }}
                    />
                  </div>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                    Sistema de Gestión
                  </p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#1a1a1a', fontWeight: '600' }}>
                      Usuario
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Ingresa tu usuario"
                      required
                      disabled={loading}
                      autoComplete="username"
                      style={{
                        borderColor: '#DDDDDD',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        outline: 'none'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#FFCC00')}
                      onBlur={(e) => (e.target.style.borderColor = '#DDDDDD')}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ color: '#1a1a1a', fontWeight: '600' }}>
                      Contraseña
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Ingresa tu contraseña"
                      required
                      disabled={loading}
                      autoComplete="current-password"
                      style={{
                        borderColor: '#DDDDDD',
                        borderRadius: '8px',
                        padding: '0.75rem'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#FFCC00')}
                      onBlur={(e) => (e.target.style.borderColor = '#DDDDDD')}
                    />
                  </Form.Group>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: '#FFCC00',
                      border: 'none',
                      padding: '0.85rem',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '1rem',
                      color: '#1a1a1a',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 15px rgba(255, 204, 0, 0.4)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.8 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.background = '#FFD93D';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 204, 0, 0.6)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFCC00';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 204, 0, 0.4)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                        />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right"></i>
                        Iniciar Sesión
                      </>
                    )}
                  </button>
                </Form>
              </Card.Body>
            </Card>

            <div className="text-center mt-3">
              <small style={{ color: 'rgba(255, 255, 255, 0.6)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                © 2026 PAYIFRESH. Todos los derechos reservados.
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginScreen;