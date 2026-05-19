'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './layout.module.css';

// ─── Mapa de permisos por ruta ───────────────────────────────────────────────
// Define qué roles pueden acceder a cada prefijo de ruta.
// Si la ruta no está en el mapa ==> cualquier usuario autenticado puede entrar.
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Solo admin
  '/dashboard/usuarios':      ['administrador'],
  '/dashboard/tarjetas-nfc':  ['administrador'],
  '/dashboard/backups':       ['administrador'],
  '/dashboard/recuperacion':  ['administrador'],

  // Admin y supervisor
  '/dashboard/empleados':     ['administrador', 'supervisor'],
  '/dashboard/reportes':      ['administrador', 'supervisor'],
  '/dashboard/horarios':      ['administrador', 'supervisor'],
  '/dashboard/dias-festivos': ['administrador', 'supervisor'],

  // Panel principal — admin y supervisor (empleados se redirigen a /asistencias en el login)
  '/dashboard$':              ['administrador', 'supervisor'],

  // Vacaciones/ausencias — admin (gestión completa) y empleado (sus propias)
  '/dashboard/vacaciones':    ['administrador', 'empleado'],

  // Asistencias — todos (sin restricción, no se incluye en el mapa)
};

function canAccess(pathname: string, rol: string): boolean {
  let bestMatch: string | null = null;
  let bestMatchLength = -1;

  for (const route of Object.keys(ROUTE_PERMISSIONS)) {
    const isExact = route.endsWith('$');
    const routePath = isExact ? route.slice(0, -1) : route;

    const matches = isExact
      ? pathname === routePath
      : pathname === routePath || pathname.startsWith(routePath + '/');

    if (matches && routePath.length > bestMatchLength) {
      bestMatch = route;
      bestMatchLength = routePath.length;
    }
  }

  if (!bestMatch) return true; // sin restricción
  return ROUTE_PERMISSIONS[bestMatch].includes(rol);
}

