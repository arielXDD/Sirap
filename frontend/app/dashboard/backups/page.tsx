'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api-client';

interface Backup {
  id: number;
  nombreArchivo: string;
  tamano: number;
  comentario: string;
  fechaCreacion: string;
  usuario: {
    usuario: string;
    empleado: {
      nombre: string;
      apellidos: string;
    };
  };
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [comentario, setComentario] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [timeToDaily, setTimeToDaily] = useState('');
  const [timeToMonthly, setTimeToMonthly] = useState('');

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const data = await api.get('/backups');
      setBackups(data);
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();

    const interval = setInterval(() => {
      const now = new Date();

      // Próximo Respaldo Diario (23:30)
      const daily = new Date(now);
      daily.setHours(23, 30, 0, 0);
      if (now >= daily) daily.setDate(daily.getDate() + 1);
      setTimeToDaily(formatDuration(daily.getTime() - now.getTime()));

      // Próximo Respaldo Mensual (1 de cada mes a las 03:00)
      const monthly = new Date(now.getFullYear(), now.getMonth(), 1, 3, 0, 0, 0);
      if (now >= monthly) monthly.setMonth(monthly.getMonth() + 1);
      setTimeToMonthly(formatDuration(monthly.getTime() - now.getTime()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    parts.push(`${hours.toString().padStart(2, '0')}h`);
    parts.push(`${minutes.toString().padStart(2, '0')}m`);
    parts.push(`${seconds.toString().padStart(2, '0')}s`);
    return parts.join(' ');
  };

  const handleCreateBackup = async () => {
    setIsGenerating(true);
    try {
      await api.post('/backups', { comentario });
      toast.success('Respaldo generado exitosamente');
      setComentario('');
      fetchBackups();
    } catch (error) {
      toast.error('Error al generar el respaldo');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este respaldo? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/backups/${id}`);
      toast.success('Respaldo eliminado');
      fetchBackups();
    } catch (error) {
      toast.error('Error al eliminar el respaldo');
    }
  };

  const handleDownload = async (id: number, filename: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/backups/descargar/${id}`,
        { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
      );
      if (!response.ok) throw new Error('Error al descargar');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Error al descargar el archivo');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredBackups = backups.filter(b =>
    b.nombreArchivo.toLowerCase().includes(filtroNombre.toLowerCase()) ||
    (b.comentario && b.comentario.toLowerCase().includes(filtroNombre.toLowerCase()))
  );

  const c = { primary: '#0f172a', accent: '#2563eb', border: '#e2e8f0', bg: '#f8fafc' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Generate Section */}
      <div style={{
        padding: '32px', background: '#fff', borderRadius: '12px', border: `1px solid ${c.border}`,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '20px',
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: c.primary, marginBottom: '8px' }}>
            Gestión de Respaldos
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Genera y administra copias de seguridad completas de la base de datos PostgreSQL.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '12px', marginRight: '20px', borderRight: `1px solid ${c.border}`, paddingRight: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Próximo Diario</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: c.accent, fontFamily: 'monospace' }}>{timeToDaily || '--:--:--'}</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Hoy 23:30</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Próximo Mensual</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>{timeToMonthly || '--:--:--'}</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Día 01 03:00</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Nota (opcional)</label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Antes de migración..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              style={{ minWidth: '240px' }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCreateBackup}
            disabled={isGenerating}
            style={{
              height: '42px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '8px',
              background: isGenerating ? '#94a3b8' : c.accent,
            }}
          >
            {isGenerating ? (
              <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"/>
              </svg>
            )}
            {isGenerating ? 'Generando...' : 'Generar Respaldo'}
          </button>
        </div>
      </div>

      {/* History Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${c.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: c.primary }}>Historial de Versiones</h3>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar respaldo..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              style={{
                padding: '8px 12px 8px 36px', borderRadius: '8px',
                border: `1px solid ${c.border}`, fontSize: '0.85rem', width: '260px',
              }}
            />
            <svg style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${c.border}` }}>
                {['Archivo', 'Fecha', 'Generado por', 'Tamaño', 'Acciones'].map((h, i) => (
                  <th key={i} style={{
                    textAlign: i >= 3 ? (i === 3 ? 'center' : 'right') : 'left',
                    padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600,
                    color: '#64748b', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}>
                  <div className="spinner" style={{ margin: '0 auto' }}></div>
                </td></tr>
              ) : filteredBackups.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                  No se encontraron respaldos.
                </td></tr>
              ) : filteredBackups.map((b) => (
                <tr key={b.id} style={{ borderBottom: `1px solid ${c.border}`, transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.accent,
                      }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: c.primary, fontSize: '0.9rem' }}>{b.nombreArchivo}</div>
                        {b.comentario && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.comentario}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#475569', fontSize: '0.85rem' }}>
                    {new Date(b.fechaCreacion).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                      {b.usuario?.empleado?.nombre} {b.usuario?.empleado?.apellidos}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', background: '#f1f5f9',
                      fontSize: '0.75rem', fontWeight: 600, color: '#475569',
                    }}>
                      {formatSize(b.tamano)}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleDownload(b.id, b.nombreArchivo)}
                        style={{
                          padding: '8px', borderRadius: '6px', border: `1px solid ${c.border}`,
                          background: '#fff', color: c.accent, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        title="Descargar SQL"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        style={{
                          padding: '8px', borderRadius: '6px', border: `1px solid ${c.border}`,
                          background: '#fff', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        title="Eliminar Permanente"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
