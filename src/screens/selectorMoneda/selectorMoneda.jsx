import { Badge } from 'react-bootstrap';
import { useMoneda } from '../../context/MonedaContext';

const SelectorMoneda = () => {
  const { monedaActual, cambiarMoneda, tasaBCV, loadingTasa } = useMoneda();

  const monedas = [
    { codigo: 'COP', nombre: 'Pesos',     icono: 'currency-dollar' },
    { codigo: 'VES', nombre: 'Bolívares', icono: 'cash-coin' },
    { codigo: 'USD', nombre: 'Dólares',   icono: 'currency-exchange' },
  ];

  return (
    <div className="d-flex align-items-center gap-3">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .pf-moneda-btn {
          padding: 6px 14px;
          border-radius: 8px;
          border: 1.5px solid #ddd;
          background: #fff;
          color: #444;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.18s ease;
          white-space: nowrap;
        }
        .pf-moneda-btn:hover {
          border-color: rgba(255,204,0,0.4);
          background: rgba(255,204,0,0.06);
          color: #1a1a1a;
        }
        .pf-moneda-btn.active {
          background: #1a1a1a;
          border-color: #1a1a1a;
          color: #FFCC00;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .pf-moneda-group {
          display: flex;
          gap: 4px;
        }
        .pf-tasa-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(2,132,199,0.1);
          border: 1px solid rgba(2,132,199,0.25);
          color: #0284c7;
          border-radius: 999px;
          padding: 4px 12px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .pf-spinner-xs {
          width: 14px; height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(255,204,0,0.2);
          border-top-color: #FFCC00;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
      `}</style>

      <div className="pf-moneda-group">
        {monedas.map((moneda) => (
          <button
            key={moneda.codigo}
            className={`pf-moneda-btn ${monedaActual === moneda.codigo ? 'active' : ''}`}
            onClick={() => cambiarMoneda(moneda.codigo)}
          >
            <i className={`bi bi-${moneda.icono}`} />
            {moneda.nombre}
          </button>
        ))}
      </div>

      {monedaActual === 'VES' && tasaBCV && (
        <span className="pf-tasa-badge">
          <i className="bi bi-graph-up-arrow" />
          Tasa BCV: Bs. {tasaBCV.toFixed(2)}
        </span>
      )}

      {loadingTasa && monedaActual === 'VES' && (
        <div className="pf-spinner-xs" title="Cargando tasa..." />
      )}
    </div>
  );
};

export default SelectorMoneda;