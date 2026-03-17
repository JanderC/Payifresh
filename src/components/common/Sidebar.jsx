import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RUTAS_ADMIN, RUTAS_BARISTA } from '../../utils/constants';

const Sidebar = ({ showMobile, onHideMobile, collapsed }) => {
  const { isAdmin, user } = useAuth();
  const location = useLocation();
  const rutas = isAdmin ? RUTAS_ADMIN : RUTAS_BARISTA;

  const handleNavClick = () => {
    if (window.innerWidth < 992 && onHideMobile) onHideMobile();
  };

  return (
    <>
      <style>{`
        /* =============================================
           OVERLAY — solo móvil
           ============================================= */
        .sb-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(3px);
          z-index: 1040;
          animation: sb-fade-in 0.2s ease;
        }
        @keyframes sb-fade-in { from { opacity: 0; } to { opacity: 1; } }

        /* =============================================
           PANEL
           ============================================= */
        .sb-panel {
          background: #fff;
          border-right: 1px solid rgba(255,215,0,0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: calc(100vh - 60px);
          width: 260px;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sb-panel.desktop-collapsed {
          width: 64px;
        }

        @media (max-width: 991px) {
          .sb-panel {
            position: fixed !important;
            top: 60px !important;
            left: 0 !important;
            height: calc(100vh - 60px) !important;
            width: 260px !important;
            z-index: 1045;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        box-shadow 0.3s ease !important;
          }
          .sb-panel.mobile-open {
            transform: translateX(0) !important;
            box-shadow: 8px 0 40px rgba(0,0,0,0.2);
          }
        }

        .sb-panel::-webkit-scrollbar { width: 3px; }
        .sb-panel::-webkit-scrollbar-track { background: transparent; }
        .sb-panel::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.3); border-radius: 4px; }

        /* =============================================
           HEADER DEL SIDEBAR
           ============================================= */
        .sb-header {
          background: #1a1a1a;
          border-bottom: 2px solid #FFD700;
          padding: 16px;
          position: relative;
          flex-shrink: 0;
          overflow: hidden;
          min-height: 76px;
          display: flex;
          align-items: center;
        }

        .sb-close-btn {
          position: absolute; top: 10px; right: 10px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px; width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #fff; transition: all 0.15s ease;
          flex-shrink: 0;
        }
        .sb-close-btn:hover {
          background: rgba(255,215,0,0.2);
          border-color: rgba(255,215,0,0.5);
        }

        .sb-avatar {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #FFD700, #E6C200);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-weight: 400;
          font-size: 1.15rem; color: #1a1a1a;
          box-shadow: 0 4px 12px rgba(255,215,0,0.4);
          flex-shrink: 0;
          transition: all 0.3s ease;
          letter-spacing: 0.03em;
        }

        .sb-user-info {
          margin-left: 10px;
          overflow: hidden;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        .sb-user-name {
          font-family: 'Bebas Neue', sans-serif; font-weight: 400;
          font-size: 1rem; color: #fff; line-height: 1.2;
          overflow: hidden; text-overflow: ellipsis;
          letter-spacing: 0.05em;
        }
        .sb-user-role {
          font-family: 'DM Sans', sans-serif; font-size: 0.7rem;
          color: rgba(255,215,0,0.9);
          text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;
        }

        .sb-panel.desktop-collapsed .sb-user-info {
          opacity: 0;
          width: 0;
          margin-left: 0;
          pointer-events: none;
        }
        .sb-panel.desktop-collapsed .sb-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          font-size: 0.95rem;
        }

        /* =============================================
           SECCIÓN MARCA (debajo del header)
           ============================================= */
        .sb-brand {
          background: #1a1a1a;
          padding: 8px 16px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid rgba(255,215,0,0.12);
          flex-shrink: 0;
          overflow: hidden;
          transition: padding 0.3s ease;
        }
        .sb-brand-icon {
          font-size: 1.1rem;
          color: #FFD700;
          flex-shrink: 0;
        }
        .sb-brand-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.05rem;
          letter-spacing: 0.1em;
          color: #fff;
          white-space: nowrap;
          transition: opacity 0.2s ease;
        }
        .sb-brand-name span {
          color: #FFD700;
        }
        .sb-panel.desktop-collapsed .sb-brand {
          justify-content: center;
          padding: 8px 0 12px;
        }
        .sb-panel.desktop-collapsed .sb-brand-name {
          opacity: 0;
          width: 0;
          overflow: hidden;
        }

        /* =============================================
           NAVEGACIÓN
           ============================================= */
        .sb-nav { padding: 10px 8px; flex: 1; overflow-y: auto; overflow-x: hidden; }
        .sb-nav::-webkit-scrollbar { width: 0; }

        .sb-section-label {
          font-family: 'DM Sans', sans-serif; font-size: 0.62rem;
          font-weight: 700; color: #aaa;
          text-transform: uppercase; letter-spacing: 0.12em;
          padding: 0 8px; margin-bottom: 4px; margin-top: 4px;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.2s ease;
        }
        .sb-panel.desktop-collapsed .sb-section-label {
          opacity: 0;
          height: 0;
          margin: 0;
          padding: 0;
        }

        .sb-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          margin-bottom: 2px;
          text-decoration: none !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          color: #444 !important;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          border: 1px solid transparent;
          white-space: nowrap;
          overflow: hidden;
        }
        .sb-item:hover {
          background: rgba(255,215,0,0.1);
          border-color: rgba(255,215,0,0.3);
          color: #1a1a1a !important;
        }
        .sb-item.active {
          background: #1a1a1a;
          border-color: #1a1a1a;
          color: #FFD700 !important;
          font-weight: 700;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        }
        .sb-item.active::before {
          content: '';
          position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 3px;
          background: #FFD700;
          border-radius: 0 3px 3px 0;
        }

        .sb-icon {
          font-size: 1.15rem;
          min-width: 22px;
          text-align: center;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .sb-item:hover .sb-icon { transform: scale(1.1); }
        .sb-item.active .sb-icon { color: #FFD700; }

        .sb-label {
          transition: opacity 0.2s ease, width 0.3s ease;
          overflow: hidden;
        }

        .sb-panel.desktop-collapsed .sb-item {
          padding: 10px;
          justify-content: center;
          gap: 0;
        }
        .sb-panel.desktop-collapsed .sb-label {
          opacity: 0;
          width: 0;
          pointer-events: none;
        }
        .sb-panel.desktop-collapsed .sb-item.active::before {
          top: 15%; bottom: 15%;
        }

        /* Tooltip al hover cuando colapsado */
        .sb-panel.desktop-collapsed .sb-item {
          position: relative;
        }
        .sb-panel.desktop-collapsed .sb-item:hover::after {
          content: attr(data-label);
          position: absolute;
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          background: #1a1a1a;
          color: #FFD700;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 8px;
          white-space: nowrap;
          z-index: 2000;
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          pointer-events: none;
          animation: tooltip-in 0.15s ease;
          border: 1px solid rgba(255,215,0,0.3);
        }
        @keyframes tooltip-in {
          from { opacity: 0; transform: translateY(-50%) translateX(-4px); }
          to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }

        /* =============================================
           SEPARADOR DE SECCIÓN
           ============================================= */
        .sb-divider {
          height: 1px;
          background: rgba(255,215,0,0.12);
          margin: 6px 8px;
          transition: opacity 0.2s ease;
        }
        .sb-panel.desktop-collapsed .sb-divider {
          margin: 6px 4px;
        }

        /* =============================================
           FOOTER
           ============================================= */
        .sb-footer {
          padding: 12px 16px;
          border-top: 1px solid rgba(255,215,0,0.15);
          background: #f9f9f9;
          flex-shrink: 0;
          overflow: hidden;
          transition: padding 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .sb-footer-text {
          font-family: 'DM Sans', sans-serif; font-size: 0.68rem;
          color: #aaa; text-align: center; white-space: nowrap;
          transition: opacity 0.2s ease;
        }
        .sb-panel.desktop-collapsed .sb-footer {
          padding: 12px 0;
        }
        .sb-panel.desktop-collapsed .sb-footer-text {
          opacity: 0;
          width: 0;
          overflow: hidden;
        }
        .sb-footer-icon {
          font-size: 0.85rem;
          color: #FFD700;
          flex-shrink: 0;
        }
      `}</style>

      {/* Overlay móvil */}
      {showMobile && (
        <div className="sb-overlay d-lg-none" onClick={onHideMobile} />
      )}

      {/* Panel principal */}
      <div className={[
        'sb-panel',
        showMobile ? 'mobile-open' : '',
        collapsed ? 'desktop-collapsed' : '',
      ].join(' ')}>

        {/* Header — usuario */}
        <div className="sb-header">
          <button className="sb-close-btn d-lg-none" onClick={onHideMobile}>
            <i className="bi bi-x" style={{ fontSize: '1rem' }} />
          </button>
          <div className="sb-avatar">
            {user?.nombre_completo?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          <div className="sb-user-info">
            <div className="sb-user-name">{user?.nombre_completo || 'Usuario'}</div>
            <div className="sb-user-role">
              {isAdmin ? 'Administrador' : 'Barista'}
            </div>
          </div>
        </div>

        {/* Marca */}
        <div className="sb-brand">
          <i className="bi bi-cup-straw sb-brand-icon" />
          <span className="sb-brand-name">PAYI<span>FRESH</span></span>
        </div>

        {/* Nav */}
        <nav className="sb-nav">

          {/* Ventas */}
          <div className="sb-section-label">Ventas</div>
          {rutas
            .filter(r => ['/ventas', '/ventas/lista', '/pedidos'].includes(r.path))
            .map((ruta) => {
              const isActive = location.pathname === ruta.path;
              return (
                <Link
                  key={ruta.path}
                  to={ruta.path}
                  onClick={handleNavClick}
                  className={`sb-item ${isActive ? 'active' : ''}`}
                  data-label={ruta.name}
                >
                  <i className={`bi ${ruta.icon} sb-icon`} />
                  <span className="sb-label">{ruta.name}</span>
                </Link>
              );
            })}

          {isAdmin && (
            <>
              <div className="sb-divider" />

              {/* Menú / Productos */}
              <div className="sb-section-label">Menú</div>
              {rutas
                .filter(r => ['/productos', '/toppings', '/siropes'].includes(r.path))
                .map((ruta) => {
                  const isActive = location.pathname === ruta.path;
                  return (
                    <Link
                      key={ruta.path}
                      to={ruta.path}
                      onClick={handleNavClick}
                      className={`sb-item ${isActive ? 'active' : ''}`}
                      data-label={ruta.name}
                    >
                      <i className={`bi ${ruta.icon} sb-icon`} />
                      <span className="sb-label">{ruta.name}</span>
                    </Link>
                  );
                })}

              <div className="sb-divider" />

              {/* Finanzas / Reportes */}
              <div className="sb-section-label">Finanzas</div>
              {rutas
                .filter(r => ['/caja', '/tasas', '/reportes', '/dashboard'].includes(r.path))
                .map((ruta) => {
                  const isActive = location.pathname === ruta.path;
                  return (
                    <Link
                      key={ruta.path}
                      to={ruta.path}
                      onClick={handleNavClick}
                      className={`sb-item ${isActive ? 'active' : ''}`}
                      data-label={ruta.name}
                    >
                      <i className={`bi ${ruta.icon} sb-icon`} />
                      <span className="sb-label">{ruta.name}</span>
                    </Link>
                  );
                })}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="sb-footer">
          <i className="bi bi-cup-straw sb-footer-icon" />
          <span className="sb-footer-text">PAYIFRESH · Cafetería</span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;