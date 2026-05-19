'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';

export default function RecuperacionPage() {
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Ref para poder limpiar el input y permitir subir el mismo archivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    // Reset el valor del input para que el mismo archivo se pueda volver a seleccionar
    if (fileInputRef.current) fileInputRef.current.value = '';
    setRestoreFile(file);
    setResult(null);
    if (file) {
      toast.info(`✅ Archivo cargado: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  const handleOpenModal = () => {
    if (!restoreFile) { toast.warning('Selecciona un archivo .sql primero'); return; }
    setPassword('');
    setPasswordError('');
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!password.trim()) { setPasswordError('Ingresa tu contraseña'); return; }

    setIsRestoring(true);
    setPasswordError('');

    try {
      // 1. Verificar contraseña
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      const loginRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.username, password }),
        }
      );
      if (!loginRes.ok) {
        setPasswordError('Contraseña incorrecta. Operación cancelada.');
        setIsRestoring(false);
        return;
      }

      // 2. Enviar el archivo para restaurar
      const formData = new FormData();
      formData.append('file', restoreFile!);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/backups/restaurar`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al restaurar');

      setShowModal(false);
      setRestoreFile(null);
      setPassword('');
      setResult({ ok: true, msg: data.message || 'Base de datos restaurada correctamente.' });
      toast.success('Base de datos restaurada correctamente');
    } catch (err: any) {
      setResult({ ok: false, msg: err.message || 'Error al restaurar la base de datos' });
      toast.error(err.message || 'Error al restaurar');
    } finally {
      setIsRestoring(false);
    }
  };

  const c = {
    border: '#e2e8f0',
    red: '#ef4444',
    lightRed: '#fef2f2',
    midRed: '#fca5a5',
    text: '#0f172a',
    sub: '#64748b',
  };

  return (
    <>
      <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* ── Header ── */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: c.text, marginBottom: '6px' }}>
            Recuperación de Base de Datos
          </h2>
          <p style={{ color: c.sub, fontSize: '0.9rem' }}>
            Restaura la base de datos a partir de un archivo de respaldo <strong>.sql</strong> generado por SIRAP.
            Esta operación reemplaza todos los datos actuales.
          </p>
        </div>

        {/* ── Advertencia ── */}
        <div style={{
          background: '#fffbeb', border: '1.5px solid #fbbf24',
          borderRadius: '12px', padding: '18px 22px',
          display: 'flex', gap: '14px', alignItems: 'flex-start',
        }}>
          <svg width="22" height="22" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}>
            <path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <div>
            <p style={{ fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>Antes de continuar</p>
            <ul style={{ color: '#78350f', fontSize: '0.82rem', lineHeight: '1.7', paddingLeft: '16px' }}>
              <li>Asegúrate de tener un respaldo actualizado <strong>antes</strong> de restaurar.</li>
              <li>Esta acción <strong>sobreescribirá todos los datos actuales</strong> sin posibilidad de recuperación.</li>
              <li>Se recomienda hacer un respaldo nuevo desde la sección <strong>Respaldos</strong> antes de proceder.</li>
              <li>Se requerirá tu <strong>contraseña de administrador</strong> para confirmar.</li>
            </ul>
          </div>
        </div>

        {/* ── Selección de archivo ── */}
        <div style={{
          background: '#fff', border: `2px dashed ${c.midRed}`,
          borderRadius: '14px', padding: '40px 32px', textAlign: 'center',
        }}>
          <div style={{
            width: '56px', height: '56px', background: c.lightRed,
            borderRadius: '12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <svg width="28" height="28" fill="none" stroke={c.red} strokeWidth="2" viewBox="0 0 24 24">
              <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
          </div>

          {restoreFile ? (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontWeight: 700, color: c.text, marginBottom: '4px' }}>{restoreFile.name}</p>
              <p style={{ fontSize: '0.78rem', color: c.sub }}>
                {(restoreFile.size / 1024).toFixed(1)} KB · Archivo .sql seleccionado
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontWeight: 600, color: c.text, marginBottom: '4px' }}>Selecciona el archivo de respaldo</p>
              <p style={{ fontSize: '0.82rem', color: c.sub }}>Solo se aceptan archivos .sql generados por SIRAP</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <label
              htmlFor="restore-sql-file"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '8px',
                border: `1.5px solid ${c.border}`, background: '#fff',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: '#374151',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
              {restoreFile ? 'Cambiar archivo' : 'Buscar archivo .sql'}
            </label>
            <input
              id="restore-sql-file"
              ref={fileInputRef}
              type="file"
              accept=".sql"
              style={{ display: 'none' }}
              onChange={handleSelectFile}
            />
            {restoreFile && (
              <button
                onClick={() => { setRestoreFile(null); setResult(null); }}
                style={{
                  padding: '10px 16px', borderRadius: '8px',
                  border: `1.5px solid ${c.border}`, background: '#fff',
                  cursor: 'pointer', color: c.sub, fontSize: '0.875rem',
                }}
              >
                Quitar
              </button>
            )}
          </div>
        </div>

        {/* ── Resultado previo ── */}
        {result && (
          <div style={{
            padding: '16px 20px', borderRadius: '10px',
            background: result.ok ? '#f0fdf4' : '#fef2f2',
            border: `1.5px solid ${result.ok ? '#86efac' : c.midRed}`,
            display: 'flex', gap: '12px', alignItems: 'center',
          }}>
            <svg width="20" height="20" fill="none" stroke={result.ok ? '#16a34a' : c.red} strokeWidth="2.5" viewBox="0 0 24 24">
              {result.ok
                ? <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                : <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              }
            </svg>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: result.ok ? '#15803d' : '#b91c1c' }}>
              {result.msg}
            </p>
          </div>
        )}

        {/* ── Botón principal ── */}
        <button
          onClick={handleOpenModal}
          disabled={!restoreFile || isRestoring}
          style={{
            width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
            background: !restoreFile || isRestoring ? c.midRed : c.red,
            color: '#fff', fontWeight: 700, fontSize: '1rem',
            cursor: !restoreFile || isRestoring ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            transition: 'all 0.2s',
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Iniciar Recuperación de Base de Datos
        </button>
      </div>

      {/* ── Modal de contraseña ── */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '20px',
          }}
          onClick={() => { if (!isRestoring) { setShowModal(false); setPasswordError(''); } }}
        >
          <div
            style={{
              background: '#fff', borderRadius: '18px', padding: '36px',
              maxWidth: '460px', width: '100%',
              boxShadow: '0 32px 64px -12px rgba(0,0,0,0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: c.lightRed, margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="32" height="32" fill="none" stroke={c.red} strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: c.text, marginBottom: '8px' }}>
                Confirma tu identidad
              </h3>
              <p style={{ fontSize: '0.84rem', color: c.sub, lineHeight: '1.5' }}>
                Para proteger la integridad de los datos, ingresa tu <strong>contraseña de administrador</strong> para confirmar la restauración de:
              </p>
              <p style={{
                margin: '10px auto 0', padding: '6px 14px', background: '#f8fafc',
                borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.8rem',
                color: '#334155', display: 'inline-block', wordBreak: 'break-all',
              }}>
                {restoreFile?.name}
              </p>
            </div>

            {/* Input contraseña */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', fontSize: '0.82rem', fontWeight: 700,
                color: '#374151', marginBottom: '8px',
              }}>
                🔐 Contraseña de administrador
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                  placeholder="Tu contraseña actual"
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px',
                    borderRadius: '10px', fontSize: '0.9rem',
                    border: passwordError ? `2px solid ${c.red}` : '1.5px solid #d1d5db',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    background: passwordError ? '#fef9f9' : '#fff',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px',
                  }}
                >
                  {showPassword
                    ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
              {passwordError && (
                <p style={{ color: c.red, fontSize: '0.8rem', marginTop: '6px', fontWeight: 500 }}>
                  ⚠️ {passwordError}
                </p>
              )}
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setShowModal(false); setPasswordError(''); setPassword(''); }}
                disabled={isRestoring}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: '1.5px solid #e2e8f0', background: '#fff',
                  color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isRestoring || !password}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  background: isRestoring || !password ? c.midRed : c.red,
                  color: '#fff', fontWeight: 700,
                  cursor: isRestoring || !password ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontSize: '0.9rem',
                }}
              >
                {isRestoring ? (
                  <>
                    <div className="spinner" style={{
                      width: '16px', height: '16px', borderWidth: '2px',
                      borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff',
                    }}></div>
                    Verificando...
                  </>
                ) : (
                  '🔓 Confirmar Restauración'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
