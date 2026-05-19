'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type View = 'login' | 'forgot' | 'forgot-sent';

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('login');

  // — Login
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // — Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotResult, setForgotResult] = useState<{ message: string; preview?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Credenciales inválidas');
      }
      const data = await response.json();
      sessionStorage.setItem('token', data.access_token);
      sessionStorage.setItem('user', JSON.stringify(data.usuario));
      const destino = data.usuario.rol === 'empleado' ? '/dashboard/asistencias' : '/dashboard';
      router.push(destino);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al procesar la solicitud');
      setForgotResult(data);
      setView('forgot-sent');
    } catch (err: any) {
      setForgotError(err.message || 'Error al enviar la solicitud');
    } finally {
      setForgotLoading(false);
    }
  };

  // ─── LOGIN VIEW ────────────────────────────────────────────────────
  if (view === 'login') {
    return (
      <div className={styles.container}>
        <div className={styles.background}></div>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <h1 className={styles.title}>SIRAP</h1>
            <p className={styles.subtitle}>Panel de Administración</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>Usuario</label>
              <input
                type="text" id="username" className={styles.input}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required disabled={loading} placeholder="Ingresa tu usuario"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Contraseña</label>
              <input
                type="password" id="password" className={styles.input}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required disabled={loading} placeholder="Ingresa tu contraseña"
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: '-0.75rem' }}>
              <button
                type="button"
                onClick={() => { setView('forgot'); setError(''); }}
                style={{
                  background: 'none', border: 'none', color: '#2c5282',
                  fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
                  textDecoration: 'underline', padding: 0,
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className={styles.footer}>
            <a href="/" className={styles.backLink}>← Volver al registro de asistencia</a>
          </div>
        </div>
        <div className={styles.copyright}>
          © 2026 SIRAP. Todos los derechos reservados por Ariel Guevara Balderas y José Manuel Villa Aguillón.
        </div>
      </div>
    );
  }

  // ─── FORGOT PASSWORD FORM ────────────────────────────────────────
  if (view === 'forgot') {
    return (
      <div className={styles.container}>
        <div className={styles.background}></div>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <h1 className={styles.title} style={{ fontSize: '1.8rem' }}>Recuperar Contraseña</h1>
            <p className={styles.subtitle}>Ingresa tu correo registrado</p>
          </div>

          <form onSubmit={handleForgot} className={styles.form}>
            {forgotError && <div className={styles.error}>{forgotError}</div>}

            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Recibir enlace de recuperación por:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <div
                  style={{
                    border: '2px solid',
                    borderColor: '#1a365d',
                    background: '#1a365d',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '12px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0-33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/>
                  </svg>
                  Correo Electrónico
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="forgot-email" className={styles.label}>Correo electrónico</label>
              <input
                type="email" id="forgot-email" className={styles.input}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required disabled={forgotLoading}
                placeholder="correo@ejemplo.com"
                autoFocus
              />
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                Ingresa el correo registrado en tu perfil de empleado
              </p>
            </div>

            <button type="submit" className={styles.submitButton} disabled={forgotLoading}>
              {forgotLoading ? 'Enviando...' : 'Enviar Correo de Recuperación'}
            </button>
          </form>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={() => { setView('login'); setForgotEmail(''); setForgotError(''); }}
              className={styles.backLink}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        </div>
        <div className={styles.copyright}>
          © 2026 SIRAP. Todos los derechos reservados por Ariel Guevara Balderas y José Manuel Villa Aguillón.
        </div>
      </div>
    );
  }

  // ─── FORGOT SENT CONFIRMATION ────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className={styles.background}></div>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <div style={{
            width: 64, height: 64, background: '#d1fae5', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', color: '#059669',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor">
              <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0-33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/>
            </svg>
          </div>
          <h1 className={styles.title} style={{ fontSize: '1.5rem' }}>¡Correo Enviado!</h1>
          <p className={styles.subtitle} style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: '0.9rem' }}>
            {forgotResult?.message}
          </p>
        </div>

        {forgotResult?.preview && (
          <div style={{
            background: '#fef3c7', border: '1px solid #f59e0b',
            borderLeft: '4px solid #f59e0b', borderRadius: 6,
            padding: '1rem', marginBottom: '1.5rem',
          }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', marginBottom: 8 }}>
              🔧 MODO DEMO — Enlace de recuperación:
            </p>
            <a
              href={forgotResult.preview}
              style={{
                display: 'block', wordBreak: 'break-all', fontSize: '0.78rem',
                color: '#1e40af', textDecoration: 'underline',
              }}
            >
              {forgotResult.preview}
            </a>
          </div>
        )}

        <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', lineHeight: 1.6 }}>
          El enlace es válido por <strong>15 minutos</strong>.<br />
          Revisa también tu carpeta de spam si no lo encuentras.
        </p>

        <div className={styles.footer}>
          <button
            type="button"
            onClick={() => { setView('login'); setForgotResult(null); }}
            className={styles.backLink}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
      <div className={styles.copyright}>
        © 2026 SIRAP. Todos los derechos reservados por Ariel Guevara Balderas y José Manuel Villa Aguillón.
      </div>
    </div>
  );
}
