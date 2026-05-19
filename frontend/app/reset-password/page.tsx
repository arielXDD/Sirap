'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('El enlace de recuperación no es válido o ha expirado.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }
    if (password !== confirm) {
      return setError('Las contraseñas no coinciden.');
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al restablecer la contraseña');
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3500);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const strength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;

  const strengthColor = ['#e5e7eb', '#ef4444', '#f59e0b', '#10b981'][strength];
  const strengthLabel = ['', 'Débil', 'Moderada', 'Fuerte'][strength];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)',
    }}>
      <div style={{
        background: 'white', width: '90%', maxWidth: 420,
        padding: '3rem 2.5rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a5f', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e3a5f', margin: '0 0 0.5rem', letterSpacing: '0.05em' }}>
            SIRAP
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Nueva Contraseña
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, background: '#d1fae5', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5} style={{ width: 32, height: 32 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 style={{ color: '#065f46', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
              ¡Contraseña actualizada!
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Tu contraseña ha sido restablecida correctamente.<br/>
              Redirigiendo al inicio de sesión…
            </p>
            <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, marginTop: '1.5rem', overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: '#059669', borderRadius: 2,
                animation: 'progress 3.5s linear forwards',
              }}/>
            </div>
            <style>{`@keyframes progress { from { width: 0 } to { width: 100% } }`}</style>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div style={{
                color: '#dc2626', fontSize: '0.875rem', fontWeight: 500,
                padding: '0.875rem', background: '#fee2e2', borderLeft: '4px solid #dc2626',
              }}>
                {error}
              </div>
            )}

            {token && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                    Nueva Contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required disabled={loading}
                      placeholder="Mínimo 6 caracteres"
                      style={{
                        width: '100%', padding: '0.875rem 3rem 0.875rem 1rem',
                        border: '2px solid #cbd5e1', fontSize: '1rem',
                        background: '#f8fafc', boxSizing: 'border-box', outline: 'none',
                      }}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
                        fontSize: '1.1rem',
                      }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {/* Barra de fuerza */}
                  {password.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 2, background: strengthColor,
                          width: `${(strength / 3) * 100}%`, transition: 'all 0.3s',
                        }}/>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: strengthColor, fontWeight: 600, minWidth: 52 }}>
                        {strengthLabel}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                    Confirmar Contraseña
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required disabled={loading}
                    placeholder="Repite la contraseña"
                    style={{
                      padding: '0.875rem 1rem',
                      border: `2px solid ${confirm && confirm !== password ? '#dc2626' : '#cbd5e1'}`,
                      fontSize: '1rem', background: '#f8fafc', outline: 'none',
                    }}
                  />
                  {confirm && confirm !== password && (
                    <span style={{ fontSize: '0.78rem', color: '#dc2626' }}>Las contraseñas no coinciden</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirm}
                  style={{
                    background: '#1e3a5f', color: 'white',
                    padding: '1rem', border: 'none', fontSize: '1rem',
                    fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    transition: 'all 0.2s', marginTop: '0.5rem',
                    opacity: (!password || !confirm || loading) ? 0.65 : 1,
                  }}
                >
                  {loading ? 'Actualizando…' : 'Restablecer Contraseña'}
                </button>
              </>
            )}

            {!token && (
              <div style={{ textAlign: 'center' }}>
                <a href="/login" style={{ color: '#2c5282', fontSize: '0.875rem', fontWeight: 500 }}>
                  Solicitar un nuevo enlace
                </a>
              </div>
            )}
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <a href="/login" style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>
            ← Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1e3a5f,#2c5282)' }}>
        <div style={{ color: 'white' }}>Cargando…</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
