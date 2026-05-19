'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api-client';
import styles from './page.module.css';

const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export default function HorariosPage() {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [searchEmp, setSearchEmp] = useState('');
  const [selectedEmpleado, setSelectedEmpleado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [horarios, setHorarios] = useState<Record<string, any[]>>({});
  const [deletedHorarios, setDeletedHorarios] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const userRol = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('user') || '{}').rol : '';
  const esReadOnly = userRol === 'supervisor';

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    try {
      const data = await api.get('/empleados');
      setEmpleados(Array.isArray(data) ? data : data.data ?? []);
    } catch {
      // Error handled by api-client
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmpleado = async (empleado: any) => {
    setSelectedEmpleado(empleado);
    setHorarios({});
    setDeletedHorarios(new Set());
    try {
      const data = await api.get(`/horarios/empleado/${empleado.id}`);
      const horariosMap: Record<string, any[]> = {};
      DIAS_SEMANA.forEach(dia => {
        const turnosExistentes = data
          .filter((h: any) => h.diaSemana === dia && h.activo)
          .sort((a: any, b: any) => a.horaEntrada.localeCompare(b.horaEntrada));
        horariosMap[dia] = turnosExistentes.length > 0
          ? turnosExistentes
          : [{ horaEntrada: '09:00', horaSalida: '18:00', toleranciaMinutos: 15, activo: false }];
      });
      setHorarios(horariosMap);
    } catch {
      // Error handled by api-client
    }
  };

  const validateShifts = (turnos: any[]) => {
    const activeTurnos = turnos.filter(t => t.activo);
    if (activeTurnos.length <= 1) return true;
    const sorted = [...activeTurnos].sort((a, b) => a.horaEntrada.localeCompare(b.horaEntrada));
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].horaSalida > sorted[i + 1].horaEntrada) return false;
    }
    return true;
  };

  const handleChangeHorario = (dia: string, index: number, campo: string, valor: any) => {
    setHorarios(prev => {
      const newTurnos = [...prev[dia]];
      if (campo === 'activo' && index === 0) {
        if (valor === false) {
          newTurnos.forEach(t => {
            if (t.id) setDeletedHorarios(prevSet => new Set(prevSet).add(t.id));
            t.activo = false;
          });
        } else {
          newTurnos.forEach(t => {
            if (t.id) setDeletedHorarios(prevSet => {
              const n = new Set(prevSet);
              n.delete(t.id);
              return n;
            });
            t.activo = true;
          });
        }
      } else {
        newTurnos[index] = { ...newTurnos[index], [campo]: valor };
      }
      return { ...prev, [dia]: newTurnos };
    });
  };

  const handleAddTurno = (dia: string) => {
    setHorarios(prev => {
      const lastTurno = prev[dia][prev[dia].length - 1];
      let newEntrada = '14:00';
      let newSalida = '18:00';
      if (lastTurno?.horaSalida) {
        const [h, m] = lastTurno.horaSalida.split(':').map(Number);
        const nextH = Math.min(h + 1, 23);
        newEntrada = `${nextH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        newSalida = `${Math.min(nextH + 4, 23).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      }
      return {
        ...prev,
        [dia]: [...prev[dia], { horaEntrada: newEntrada, horaSalida: newSalida, toleranciaMinutos: 15, activo: true }],
      };
    });
  };

  const handleRemoveTurno = (dia: string, index: number) => {
    setHorarios(prev => {
      const turnoToRemove = prev[dia][index];
      if (turnoToRemove.id) setDeletedHorarios(prevSet => new Set(prevSet).add(turnoToRemove.id));
      const newTurnos = prev[dia].filter((_, i) => i !== index);
      if (newTurnos.length === 0) {
        return { ...prev, [dia]: [{ horaEntrada: '09:00', horaSalida: '18:00', toleranciaMinutos: 15, activo: false }] };
      }
      return { ...prev, [dia]: newTurnos };
    });
  };

  const handleGuardarHorarios = async () => {
    if (!selectedEmpleado) return;
    setSaving(true);

    const deleteIds = Array.from(deletedHorarios);
    const upsertData: any[] = [];

    for (const dia of DIAS_SEMANA) {
      const turnos = horarios[dia] || [];
      if (!validateShifts(turnos)) {
        toast.error(`Los turnos del día ${dia} se traslapan. Por favor corrígelos.`);
        setSaving(false);
        return;
      }
      for (const datos of turnos) {
        if (!datos.activo) continue;
        upsertData.push({
          id: datos.id,
          empleadoId: selectedEmpleado.id,
          diaSemana: dia,
          horaEntrada: datos.horaEntrada,
          horaSalida: datos.horaSalida,
          toleranciaMinutos: Number(datos.toleranciaMinutos),
          activo: true
        });
      }
    }

    try {
      await api.post('/horarios/bulk', { deleteIds, upsertData });
      setDeletedHorarios(new Set());
      await handleSelectEmpleado(selectedEmpleado);
      toast.success('Horarios actualizados correctamente');
    } catch (error) {
       // handled by api-client (toast shown)
    } finally {
      setSaving(false);
    }
  };

  const filteredEmpleados = empleados.filter(e =>
    `${e.nombre} ${e.apellidos} ${e.numeroEmpleado}`.toLowerCase().includes(searchEmp.toLowerCase())
  );

  const diasActivos = DIAS_SEMANA.filter(dia => horarios[dia]?.some(t => t.activo));

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.title}>{esReadOnly ? 'Horarios' : 'Gestión de Horarios'}</h2>
          <p className={styles.subtitle}>
            {esReadOnly ? 'Consulta el horario laboral de cada empleado' : 'Configura el horario semanal por empleado'}
          </p>
        </div>
      </div>

      <div className={styles.layout}>

        {/* ── Panel de empleados ── */}
        <aside className={styles.employeePanel}>
          <div className={styles.panelHead}>
            <span className={styles.panelLabel}>Empleados</span>
            <span className={styles.countBadge}>{empleados.length}</span>
          </div>

          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar..."
              value={searchEmp}
              onChange={e => setSearchEmp(e.target.value)}
            />
          </div>

          <div className={styles.employeeList}>
            {loading ? (
              <div className={styles.listPlaceholder}>Cargando...</div>
            ) : filteredEmpleados.length === 0 ? (
              <div className={styles.listPlaceholder}>Sin resultados</div>
            ) : filteredEmpleados.map(emp => (
              <button
                key={emp.id}
                className={`${styles.empItem} ${selectedEmpleado?.id === emp.id ? styles.empItemSelected : ''}`}
                onClick={() => handleSelectEmpleado(emp)}
              >
                <div 
                  className={`${styles.avatar} ${emp.estatus !== 'activo' ? styles.avatarGray : ''}`}
                  style={emp.fotoUrl ? { background: 'transparent', padding: 0 } : {}}
                >
                  {emp.fotoUrl ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${emp.fotoUrl}`}
                      alt="Foto"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <>{emp.nombre[0]}{emp.apellidos[0]}</>
                  )}
                </div>
                <div className={styles.empInfo}>
                  <span className={styles.empName}>{emp.nombre} {emp.apellidos}</span>
                  <span className={styles.empMeta}>{emp.numeroEmpleado} · {emp.area || emp.puesto}</span>
                </div>
                {selectedEmpleado?.id === emp.id && (
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Panel de horario ── */}
        <main className={styles.schedulePanel}>
          {selectedEmpleado && Object.keys(horarios).length > 0 ? (
            <>
              {/* Header del horario */}
              <div className={styles.scheduleHead}>
                <div className={styles.scheduleHeadLeft}>
                  <div 
                    className={`${styles.avatar} ${styles.avatarLg} ${styles.clickableArea}`}
                    onClick={() => {
                       if (selectedEmpleado.fotoUrl) {
                          setIsPhotoModalOpen(true);
                       } else {
                          setIsEmployeeModalOpen(true);
                       }
                    }}
                    style={selectedEmpleado.fotoUrl ? { background: 'transparent', padding: 0 } : {}}
                  >
                    {selectedEmpleado.fotoUrl ? (
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${selectedEmpleado.fotoUrl}`}
                        alt="Foto empleado"
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <>{selectedEmpleado.nombre[0]}{selectedEmpleado.apellidos[0]}</>
                    )}
                  </div>
                  <div 
                    className={styles.clickableArea}
                    onClick={() => setIsEmployeeModalOpen(true)}
                  >
                    <h3 className={styles.empFullName}>
                      {selectedEmpleado.nombre} {selectedEmpleado.apellidos}
                    </h3>
                    <span className={styles.empRole}>
                      {selectedEmpleado.puesto}
                      {selectedEmpleado.area && <> &middot; {selectedEmpleado.area}</>}
                    </span>
                  </div>
                </div>
                {!esReadOnly && (
                  <button className="btn btn-primary" onClick={handleGuardarHorarios} disabled={saving}>
                    {saving ? (
                      'Guardando...'
                    ) : (
                      <>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                          <polyline points="17 21 17 13 7 13 7 21"/>
                          <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        Guardar cambios
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Barra resumen semanal */}
              <div className={styles.weekBar}>
                <span className={styles.weekBarLabel}>Semana laboral</span>
                <div className={styles.weekChips}>
                  {DIAS_SEMANA.map(dia => {
                    const active = horarios[dia]?.some(t => t.activo);
                    return (
                      <div 
                        key={dia} 
                        className={`${styles.weekChip} ${active ? styles.weekChipActive : ''}`}
                        onClick={() => {
                          if (!esReadOnly) {
                            handleChangeHorario(dia, 0, 'activo', !active);
                          }
                        }}
                      >
                        {dia.slice(0, 3).toUpperCase()}
                      </div>
                    );
                  })}
                </div>
                <span className={styles.weekSummary}>
                  {diasActivos.length} día{diasActivos.length !== 1 ? 's' : ''} laborable{diasActivos.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Tabla de días */}
              <div className={styles.daysTable}>

                {/* Cabecera de columnas */}
                {!esReadOnly && (
                  <div className={styles.daysTableHead}>
                    <div className={styles.colDay}>Día</div>
                    <div className={styles.colShifts}>Turnos</div>
                    <div className={styles.colStatus}>Estado</div>
                  </div>
                )}

                {DIAS_SEMANA.map(dia => {
                  const turnos = horarios[dia] || [];
                  const isDayActivo = turnos.some(t => t.activo);
                  if (esReadOnly && !isDayActivo) return null;

                  return (
                    <div key={dia} className={`${styles.dayRow} ${isDayActivo ? styles.dayRowOn : styles.dayRowOff}`}>

                      {/* Nombre del día */}
                      <div className={styles.colDay}>
                        <span className={styles.dayName}>
                          {dia.charAt(0).toUpperCase() + dia.slice(1)}
                        </span>
                      </div>

                      {/* Turnos */}
                      <div className={styles.colShifts}>
                        {isDayActivo ? (
                          <div className={styles.shiftStack}>
                            {turnos.map((turno, idx) => (
                              <div key={idx} className={styles.shiftLine}>
                                <span className={styles.shiftBadge}>T{idx + 1}</span>

                                <div className={styles.timeBlock}>
                                  <input
                                    type="time"
                                    className={styles.timeInput}
                                    value={turno.horaEntrada.substring(0, 5)}
                                    onChange={e => handleChangeHorario(dia, idx, 'horaEntrada', e.target.value)}
                                    disabled={esReadOnly}
                                  />
                                  <span className={styles.arrow}>→</span>
                                  <input
                                    type="time"
                                    className={styles.timeInput}
                                    value={turno.horaSalida.substring(0, 5)}
                                    onChange={e => handleChangeHorario(dia, idx, 'horaSalida', e.target.value)}
                                    disabled={esReadOnly}
                                  />
                                </div>

                                <div className={styles.tolBlock}>
                                  <span className={styles.tolSign}>±</span>
                                  <input
                                    type="number"
                                    className={styles.tolInput}
                                    value={turno.toleranciaMinutos}
                                    onChange={e => handleChangeHorario(dia, idx, 'toleranciaMinutos', e.target.value)}
                                    disabled={esReadOnly}
                                  />
                                  <span className={styles.tolUnit}>min</span>
                                </div>

                                {!esReadOnly && turnos.length > 1 && (
                                  <button className={styles.removeBtn} onClick={() => handleRemoveTurno(dia, idx)} title="Quitar turno">
                                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                      <path d="M18 6 6 18M6 6l12 12"/>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}

                            {!esReadOnly && (
                              <button className={styles.addShiftBtn} onClick={() => handleAddTurno(dia)}>
                                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path d="M12 4v16m8-8H4"/>
                                </svg>
                                Añadir turno
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className={styles.restLabel}>— Descanso</span>
                        )}
                      </div>

                      {/* Estado */}
                      <div className={styles.colStatus}>
                        {isDayActivo
                          ? <span className="badge badge-success">Activo</span>
                          : <span className="badge badge-error">Inactivo</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <svg width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" style={{ color: 'var(--color-text-tertiary)' }}>
                <rect x="3" y="4" width="18" height="18"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                <line x1="8" y1="14" x2="8" y2="14" strokeWidth="3"/><line x1="12" y1="14" x2="12" y2="14" strokeWidth="3"/>
                <line x1="16" y1="14" x2="16" y2="14" strokeWidth="3"/>
              </svg>
              <p className={styles.emptyTitle}>Sin empleado seleccionado</p>
              <p className={styles.emptySubtitle}>
                Selecciona un empleado de la lista para {esReadOnly ? 'ver su horario' : 'gestionar su horario semanal'}
              </p>
            </div>
          )}
        </main>

      </div>

      {/* Modal Foto */}
      {isPhotoModalOpen && selectedEmpleado?.fotoUrl && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)', zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-lg)'
          }}
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <img 
            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${selectedEmpleado.fotoUrl}`}
            alt="Foto Empleado"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '3rem', cursor: 'pointer', lineHeight: 1 }}
            onClick={() => setIsPhotoModalOpen(false)}
          >×</button>
        </div>
      )}

      {/* Modal Info Empleado */}
      {isEmployeeModalOpen && selectedEmpleado && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-lg)'
          }}
          onClick={() => setIsEmployeeModalOpen(false)}
        >
          <div 
            className="card" 
            style={{ maxWidth: '450px', width: '100%', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-secondary)', lineHeight: 1 }}
              onClick={() => setIsEmployeeModalOpen(false)}
            >×</button>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div 
                  style={{ 
                    width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 16px',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)', overflow: 'hidden', cursor: selectedEmpleado.fotoUrl ? 'pointer' : 'default'
                  }}
                  onClick={() => {
                     if (selectedEmpleado.fotoUrl) {
                       setIsPhotoModalOpen(true);
                     }
                  }}
                >
                  {selectedEmpleado.fotoUrl ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${selectedEmpleado.fotoUrl}`}
                      alt="Foto empleado"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'var(--color-text-secondary)' }}>👤</div>
                  )}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)'}}>
                   {selectedEmpleado.nombre} {selectedEmpleado.apellidos}
                </h3>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                   {selectedEmpleado.numeroEmpleado} &middot; {selectedEmpleado.puesto}
                </div>
            </div>
            <div style={{ padding: '0 16px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
               <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: '8px', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                 <span style={{ color: 'var(--color-text-secondary)' }}>Área:</span>
                 <span style={{ fontWeight: 500 }}>{selectedEmpleado.area || '-'}</span>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: '8px', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                 <span style={{ color: 'var(--color-text-secondary)' }}>Email:</span>
                 <span style={{ fontWeight: 500 }}>{selectedEmpleado.email || '-'}</span>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: '8px', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                 <span style={{ color: 'var(--color-text-secondary)' }}>Teléfono:</span>
                 <span style={{ fontWeight: 500 }}>{selectedEmpleado.telefono || '-'}</span>
               </div>
            </div>
            {!esReadOnly && (
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => window.location.href = `/dashboard/empleados?editId=${selectedEmpleado.id}`}
              >
                Editar información
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