function getRedirectForRole(rol: string): string {
  if (rol === 'empleado') return '/dashboard/asistencias';
  if (rol === 'supervisor') return '/dashboard';
  return '/dashboard';
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = sessionStorage.getItem('token');
    const userData = sessionStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
  }, [router]);

  // Verificar permisos cada vez que cambie la ruta o el usuario
  useEffect(() => {
    if (!user) return;

    if (!canAccess(pathname, user.rol)) {
      setAccessDenied(true);
      // Redirigir automáticamente a la ruta correspondiente al rol
      const redirect = getRedirectForRole(user.rol);
      router.replace(redirect);
    } else {
      setAccessDenied(false);
    }
  }, [pathname, user, router]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  const navClass = (href: string) => {
    const isActive = href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);
    return `${styles.navItem} ${isActive ? styles.navItemActive : ''}`;
  };

  if (!mounted || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Mostrar pantalla de acceso denegado mientras redirige
  if (accessDenied) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', flexDirection: 'column', gap: 16,
        background: '#f8fafc',
      }}>
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0',
          padding: '2.5rem', textAlign: 'center', maxWidth: 400,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            width: 56, height: 56, background: '#fee2e2', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2}
              style={{ width: 28, height: 28 }}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <h2 style={{ color: '#1e293b', marginBottom: 8, fontSize: '1.1rem' }}>Acceso Denegado</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            No tienes permisos para acceder a esta sección. Redirigiendo…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.logo}>SIRAP</h2>
        </div>

        <nav className={styles.nav}>
          {/* 1. Panel de Control — admin y supervisor */}
          {(user.rol === 'administrador' || user.rol === 'supervisor') && (
            <Link href="/dashboard" className={navClass('/dashboard')}>
              <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              <span>Panel de Control</span>
            </Link>
          )}

          {/* 2. Empleados — admin y supervisor */}
          {(user.rol === 'administrador' || user.rol === 'supervisor') && (
            <Link href="/dashboard/empleados" className={navClass('/dashboard/empleados')}>
              <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              <span>Empleados</span>
            </Link>
          )}

          {/* 3. Usuarios — solo admin */}
          {user.rol === 'administrador' && (
            <Link href="/dashboard/usuarios" className={navClass('/dashboard/usuarios')}>
              <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Usuarios</span>
            </Link>
          )}

          {/* 4. Tarjetas NFC — solo admin */}
          {user.rol === 'administrador' && (
            <Link href="/dashboard/tarjetas-nfc" className={navClass('/dashboard/tarjetas-nfc')}>
              <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
              <span>Tarjetas NFC</span>
            </Link>
          )}

          {/* 5. Asistencias — todos los roles */}
          <Link href="/dashboard/asistencias" className={navClass('/dashboard/asistencias')}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            <span>Asistencias</span>
          </Link>

          {/* 6. Reportes — admin y supervisor */}
          {(user.rol === 'administrador' || user.rol === 'supervisor') && (
            <Link href="/dashboard/reportes" className={navClass('/dashboard/reportes')}>
              <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
              </svg>
              <span>Reportes</span>
            </Link>
          )}

          {/* 7. Horarios — admin y supervisor */}
          {(user.rol === 'administrador' || user.rol === 'supervisor') && (
            <Link href="/dashboard/horarios" className={navClass('/dashboard/horarios')}>
              <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              <span>Horarios</span>
            </Link>
          )}

          {/* 8. Días Festivos — admin y supervisor */}
          {(user.rol === 'administrador' || user.rol === 'supervisor') && (
            <Link href="/dashboard/dias-festivos" className={navClass('/dashboard/dias-festivos')}>
              <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              <span>Días Festivos</span>
            </Link>
          )}

          {/* 9. Gestión de Ausencias — admin (gestión); empleado (sus ausencias) */}
          {user.rol === 'administrador' && (
            <Link href="/dashboard/vacaciones" className={navClass('/dashboard/vacaciones')}>
              <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
              <span>Gestión de Ausencias</span>
            </Link>
          )}

          {user.rol === 'empleado' && (
            <Link href="/dashboard/vacaciones" className={navClass('/dashboard/vacaciones')}>
              <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
              <span>Ausencias</span>
            </Link>
          )}

          {/* 10. Respaldos — solo admin */}
          {user.rol === 'administrador' && (
            <Link href="/dashboard/backups" className={navClass('/dashboard/backups')}>
              <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.35 2.01c-.06-.01-.12-.01-.19 0H7.07c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2h10c1.1 0 2-.9 2-2V7.12c0-.53-.21-1.04-.59-1.41l-4.71-4.71c-.37-.37-.88-.58-1.42-.99zm-.35 1.41L17.59 8H13V3.42zM7.07 4h4v5h5v11h-10V4zm1 5v2h8V9h-8zm0 4v2h8v-2h-8zm0 4v2h5v-2h-5z"/>
              </svg>
              <span>Respaldos</span>
            </Link>
          )}

          {/* 11. Recuperación de BD — solo admin */}
          {user.rol === 'administrador' && (
            <Link href="/dashboard/recuperacion" className={navClass('/dashboard/recuperacion')}>
              <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                <path d="M19.07 4.93A10.01 10.01 0 003.93 19.07 10.01 10.01 0 0019.07 4.93zM12 20c-4.41 0-8-3.59-8-8 0-1.84.62-3.53 1.65-4.89L16.89 18.35C15.53 19.38 13.84 20 12 20zm6.35-3.11L7.11 5.65C8.47 4.62 10.16 4 12 4c4.41 0 8 3.59 8 8 0 1.84-.62 3.53-1.65 4.89z"/>
              </svg>
              <span>Recuperación BD</span>
            </Link>
          )}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Sistema de Asistencia</h1>
            <div className={styles.userMenu}>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.empleado.nombre} {user.empleado.apellidos}</span>
                <span className={styles.userRole}>{user.rol}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        <main className={styles.content}>
          {children}
        </main>

        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} SIRAP. Todos los derechos reservados por Ariel Guevara Balderas y José Manuel Villa Aguillón.</p>
        </footer>
      </div>
    </div>
  );
}
