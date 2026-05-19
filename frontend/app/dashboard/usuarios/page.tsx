'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api-client';

interface Empleado {
  id: number;
  nombre: string;
  apellidos: string;
  puesto: string;
  area: string;
  numeroEmpleado: string;
}

interface Usuario {
  id: number;
  username: string;
  rol: string;
  activo: boolean;
  creadoEn: string;
  bloqueado: boolean;
  intentosFallidos: number;
  empleado: {
    id: number;
    nombre: string;
    apellidos: string;
    puesto: string;
    area: string;
  };
}

const ROL_LABELS: Record<string, { label: string; badge: string }> = {
  administrador: { label: 'Administrador', badge: 'badge-error' },
  supervisor: { label: 'Supervisor', badge: 'badge-warning' },
  empleado: { label: 'Empleado', badge: 'badge-info' },
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'username' | 'nombre' | 'recientes'>('recientes');

  // Modal states
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState<Usuario | null>(null);
  const [modalReset, setModalReset] = useState<Usuario | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formNuevo, setFormNuevo] = useState({ username: '', password: '', rol: 'empleado', empleadoId: '' });
  const [formEditar, setFormEditar] = useState({ username: '', rol: '', activo: true });
  const [formReset, setFormReset] = useState({ password: '', confirm: '' });

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
    if (type === 'success') toast.success(msg);
    else toast.error(msg);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empData, usrData] = await Promise.all([
        api.get('/empleados'),
        api.get('/usuarios'),
      ]);
      setEmpleados(Array.isArray(empData) ? empData : empData.data ?? []);
      setUsuarios(Array.isArray(usrData) ? usrData : usrData.data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Empleados sin usuario asignado
  const empleadosSinUsuario = empleados.filter(emp =>
    !usuarios.some(u => u.empleado?.id === emp.id)
  );

  // ─── CREAR USUARIO ────────────────────────────────────────
  const handleCrear = async () => {
    if (!formNuevo.username || !formNuevo.password || !formNuevo.empleadoId) {
      showFeedback('error', 'Completa todos los campos');
      return;
    }
    setSaving(true);
    try {
      await api.post('/usuarios', {
        username: formNuevo.username,
        password: formNuevo.password,
        rol: formNuevo.rol,
        empleadoId: Number(formNuevo.empleadoId),
      });
      setModalNuevo(false);
      setFormNuevo({ username: '', password: '', rol: 'empleado', empleadoId: '' });
      showFeedback('success', 'Usuario creado exitosamente');
      await fetchData();
    } catch {
      // Error handled by api-client
    } finally {
      setSaving(false);
    }
  };

  // ─── EDITAR USUARIO ───────────────────────────────────────
  const abrirEditar = (usuario: Usuario) => {
    setFormEditar({ username: usuario.username, rol: usuario.rol, activo: usuario.activo });
    setModalEditar(usuario);
  };

  const handleEditar = async () => {
    if (!modalEditar) return;
    setSaving(true);
    try {
      await api.patch(`/usuarios/${modalEditar.id}`, {
        username: formEditar.username,
        rol: formEditar.rol,
        activo: formEditar.activo,
      });
      setModalEditar(null);
      showFeedback('success', 'Usuario actualizado correctamente');
      await fetchData();
    } catch {
      // Error handled by api-client
    } finally {
      setSaving(false);
    }
  };

  // ─── RESETEAR CONTRASEÑA ──────────────────────────────────
  const abrirReset = (usuario: Usuario) => {
    setFormReset({ password: '', confirm: '' });
    setModalReset(usuario);
  };

  const handleReset = async () => {
    if (!modalReset) return;
    if (!formReset.password) { showFeedback('error', 'Ingresa la nueva contraseña'); return; }
    if (formReset.password !== formReset.confirm) { showFeedback('error', 'Las contraseñas no coinciden'); return; }
    setSaving(true);
    try {
      await api.patch(`/usuarios/${modalReset.id}/reset-password`, { password: formReset.password });
      setModalReset(null);
      showFeedback('success', 'Contraseña actualizada exitosamente');
    } catch {
      // Error handled by api-client
    } finally {
      setSaving(false);
    }
  };

  const handleUnlock = async (usuario: Usuario) => {
    try {
      setSaving(true);
      // Obtener el ID del admin actual desde sessionStorage
      const adminData = JSON.parse(sessionStorage.getItem('user') || '{}');
      await api.post(`/auth/unlock-user/${usuario.id}`, { adminId: adminData.id });
      showFeedback('success', `Usuario ${usuario.username} desbloqueado`);
      await fetchData();
    } catch {
      // Error handled by api-client
    } finally {
      setSaving(false);
    }
  };

  const admins   = usuarios.filter(u => u.rol === 'administrador').length;
  const supervisores = usuarios.filter(u => u.rol === 'supervisor').length;
  const empleadosCount = usuarios.filter(u => u.rol === 'empleado').length;
  const inactivos = usuarios.filter(u => !u.activo).length;

  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch = 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.empleado?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.empleado?.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.empleado?.puesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.empleado?.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'todos' || u.rol === filterRole;
    const matchesStatus = filterStatus === 'todos' || 
      (filterStatus === 'activo' ? u.activo : !u.activo);

    return matchesSearch && matchesRole && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'username') return a.username.localeCompare(b.username);
    if (sortBy === 'nombre') {
      const nameA = `${a.empleado?.nombre} ${a.empleado?.apellidos}`.toLowerCase();
      const nameB = `${b.empleado?.nombre} ${b.empleado?.apellidos}`.toLowerCase();
      return nameA.localeCompare(nameB);
    }
    if (sortBy === 'recientes') return b.id - a.id;
    return 0;
  });

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '0',
    border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none',
    background: '#f8fafc', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.78rem', fontWeight: 600,
    color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em',
  };
  const modalOverlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  };
  const modalBox: React.CSSProperties = {
    background: '#fff', borderRadius: '0', boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
    width: '100%', maxWidth: '440px', overflow: 'hidden',
  };
  const modalHeader: React.CSSProperties = {
    padding: '22px 28px 18px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  };
  const modalBody: React.CSSProperties = { padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' };
  const modalFooter: React.CSSProperties = {
    padding: '16px 28px 22px', display: 'flex', gap: '10px', justifyContent: 'flex-end',
  };
  const btnClose: React.CSSProperties = {
    background: '#f1f5f9', border: 'none', borderRadius: '0',
    width: '32px', height: '32px', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.1rem',
  };
  const btnPrimary: React.CSSProperties = {
    padding: '10px 20px', background: '#1a365d', color: '#fff', border: 'none',
    borderRadius: '0', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
    opacity: saving ? 0.6 : 1,
  };
  const btnSecondary: React.CSSProperties = {
    padding: '10px 20px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb',
    borderRadius: '0', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Gestión de Usuarios</h2>
        <button className="btn btn-primary" onClick={() => { setFormNuevo({ username: '', password: '', rol: 'empleado', empleadoId: '' }); setModalNuevo(true); }}>
          + Nuevo Usuario
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={{
          padding: '12px 18px', borderRadius: '0', fontSize: '0.85rem', fontWeight: 500,
          background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: feedback.type === 'success' ? '#16a34a' : '#dc2626',
          border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
        }}>
          {feedback.type === 'success' ? '✓ ' : '✕ '}{feedback.msg}
        </div>
      )}

      {/* Resumen */}
      {!loading && (
        <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          <span><strong style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>{admins}</strong> Administradores</span>
          <span><strong style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>{supervisores}</strong> Supervisores</span>
          <span><strong style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>{empleadosCount}</strong> Empleados</span>
          {inactivos > 0 && <span style={{ color: 'var(--color-error)' }}><strong style={{ fontSize: '1.1rem' }}>{inactivos}</strong> Inactivos</span>}
        </div>
      )}

      {/* Buscador y Filtros */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="card" style={{ marginBottom: '0' }}>
          <input
            type="text"
            className="input"
            placeholder="Buscar por usuario, nombre, puesto o área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', alignSelf: 'center', marginRight: '4px' }}>Rol:</span>
            {['todos', 'administrador', 'supervisor', 'empleado'].map(role => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '0',
                  border: '1px solid',
                  borderColor: filterRole === role ? '#1a365d' : '#e2e8f0',
                  background: filterRole === role ? '#1a365d' : '#fff',
                  color: filterRole === role ? '#fff' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {role === 'todos' ? 'Todos' : ROL_LABELS[role]?.label}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />

          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', alignSelf: 'center', marginRight: '4px' }}>Estado:</span>
            {['todos', 'activo', 'inactivo'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '0',
                  border: '1px solid',
                  borderColor: filterStatus === status ? '#1a365d' : '#e2e8f0',
                  background: filterStatus === status ? '#1a365d' : '#fff',
                  color: filterStatus === status ? '#fff' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', alignSelf: 'center', marginRight: '4px' }}>Ordenar por:</span>
          {[
            { id: 'recientes', label: 'Recientes' },
            { id: 'username', label: 'Usuario' },
            { id: 'nombre', label: 'Nombre' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id as any)}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '0',
                border: '1px solid',
                borderColor: sortBy === opt.id ? '#1a365d' : '#e2e8f0',
                background: sortBy === opt.id ? '#1a365d' : '#fff',
                color: sortBy === opt.id ? '#fff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Cargando usuarios...</div>
        ) : error ? (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-error)' }}>{error}</div>
        ) : usuarios.length === 0 ? (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No hay usuarios registrados</div>
        ) : filteredUsuarios.length === 0 ? (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No se encontraron usuarios para "{searchTerm}"</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Empleado</th>
                <th>Puesto / Área</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <code style={{ background: 'var(--color-surface-hover)', padding: 'var(--spacing-xs) var(--spacing-sm)', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace' }}>
                      {usuario.username}
                    </code>
                  </td>
                  <td style={{ fontWeight: 500 }}>{usuario.empleado?.nombre} {usuario.empleado?.apellidos}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{usuario.empleado?.puesto} — {usuario.empleado?.area}</td>
                  <td>
                    <span className={`badge ${ROL_LABELS[usuario.rol]?.badge || 'badge-info'}`}>
                      {ROL_LABELS[usuario.rol]?.label || usuario.rol}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${usuario.activo ? 'badge-success' : 'badge-error'}`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                      <button className="btn btn-outline" style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.75rem' }}
                        onClick={() => abrirEditar(usuario)}>
                        Editar
                      </button>
                       <button className="btn btn-outline" style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.75rem' }}
                        onClick={() => abrirReset(usuario)}>
                        Resetear Contraseña
                      </button>
                      {usuario.bloqueado && (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.75rem', background: '#dc2626' }}
                          onClick={() => handleUnlock(usuario)}
                          disabled={saving}
                        >
                          Desbloquear
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Permisos por Rol */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>Permisos por Rol</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {[
            { title: 'Administrador', desc: 'Acceso completo al sistema, gestión de usuarios, configuración global' },
            { title: 'Supervisor', desc: 'Gestión de empleados, asistencias, reportes, horarios' },
            { title: 'Empleado', desc: 'Consulta de su asistencia, solicitud de permisos y ausencias' },
          ].map(r => (
            <div key={r.title}>
              <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>{r.title}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MODAL NUEVO USUARIO ─── */}
      {modalNuevo && (
        <div style={modalOverlay} onClick={() => setModalNuevo(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>Nuevo Usuario</div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '3px' }}>Crea un acceso al sistema</div>
              </div>
              <button style={btnClose} onClick={() => setModalNuevo(false)}>×</button>
            </div>
            <div style={modalBody}>
              <div>
                <label style={labelStyle}>Empleado</label>
                <select style={inputStyle} value={formNuevo.empleadoId} onChange={e => setFormNuevo({ ...formNuevo, empleadoId: e.target.value })}>
                  <option value="">Seleccione un empleado</option>
                  {empleadosSinUsuario.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.numeroEmpleado} — {emp.nombre} {emp.apellidos}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Nombre de Usuario</label>
                <input style={inputStyle} type="text" placeholder="ej. jperez" value={formNuevo.username}
                  onChange={e => setFormNuevo({ ...formNuevo, username: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Contraseña</label>
                <input style={inputStyle} type="password" placeholder="••••••••" value={formNuevo.password}
                  onChange={e => setFormNuevo({ ...formNuevo, password: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Rol</label>
                <select style={inputStyle} value={formNuevo.rol} onChange={e => setFormNuevo({ ...formNuevo, rol: e.target.value })}>
                  <option value="empleado">Empleado</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
            </div>
            <div style={modalFooter}>
              <button style={btnSecondary} onClick={() => setModalNuevo(false)}>Cancelar</button>
              <button style={btnPrimary} onClick={handleCrear} disabled={saving}>{saving ? 'Creando...' : 'Crear Usuario'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL EDITAR USUARIO ─── */}
      {modalEditar && (
        <div style={modalOverlay} onClick={() => setModalEditar(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>Editar Usuario</div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '3px' }}>
                  {modalEditar.empleado?.nombre} {modalEditar.empleado?.apellidos}
                </div>
              </div>
              <button style={btnClose} onClick={() => setModalEditar(null)}>×</button>
            </div>
            <div style={modalBody}>
              <div>
                <label style={labelStyle}>Nombre de Usuario</label>
                <input style={inputStyle} type="text" value={formEditar.username}
                  onChange={e => setFormEditar({ ...formEditar, username: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Rol</label>
                <select style={inputStyle} value={formEditar.rol} onChange={e => setFormEditar({ ...formEditar, rol: e.target.value })}>
                  <option value="empleado">Empleado</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <select style={inputStyle} value={formEditar.activo ? 'activo' : 'inactivo'}
                  onChange={e => setFormEditar({ ...formEditar, activo: e.target.value === 'activo' })}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div style={modalFooter}>
              <button style={btnSecondary} onClick={() => setModalEditar(null)}>Cancelar</button>
              <button style={btnPrimary} onClick={handleEditar} disabled={saving}>{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL RESETEAR CONTRASEÑA ─── */}
      {modalReset && (
        <div style={modalOverlay} onClick={() => setModalReset(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>Resetear Contraseña</div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '3px' }}>
                  Usuario: <strong>{modalReset.username}</strong>
                </div>
              </div>
              <button style={btnClose} onClick={() => setModalReset(null)}>×</button>
            </div>
            <div style={modalBody}>
              <div>
                <label style={labelStyle}>Nueva Contraseña</label>
                <input style={inputStyle} type="password" placeholder="••••••••" value={formReset.password}
                  onChange={e => setFormReset({ ...formReset, password: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Confirmar Contraseña</label>
                <input style={inputStyle} type="password" placeholder="••••••••" value={formReset.confirm}
                  onChange={e => setFormReset({ ...formReset, confirm: e.target.value })} />
              </div>
            </div>
            <div style={modalFooter}>
              <button style={btnSecondary} onClick={() => setModalReset(null)}>Cancelar</button>
              <button style={{ ...btnPrimary, background: '#dc2626' }} onClick={handleReset} disabled={saving}>
                {saving ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
