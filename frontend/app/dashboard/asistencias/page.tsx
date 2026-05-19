'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import api from '../../lib/api-client';
import styles from './page.module.css';

export default function AsistenciasPage() {
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [selectedAsistencia, setSelectedAsistencia] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    horaEntrada: '',
    horaSalida: '',
    estado: '',
    minutosRetardo: 0,
    observaciones: ''
  });

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUserRole(u.rol || '');
    }
    fetchAsistencias();

    // Configuración de WebSockets para actualización en tiempo real
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const socketUrl = apiUrl.replace('/api', '');
    const s = io(`${socketUrl}/nfc`);
    setSocket(s);

    s.on('connect', () => {
      console.log('✅ Conectado al servidor de tiempo real');
    });

    s.on('asistencia_registrada', (data) => {
      console.log('🔄 Sincronizando datos en todas las pestañas...', data);
      fetchAsistencias();
      if (!data.refresh) {
        toast.info(`Cambio detectado: ${data.empleado}`, {
          description: `${data.tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada`,
        });
      }
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const fetchAsistencias = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      let allData: any[] = [];

      if (user.rol === 'empleado' && user.empleado?.id) {
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() - 30);
        const data = await api.get(
          `/asistencias/empleado/${user.empleado.id}?fechaInicio=${fechaInicio.toISOString().split('T')[0]}&fechaFin=${new Date().toISOString().split('T')[0]}&_t=${Date.now()}`
        );
        if (Array.isArray(data)) allData = data;
      } else {
        const fechaFin = new Date().toISOString().split('T')[0];
        const fechaInicioDate = new Date();
        fechaInicioDate.setDate(fechaInicioDate.getDate() - 6);
        const fechaInicio = fechaInicioDate.toISOString().split('T')[0];
        try {
          const data = await api.get(`/asistencias/rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&_t=${Date.now()}`);
          if (Array.isArray(data)) allData = data;
        } catch { /* fallback */ }
      }

      setAsistencias(allData);
    } catch {
      setError('No se pudieron cargar las asistencias');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (filteredData.length === 0) { toast.warning('No hay datos para exportar'); return; }
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const nombreUsuario = user.empleado ? `${user.empleado.nombre} ${user.empleado.apellidos}` : user.username || '';
    const numUsuario = user.empleado?.numeroEmpleado || '';
    const header = 'Fecha,Empleado,No. Empleado,Hora Entrada,Hora Salida,Estado,Min. Retardo';
    const rows = filteredData.map(a => {
      const nombre = a.empleado ? `${a.empleado.nombre} ${a.empleado.apellidos}` : nombreUsuario;
      const num = a.empleado?.numeroEmpleado || numUsuario;
      return `${new Date(a.fecha).toLocaleDateString('es-MX')},${nombre},${num},${a.horaEntrada || '-'},${a.horaSalida || '-'},${a.estado},${a.minutosRetardo || 0}`;
    }).join('\n');
    const csv = `\uFEFFREPORTE DE ASISTENCIAS - SIRAP\nFecha de Generación,${new Date().toLocaleString('es-MX')}\n\n${header}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asistencias_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (filteredData.length === 0) { toast.warning('No hay datos para exportar'); return; }
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const nombreUsuario = user.empleado ? `${user.empleado.nombre} ${user.empleado.apellidos}` : user.username || '';
    const rows = filteredData.map(a => {
      const nombre = a.empleado ? `${a.empleado.nombre} ${a.empleado.apellidos}` : nombreUsuario;
      return `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${new Date(a.fecha).toLocaleDateString('es-MX')}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${nombre}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${a.horaEntrada || '-'}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${a.horaSalida || '-'}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${a.estado}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${a.minutosRetardo > 0 ? a.minutosRetardo + ' min' : '-'}</td>
      </tr>`;
    }).join('');
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error('Permite ventanas emergentes para generar el PDF'); return; }
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Reporte Asistencias SIRAP</title>
      <style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
      body{font-family:'Inter',sans-serif;color:#1a1a2e;margin:20px}
      @page{size:landscape;margin:15mm}
      @media print{body{margin:0}}</style></head><body>
      <div style="text-align:center;margin-bottom:20px">
        <h2 style="margin:0;color:#0f172a">SIRAP — Reporte de Asistencias</h2>
        <p style="color:#64748b;font-size:0.85rem">Generado: ${new Date().toLocaleString('es-MX')} · ${filteredData.length} registros</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
        <thead><tr style="background:#f1f5f9">
          <th style="text-align:left;padding:8px 10px;border-bottom:2px solid #0f172a">Fecha</th>
          <th style="text-align:left;padding:8px 10px;border-bottom:2px solid #0f172a">Empleado</th>
          <th style="text-align:left;padding:8px 10px;border-bottom:2px solid #0f172a">Entrada</th>
          <th style="text-align:left;padding:8px 10px;border-bottom:2px solid #0f172a">Salida</th>
          <th style="text-align:left;padding:8px 10px;border-bottom:2px solid #0f172a">Estado</th>
          <th style="text-align:left;padding:8px 10px;border-bottom:2px solid #0f172a">Retardo</th>
        </tr></thead><tbody>${rows}</tbody>
      </table>
      <script>setTimeout(()=>{window.print();setTimeout(()=>window.close(),500)},600)</script>
    </body></html>`);
    printWindow.document.close();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsistencia) return;
    try {
      const dataToSend = {
        ...editFormData,
        horaEntrada: editFormData.horaEntrada || null,
        horaSalida: editFormData.horaSalida || null
      };
      await api.patch(`/asistencias/${selectedAsistencia.id}`, dataToSend);
      toast.success('Asistencia actualizada correctamente');
      setShowModal(false);
      setIsEditing(false);
      if (socket) socket.emit('solicitar_actualizacion', { action: 'patch', id: selectedAsistencia.id });
      fetchAsistencias();
    } catch {
      // handled by api-client
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este registro de asistencia?')) return;
    try {
      await api.delete(`/asistencias/${id}`);
      toast.success('Registro eliminado');
      if (socket) socket.emit('solicitar_actualizacion', { action: 'delete', id });
      fetchAsistencias();
    } catch {
      // handled by api-client
    }
  };

  const calculateDelay = (horaEntrada: string, asist: any) => {
    if (!horaEntrada || !asist.empleado?.horarios) return null;
    
    const fecha = new Date(asist.fecha);
    const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    // Normalizar a medio día para evitar desfases GMT
    const dObj = new Date(asist.fecha);
    const normalized = new Date(dObj.getFullYear(), dObj.getMonth(), dObj.getDate(), 12, 0, 0);
    const diaSemana = days[normalized.getDay()];
    
    // Buscar horario para ese día
    const horarios = asist.empleado.horarios.filter((h: any) => h.diaSemana === diaSemana && h.activo);
    if (horarios.length === 0) return { minutos: 0, estado: 'puntual' };

    // Comparar con el horario (simplificado: primer horario del día)
    const horario = horarios[0];
    const [hEnt, mEnt] = horaEntrada.split(':').map(Number);
    const [hEsp, mEsp] = horario.horaEntrada.split(':').map(Number);
    const minutosEntrada = hEnt * 60 + mEnt;
    const minutosEsperados = hEsp * 60 + mEsp;
    const retardo = minutosEntrada - minutosEsperados;
    
    if (retardo <= 0) return { minutos: 0, estado: 'puntual' };
    return { minutos: retardo, estado: 'retardo' };
  };

  const handleHoraEntradaChange = (newHora: string) => {
    setEditFormData(prev => {
      const updated = { ...prev, horaEntrada: newHora };
      const calcArea = calculateDelay(newHora, selectedAsistencia);
      if (calcArea) {
        updated.minutosRetardo = calcArea.minutos;
        updated.estado = calcArea.estado;
      }
      return updated;
    });
  };

  const openModal = (asistencia: any) => {
    setSelectedAsistencia(asistencia);
    setEditFormData({
      horaEntrada: asistencia.horaEntrada || '',
      horaSalida: asistencia.horaSalida || '',
      estado: asistencia.estado,
      minutosRetardo: asistencia.minutosRetardo || 0,
      observaciones: asistencia.observaciones || ''
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const filteredData = asistencias.filter(asist => {
    const empleadoNombre = asist.empleado ? `${asist.empleado.nombre} ${asist.empleado.apellidos}` : '';
    const numeroEmpleado = asist.empleado?.numeroEmpleado || '';
    const matchesSearch = empleadoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      numeroEmpleado.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterEstado === 'todos' || asist.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

  const isAdmin = userRole === 'administrador';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Registro de Asistencias</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-outline" 
            onClick={fetchAsistencias} 
            disabled={loading}
            title="Actualizar tabla"
            style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              height="20px" 
              viewBox="0 -960 960 960" 
              width="20px" 
              fill="currentColor"
              style={{ 
                animation: loading ? 'spin 1s linear infinite' : 'none',
                display: 'block'
              }}
            >
              <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/>
            </svg>
          </button>
          <button className="btn btn-outline" onClick={handleExportExcel}>Exportar Excel</button>
          <button className="btn btn-outline" onClick={handleExportPDF}>Exportar PDF</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <input
            type="text" className="input"
            placeholder="Buscar por nombre o número de empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <select className="input" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} style={{ width: '200px' }}>
            <option value="todos">Todos los estados</option>
            <option value="puntual">Puntual</option>
            <option value="retardo">Retardo</option>
            <option value="falta">Falta</option>
            <option value="justificada">Justificada</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Empleado</th>
              <th>Hora Entrada</th>
              <th>Hora Salida</th>
              <th>Estado</th>
              <th>Minutos Retardo</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((asistencia) => (
              <tr key={asistencia.id}>
                <td style={{ fontWeight: 500 }}>{new Date(asistencia.fecha).toLocaleDateString('es-MX')}</td>
                <td>
                  {asistencia.empleado?.nombre} {asistencia.empleado?.apellidos}
                  <br />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {asistencia.empleado?.numeroEmpleado}
                  </span>
                </td>
                <td>{asistencia.horaEntrada || '-'}</td>
                <td>{asistencia.horaSalida || '-'}</td>
                <td>
                  <span className={`badge ${
                    asistencia.estado === 'puntual' ? 'badge-success' :
                    asistencia.estado === 'retardo' ? 'badge-warning' :
                    asistencia.estado === 'justificada' ? 'badge-info' : 'badge-error'
                  }`}>
                    {asistencia.estado}
                  </span>
                </td>
                <td>{asistencia.minutosRetardo > 0 ? `${asistencia.minutosRetardo} min` : '-'}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.7rem' }}
                      onClick={() => openModal(asistencia)}
                    >
                      Detalles
                    </button>
                    {isAdmin && (
                      <button
                        className="btn btn-outline"
                        style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.75rem', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                        onClick={() => handleDelete(asistencia.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            {loading ? 'Cargando asistencias...' : 'No se encontraron registros de asistencia'}
          </div>
        )}
      </div>

      <div style={{ marginTop: 'var(--spacing-lg)', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        Mostrando {filteredData.length} registros
      </div>

      {/* Modal */}
      {showModal && selectedAsistencia && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--spacing-lg)' }}
          onClick={() => { setShowModal(false); setIsEditing(false); }}
        >
          <div className="card" style={{ maxWidth: '520px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isEditing ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                    Editar Asistencia
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0-33-23.5-56.5T720-80H240Zm0-80h480v-640H240v640Zm0 0v-640 640Z"/></svg>
                    Detalle de Asistencia
                  </>
                )}
              </h3>
              <button
                onClick={() => { setShowModal(false); setIsEditing(false); }}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >×</button>
            </div>

            <form onSubmit={handleUpdate}>
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>

                {/* Empleado y fecha — siempre solo lectura */}
                <div>
                  <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>Empleado</label>
                  <div style={{ fontWeight: 600 }}>{selectedAsistencia.empleado?.nombre} {selectedAsistencia.empleado?.apellidos}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{selectedAsistencia.empleado?.numeroEmpleado}</div>
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>Fecha</label>
                  <div>{new Date(selectedAsistencia.fecha).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>

                {/* Hora Entrada */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>Hora de Entrada</label>
                    {isEditing && isAdmin ? (
                      <input type="time" className="input" value={editFormData.horaEntrada}
                        onChange={(e) => handleHoraEntradaChange(e.target.value)} />
                    ) : (
                      <div style={{ fontWeight: 600 }}>{selectedAsistencia.horaEntrada || 'No registrada'}</div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>Hora de Salida</label>
                    {isEditing && isAdmin ? (
                      <input type="time" className="input" value={editFormData.horaSalida}
                        onChange={(e) => setEditFormData({ ...editFormData, horaSalida: e.target.value })} />
                    ) : (
                      <div style={{ fontWeight: 600 }}>{selectedAsistencia.horaSalida || 'Pendiente'}</div>
                    )}
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>Estado</label>
                  {isEditing && isAdmin ? (
                    <select className="input" value={editFormData.estado}
                      onChange={(e) => setEditFormData({ ...editFormData, estado: e.target.value })}>
                      <option value="puntual">Puntual</option>
                      <option value="retardo">Retardo</option>
                      <option value="falta">Falta</option>
                      <option value="justificada">Justificada</option>
                    </select>
                  ) : (
                    <span className={`badge ${
                      selectedAsistencia.estado === 'puntual' ? 'badge-success' :
                      selectedAsistencia.estado === 'retardo' ? 'badge-warning' :
                      selectedAsistencia.estado === 'justificada' ? 'badge-info' : 'badge-error'
                    }`}>{selectedAsistencia.estado}</span>
                  )}
                </div>

                {/* Minutos Retardo */}
                <div>
                  <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>Minutos de Retardo</label>
                  {isEditing && isAdmin ? (
                    <input 
                      type="number" className="input" 
                      value={editFormData.minutosRetardo}
                      onChange={(e) => setEditFormData({ ...editFormData, minutosRetardo: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    <div>{selectedAsistencia.minutosRetardo > 0 ? `${selectedAsistencia.minutosRetardo} min` : '-'}</div>
                  )}
                </div>

                {/* Observaciones */}
                <div>
                  <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>Observaciones</label>
                  {isEditing && isAdmin ? (
                    <textarea className="input" rows={3} value={editFormData.observaciones}
                      onChange={(e) => setEditFormData({ ...editFormData, observaciones: e.target.value })}
                      placeholder="Opcional..." />
                  ) : (
                    <div>{selectedAsistencia.observaciones || 'Sin observaciones'}</div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {isAdmin && !isEditing && (
                  <button type="button" className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => setIsEditing(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                    Editar
                  </button>
                )}
                {isAdmin && isEditing && (
                  <>
                    <button type="button" className="btn btn-outline"
                      onClick={() => setIsEditing(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-800H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/></svg>
                      Guardar Cambios
                    </button>
                  </>
                )}
                {!isEditing && (
                  <button type="button" className="btn btn-primary" onClick={() => { setShowModal(false); setIsEditing(false); }}>
                    Cerrar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}