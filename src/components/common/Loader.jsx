const Loader = () => (
  <div className="d-flex justify-content-center align-items-center min-vh-100"
    style={{ background: '#f9f9f9' }}
  >
    <div className="text-center">
      <div
        style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          border: '4px solid rgba(255,204,0,0.2)',
          borderTopColor: '#FFCC00',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto',
        }}
      />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <p className="mt-3" style={{ color: '#888', fontSize: '0.9rem', fontWeight: '600' }}>
        Cargando...
      </p>
    </div>
  </div>
);

export default Loader;