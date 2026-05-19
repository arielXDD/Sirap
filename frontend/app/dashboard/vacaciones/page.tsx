'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api-client';
import styles from './page.module.css';

export default function VacacionesPage() {
  const [vacaciones, setVacaciones] = useState<any[]>([]);
  const [filter, setFilter] = useState<'mis' | 'todas'>('mis');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [empleado, setEmpleado] = useState<any>(null);
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [busquedaEmpleado, setBusquedaEmpleado] = useState('');
  
  const [newVacacion, setNewVacacion] = useState({
    tipo: 'vacaciones',
    fechaInicio: '',
    fechaFin: '',
    diasSolicitados: 0,
    observaciones: ''
  });

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setEmpleado(user);
      if (user.rol === 'administrador' || user.rol === 'supervisor') {
        setFilter('todas');
      }
    }
  }, []);

  useEffect(() => {
    fetchVacaciones();
  }, [filter]);

  const fetchVacaciones = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      let path = '/vacaciones';
      if (filter === 'mis' && user.empleado?.id) {
        path = `/vacaciones/empleado/${user.empleado.id}`;
      }
      const data = await api.get(path);
      setVacaciones(Array.isArray(data) ? data : data.data ?? []);
    } catch {
      // Error handled by api-client
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      await api.post('/vacaciones', { ...newVacacion, empleadoId: user.empleado?.id || 1 });
      toast.success('Solicitud enviada correctamente');
      setShowModal(false);
      setNewVacacion({ tipo: 'vacaciones', fechaInicio: '', fechaFin: '', diasSolicitados: 0, observaciones: '' });
      fetchVacaciones();
    } catch {
      // Error handled by api-client
    }
  };

  const handleAprobar = async (id: number) => {
    if (!confirm('¿Está seguro de aprobar esta solicitud?')) return;
    try {
      await api.patch(`/vacaciones/${id}/aprobar`);
      toast.success('Solicitud aprobada');
      fetchVacaciones();
    } catch {
      // Error handled by api-client
    }
  };

  const handleRechazar = async (id: number) => {
    if (!confirm('¿Está seguro de rechazar esta solicitud?')) return;
    try {
      await api.patch(`/vacaciones/${id}/rechazar`);
      toast.success('Solicitud rechazada');
      fetchVacaciones();
    } catch {
      // Error handled by api-client
    }
  };

  const isAdmin = empleado?.rol === 'administrador';

  // Filtrar por fecha
  // Calcular días automáticos cuando cambian las fechas
  useEffect(() => {
    if (newVacacion.fechaInicio && newVacacion.fechaFin) {
      const inicio = new Date(newVacacion.fechaInicio);
      const fin = new Date(newVacacion.fechaFin);
      const diffTime = Math.abs(fin.getTime() - inicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays >= 0) {
        setNewVacacion(prev => ({ ...prev, diasSolicitados: diffDays }));
      }
    }
  }, [newVacacion.fechaInicio, newVacacion.fechaFin]);

  const vacacionesFiltradas = vacaciones.filter(v => {
    // Filtro por fecha
    let cumpleFecha = true;
    if (fechaFiltro) {
      const inicio = new Date(v.fechaInicio);
      const fin = new Date(v.fechaFin);
      const filtro = new Date(fechaFiltro);
      cumpleFecha = filtro >= inicio && filtro <= fin;
    }

    // Filtro por nombre de empleado
    let cumpleEmpleado = true;
    if (busquedaEmpleado && v.empleado) {
      const nombreCompleto = `${v.empleado.nombre} ${v.empleado.apellidos}`.toLowerCase();
      cumpleEmpleado = nombreCompleto.includes(busquedaEmpleado.toLowerCase());
    }

    return cumpleFecha && cumpleEmpleado;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gestión de Ausencias</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
          {isAdmin && (
            <div style={{ display: 'flex', background: 'var(--color-bg-alt)', padding: '4px', borderRadius: '0' }}>
              <button 
                className={`btn ${filter === 'mis' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: 'var(--spacing-xs) var(--spacing-md)', fontSize: '0.875rem', borderRadius: '0' }}
                onClick={() => setFilter('mis')}
              >
                Mis Solicitudes
              </button>
              <button 
                className={`btn ${filter === 'todas' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: 'var(--spacing-xs) var(--spacing-md)', fontSize: '0.875rem', borderRadius: '0' }}
                onClick={() => setFilter('todas')}
              >
                Todas
              </button>
            </div>
          )}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nueva Solicitud</button>
        </div>
      </div>

      {/* Filtro por fecha */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-md)' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Filtrar por fecha:</label>
        <input 
          type="date" 
          className="input"
          value={fechaFiltro}
          onChange={(e) => setFechaFiltro(e.target.value)}
          style={{ maxWidth: '200px' }}
        />
        {/* Filtro por empleado (solo admin/supervisor) */}
        {isAdmin && (
          <>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginLeft: 'var(--spacing-md)' }}>Empleado:</label>
            <input 
              type="text" 
              className="input"
              placeholder="Buscar por nombre..."
              value={busquedaEmpleado}
              onChange={(e) => setBusquedaEmpleado(e.target.value)}
              style={{ maxWidth: '250px' }}
            />
          </>
        )}

        {(fechaFiltro || busquedaEmpleado) && (
          <button 
            className="btn btn-ghost"
            style={{ fontSize: '0.8rem', padding: '4px 10px' }}
            onClick={() => {
              setFechaFiltro('');
              setBusquedaEmpleado('');
            }}
          >
            Limpiar Filtros
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          {vacacionesFiltradas.length} solicitud{vacacionesFiltradas.length !== 1 ? 'es' : ''}
        </span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              {isAdmin && <th>Empleado</th>}
              <th>Tipo</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Días</th>
              <th>Estado</th>
              {isAdmin && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {vacacionesFiltradas.map((v) => (
              <tr key={v.id}>
                {isAdmin && (
                  <td style={{ fontWeight: 500 }}>{v.empleado?.nombre} {v.empleado?.apellidos}</td>
                )}
                <td>
                  <span style={{ textTransform: 'capitalize', fontSize: '0.85rem', fontWeight: 600 }}>
                    {v.tipo.replace('_', ' ')}
                  </span>
                </td>
                <td>{new Date(v.fechaInicio).toLocaleDateString('es-MX')}</td>
                <td>{new Date(v.fechaFin).toLocaleDateString('es-MX')}</td>
                <td>{v.diasSolicitados}</td>
                <td>
                  <span className={`badge ${
                    v.estado === 'aprobada' ? 'badge-success' : 
                    v.estado === 'pendiente' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {v.estado}
                  </span>
                </td>
                {isAdmin && (
                  <td>
                    {v.estado === 'pendiente' && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button className="btn btn-outline" onClick={() => handleAprobar(v.id)}>Aprobar</button>
                        <button className="btn btn-outline" style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }} onClick={() => handleRechazar(v.id)}>Rechazar</button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {vacacionesFiltradas.length === 0 && !loading && (
          <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            {(fechaFiltro || busquedaEmpleado) ? 'No hay registros que coincidan con los filtros' : 'No hay registros de ausencias'}
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className="card" style={{ maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Registrar Ausencia</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="label">Tipo de Ausencia</label>
                <select 
                  className="input" required
                  value={newVacacion.tipo}
                  onChange={e => setNewVacacion({...newVacacion, tipo: e.target.value})}
                >
                  <option value="vacaciones">Vacaciones</option>
                  <option value="quinquenio">Quinquenio</option>
                  <option value="personal">Personal</option>
                  <option value="salud">Salud</option>
                  <option value="permiso_especial">Permiso Especial</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="label">Fecha Inicio</label>
                <input 
                  type="date" className="input" required 
                  value={newVacacion.fechaInicio}
                  onChange={e => setNewVacacion({...newVacacion, fechaInicio: e.target.value})}
                />
              </div>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="label">Fecha Fin</label>
                <input 
                  type="date" className="input" required 
                  value={newVacacion.fechaFin}
                  onChange={e => setNewVacacion({...newVacacion, fechaFin: e.target.value})}
                />
              </div>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="label">Días Solicitados (Auto)</label>
                <input 
                  type="number" className="input" required readOnly
                  value={newVacacion.diasSolicitados}
                  style={{ backgroundColor: 'var(--color-bg-alt)', cursor: 'not-allowed' }}
                />
              </div>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label className="label">Observaciones</label>
                <textarea 
                  className="input" rows={3}
                  value={newVacacion.observaciones}
                  onChange={e => setNewVacacion({...newVacacion, observaciones: e.target.value})}
                ></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Enviar Solicitud</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
