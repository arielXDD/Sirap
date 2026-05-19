'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api-client';

interface Tarjeta {
  id: number;
  codigoNfc: string;
  empleadoId: number;
  fechaAsignacion: string;
  activa: boolean;
  empleado?: { id: number; nombre: string; apellidos: string; numeroEmpleado: string };
}

interface Empleado {
  id: number;
  nombre: string;
  apellidos: string;
  numeroEmpleado: string;
  estatus: string;
}

export default function TarjetasNfcPage() {
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCard, setNewCard] = useState({ codigoNfc: '', empleadoId: '' });
  const [reasignarTarget, setReasignarTarget] = useState<Tarjeta | null>(null);
  const [reasignarNuevoCodigo, setReasignarNuevoCodigo] = useState('');

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    try {
      const data = await api.get('/empleados');
      const empleadosArr = Array.isArray(data) ? data : data.data ?? [];
      setEmpleados(empleadosArr);
      const tarjetasDesdeEmpleados: Tarjeta[] = empleadosArr
        .filter((e: any) => e.tarjetaNfc)
        .map((e: any) => ({
          id: e.tarjetaNfc.id,
          codigoNfc: e.tarjetaNfc.codigoNfc,
          empleadoId: e.id,
          fechaAsignacion: e.tarjetaNfc.fechaAsignacion,
          activa: e.tarjetaNfc.activa,
          empleado: { id: e.id, nombre: e.nombre, apellidos: e.apellidos, numeroEmpleado: e.numeroEmpleado },
        }));
      setTarjetas(tarjetasDesdeEmpleados);
    } catch {
      // Error handled by api-client
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarTarjeta = async () => {
    if (!newCard.codigoNfc || !newCard.empleadoId) return;
    try {
      await api.post('/tarjetas-nfc', {
        codigoNfc: newCard.codigoNfc,
        empleadoId: Number(newCard.empleadoId),
      });
      setShowModal(false);
      setNewCard({ codigoNfc: '', empleadoId: '' });
      toast.success('Tarjeta asignada correctamente');
      await fetchEmpleados();
    } catch {
      // Error handled by api-client
    }
  };

  const handleToggle = async (tarjetaId: number) => {
    try {
      await api.patch(`/tarjetas-nfc/${tarjetaId}/toggle`);
      await fetchEmpleados();
    } catch {
      // Error handled by api-client
    }
  };

  const handleReasignar = async () => {
    if (!reasignarTarget || !reasignarNuevoCodigo.trim()) return;
    try {
      await api.patch(`/tarjetas-nfc/${reasignarTarget.id}/reasignar`, {
        codigoNfc: reasignarNuevoCodigo.trim(),
      });
      setReasignarTarget(null);
      setReasignarNuevoCodigo('');
      toast.success('Tarjeta reasignada correctamente');
      await fetchEmpleados();
    } catch {
      // Error handled by api-client
    }
  };

  const activas = tarjetas.filter(t => t.activa).length;
  const inactivas = tarjetas.filter(t => !t.activa).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>Tarjetas NFC</h2>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>Administración y asignación de tarjetas de acceso</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', background: '#1a365d', color: '#fff',
            border: 'none', borderRadius: '0', fontWeight: 600, fontSize: '0.85rem',
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(26,54,93,0.25)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#2c5282')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#1a365d')}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          Asignar Tarjeta
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Total */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0',
          padding: '20px', position: 'relative', display: 'flex', alignItems: 'center', gap: '16px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#3b82f6' }}></div>
          <div style={{
            width: '48px', height: '48px', borderRadius: '0', background: '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6'
          }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="0"/><path d="M2 10h20"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Tarjetas</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{tarjetas.length}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Registradas</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', background: '#f1f5f9', color: '#475569' }}>SISTEMA</span>
            </div>
          </div>
        </div>

        {/* Activas */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0',
          padding: '20px', position: 'relative', display: 'flex', alignItems: 'center', gap: '16px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#10b981' }}></div>
          <div style={{
            width: '48px', height: '48px', borderRadius: '0', background: '#ecfdf5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981'
          }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activas</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', lineHeight: 1 }}>{activas}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>En uso</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', background: '#ecfdf5', color: '#059669' }}>OK</span>
            </div>
          </div>
        </div>

        {/* Inactivas */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0',
          padding: '20px', position: 'relative', display: 'flex', alignItems: 'center', gap: '16px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#ef4444' }}></div>
          <div style={{
            width: '48px', height: '48px', borderRadius: '0', background: '#fef2f2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444'
          }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inactivas</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7f1d1d', lineHeight: 1 }}>{inactivas}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Sin uso</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', background: '#fef2f2', color: '#dc2626' }}>OFF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Tarjetas */}
      <div style={{
        borderRadius: '0', background: '#fff', border: '1px solid #e5e7eb',
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" fill="none" stroke="#1a365d" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="0"/><path d="M12 12h.01"/><path d="M8 12h.01"/><path d="M16 12h.01"/>
            </svg>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>Tarjetas Registradas</h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
            {tarjetas.length} {tarjetas.length === 1 ? 'tarjeta' : 'tarjetas'}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{
              width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#3b82f6',
              borderRadius: '0', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
            }}></div>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Cargando tarjetas...</p>
          </div>
        ) : tarjetas.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ margin: '0 auto 16px', width: '64px', height: '64px', borderRadius: '0', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" fill="none" stroke="#9ca3af" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="2" y="5" width="20" height="14" rx="0"/><path d="M2 10h20"/>
              </svg>
            </div>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              No hay tarjetas asignadas
            </p>
            <p style={{ fontSize: '0.82rem', color: '#9ca3af', maxWidth: '340px', margin: '0 auto' }}>
              Presiona &quot;Asignar Tarjeta&quot; para vincular una tarjeta NFC a un empleado del sistema.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CÓDIGO NFC</th>
                <th style={{ textAlign: 'left', padding: '16px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EMPLEADO</th>
                <th style={{ textAlign: 'left', padding: '16px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>FECHA ASIGNACIÓN</th>
                <th style={{ textAlign: 'center', padding: '16px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ESTADO</th>
                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {tarjetas.map((tarjeta, index) => (
                <tr key={tarjeta.id} style={{ borderTop: '1px solid #f3f4f6', background: index % 2 === 0 ? '#fff' : '#fafbfc', transition: 'background 0.15s' }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#f0f4ff')}
                  onMouseOut={(e) => (e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#fafbfc')}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <code style={{
                      background: '#f8fafc', padding: '6px 12px', borderRadius: '0',
                      border: '1px solid #e2e8f0',
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.8rem',
                      fontWeight: 600, color: '#475569', letterSpacing: '0.04em',
                    }}>
                      {tarjeta.codigoNfc}
                    </code>
                  </td>
                  <td style={{ padding: '16px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>{tarjeta.empleado?.nombre} {tarjeta.empleado?.apellidos}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{tarjeta.empleado?.numeroEmpleado}</div>
                  </td>
                  <td style={{ padding: '16px 16px', fontSize: '0.85rem', color: '#64748b' }}>
                    {new Date(tarjeta.fechaAsignacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ textAlign: 'center', padding: '16px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px', borderRadius: '0', fontSize: '0.7rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.025em',
                      background: tarjeta.activa ? '#ecfdf5' : '#fef2f2',
                      color: tarjeta.activa ? '#059669' : '#dc2626',
                      border: `1px solid ${tarjeta.activa ? '#10b981' : '#ef4444'}22`,
                    }}>
                      {tarjeta.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '14px 24px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleToggle(tarjeta.id)}
                        style={{
                        padding: '6px 12px', borderRadius: '0', border: '1px solid #e5e7eb',
                        background: '#fff', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                        color: tarjeta.activa ? '#dc2626' : '#059669', transition: 'all 0.15s',
                      }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
                      >
                        {tarjeta.activa ? 'Desactivar' : 'Activar'}
                      </button>
                      <button style={{
                        padding: '6px 12px', borderRadius: '0', border: '1px solid #e5e7eb',
                        background: '#fff', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                        color: '#374151', transition: 'all 0.15s',
                      }}
                        onClick={() => { 
                          setReasignarTarget(tarjeta); 
                          setReasignarNuevoCodigo(''); 
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
                      >
                        Reasignar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Empleados sin tarjeta */}
      {(() => {
        const sinTarjeta = empleados.filter(emp => !tarjetas.some(t => t.empleadoId === emp.id));
        if (sinTarjeta.length === 0) return null;
        return (
          <div style={{
            borderRadius: '0', background: '#fffbeb', border: '1px solid #fde68a',
            padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400e' }}>
                {sinTarjeta.length} empleado{sinTarjeta.length !== 1 ? 's' : ''} sin tarjeta NFC asignada
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {sinTarjeta.map(emp => (
                <span key={emp.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 12px', borderRadius: '0', background: '#fff',
                  border: '1px solid #fde68a', fontSize: '0.78rem', color: '#78350f',
                }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#b45309' }}>{emp.numeroEmpleado}</span>
                  {emp.nombre} {emp.apellidos}
                </span>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              maxWidth: '480px', width: '100%', background: '#fff', borderRadius: '0',
              boxShadow: '0 24px 48px rgba(0,0,0,0.15)', overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px 20px', borderBottom: '1px solid #f3f4f6',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Asignar Nueva Tarjeta
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
                  Vincule una tarjeta NFC con un empleado
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: '32px', height: '32px', borderRadius: '0', border: 'none',
                  background: '#f3f4f6', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#6b7280',
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                  Visualización de Tarjeta
                </label>
                
                {/* REPRESENTACIÓN VISUAL DE LA TARJETA */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: 'linear-gradient(135deg, #1e3a5f 0%, #111827 100%)',
                  borderRadius: '0',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '20px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}>
                  {/* Patrón de fondo sutil */}
                  <div style={{
                    position: 'absolute', inset: 0, opacity: 0.1,
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                  }}></div>

                  {/* Icono de Chip / NFC */}
                  <div style={{ position: 'absolute', top: '25px', left: '25px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '30px', background: 'linear-gradient(to bottom, #d4af37, #f1d592)', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.2)' }}></div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ opacity: 0.8 }}>
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zM18 6h-5c-1.1 0-2 .9-2 2v2.28c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V8h3v8H8V8h2V6H6v12h12V6z"/>
                    </svg>
                  </div>

                  {/* Texto de la Institución */}
                  <div style={{ position: 'absolute', top: '25px', right: '25px', textAlign: 'right' }}>
                    <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '2px', opacity: 0.9 }}>SRAP</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', fontWeight: 600 }}>CARD ACCESS</div>
                  </div>

                  {/* CÓDIGO NFC (EL INPUT OCULTO ACTUALIZA ESTO) */}
                  <div style={{ 
                    zIndex: 2,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: '1.6rem',
                    color: newCard.codigoNfc ? '#fff' : 'rgba(255,255,255,0.2)',
                    letterSpacing: '0.15em',
                    fontWeight: 700,
                    textShadow: newCard.codigoNfc ? '0 0 15px rgba(255,255,255,0.5)' : 'none',
                    textAlign: 'center'
                  }}>
                    {newCard.codigoNfc || '•••• •••• ••••'}
                  </div>

                  <div style={{ 
                    position: 'absolute', bottom: '25px', left: '25px', 
                    color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    Esperando lectura...
                  </div>
                  
                  {/* Animación de pulso cuando hay código */}
                  {newCard.codigoNfc && (
                    <div style={{
                      position: 'absolute', bottom: '0', left: '0', right: '0', height: '4px',
                      background: '#10b981', boxShadow: '0 0 10px #10b981',
                      animation: 'pulse 2s infinite'
                    }}></div>
                  )}
                </div>

                {/* Input real oculto o estilizado debajo para permitir escritura manual/escaneo */}
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                    Entrada Manual
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="input"
                      value={newCard.codigoNfc}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setNewCard({ ...newCard, codigoNfc: val });
                        const t = tarjetas.find(x => x.codigoNfc === val);
                        if (t) {
                          toast.error(`Esta tarjeta ya pertenece a ${t.empleado?.nombre} ${t.empleado?.apellidos}`);
                        }
                      }}
                      placeholder="Escriba o escanee para ver en la tarjeta..."
                      style={{ paddingLeft: '40px', fontFamily: 'monospace', borderRadius: '0', fontSize: '0.85rem' }}
                      autoFocus
                    />
                    <svg
                      width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    >
                      <rect x="2" y="5" width="20" height="14" rx="0" /><path d="M2 10h20" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Empleado
                </label>
                <select
                  className="input"
                  value={newCard.empleadoId}
                  onChange={(e) => setNewCard({ ...newCard, empleadoId: e.target.value })}
                  style={{ borderRadius: '0' }}
                >
                  <option value="">Seleccione un empleado</option>
                  {empleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.numeroEmpleado} — {emp.nombre} {emp.apellidos}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 28px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 20px', borderRadius: '0', border: '1px solid #e5e7eb',
                  background: '#fff', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', color: '#374151',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAsignarTarjeta}
                disabled={!newCard.codigoNfc || !newCard.empleadoId}
                style={{
                  padding: '10px 20px', borderRadius: '0', border: 'none',
                  background: !newCard.codigoNfc || !newCard.empleadoId ? '#d1d5db' : '#1a365d',
                  color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: !newCard.codigoNfc || !newCard.empleadoId ? 'not-allowed' : 'pointer',
                  boxShadow: !newCard.codigoNfc || !newCard.empleadoId ? 'none' : '0 2px 8px rgba(26,54,93,0.25)',
                }}
              >
                Asignar Tarjeta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reasignar */}
      {reasignarTarget && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: '0', width: '460px', maxWidth: '95vw',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 28px 20px', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>
                  Cambiar Tarjeta NFC
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
                  Empleado: <strong style={{ color: '#1a365d' }}>{reasignarTarget.empleado?.nombre} {reasignarTarget.empleado?.apellidos}</strong>
                </p>
              </div>
              <button onClick={() => { setReasignarTarget(null); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.2rem' }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Tarjeta actual */}
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>Tarjeta actual:</span>
                <code style={{ fontFamily: 'monospace', fontWeight: 700, color: '#dc2626', fontSize: '0.88rem', letterSpacing: '0.05em' }}>
                  {reasignarTarget.codigoNfc}
                </code>
              </div>

              {/* Nuevo código */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Nueva tarjeta NFC
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type="text"
                    placeholder="Pase la tarjeta por el lector o escríbala..."
                    value={reasignarNuevoCodigo}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setReasignarNuevoCodigo(val);
                      const t = tarjetas.find(x => x.codigoNfc === val);
                      if (t && t.id !== reasignarTarget.id) {
                        toast.error(`Esta tarjeta ya pertenece a ${t.empleado?.nombre} ${t.empleado?.apellidos}`);
                      }
                    }}
                    autoFocus
                    style={{ borderRadius: '0', fontFamily: 'monospace', letterSpacing: '0.05em' }}
                  />
                </div>              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setReasignarTarget(null); }}
                style={{
                  padding: '10px 20px', borderRadius: '0', border: '1px solid #e5e7eb',
                  background: '#fff', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', color: '#374151',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleReasignar}
                disabled={!reasignarNuevoCodigo.trim() || reasignarNuevoCodigo.trim() === reasignarTarget.codigoNfc}
                style={{
                  padding: '10px 20px', borderRadius: '0', border: 'none',
                  background: (!reasignarNuevoCodigo.trim() || reasignarNuevoCodigo.trim() === reasignarTarget.codigoNfc) ? '#d1d5db' : '#1a365d',
                  color: '#fff', fontSize: '0.85rem', fontWeight: 600,
                  cursor: (!reasignarNuevoCodigo.trim() || reasignarNuevoCodigo.trim() === reasignarTarget.codigoNfc) ? 'not-allowed' : 'pointer',
                  boxShadow: (!reasignarNuevoCodigo.trim() || reasignarNuevoCodigo.trim() === reasignarTarget.codigoNfc) ? 'none' : '0 2px 8px rgba(26,54,93,0.25)',
                }}
              >
                Guardar Nueva Tarjeta
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
