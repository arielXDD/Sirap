'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api-client';

interface Empleado {
  id: number;
  nombre: string;
  apellidos: string;
  numeroEmpleado: string;
}

interface Asistencia {
  id: number;
  empleadoId: number;
  fecha: string;
  horaEntrada: string | null;
  horaSalida: string | null;
  estado: 'puntual' | 'retardo' | 'falta' | 'justificada';
  empleado?: { id: number; nombre: string; apellidos: string; numeroEmpleado: string };
}

interface EmpleadoStats {
  id: number;
  nombre: string;
  apellidos: string;
  numeroEmpleado: string;
  puntuales: number;
  retardos: number;
  faltas: number;
  total: number;
  horasTrabajadas: number;
  ausencias: number;
  permisos: number;
}

export default function ReportesPage() {
  const [tipoReporte, setTipoReporte] = useState('diario');
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechaGeneracion] = useState(new Date());
  const reportRef = useRef<HTMLDivElement>(null);

  const user = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('user') || '{}') : {};

  // Obtener rango de fechas según tipo de reporte
  const getDateRange = useCallback((tipo: string) => {
    const hoy = new Date();
    if (tipo === 'diario') {
      const fecha = hoy.toISOString().split('T')[0];
      return { fechas: [fecha], label: hoy.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), periodo: 'Reporte Diario' };
    } else if (tipo === 'semanal') {
      const day = hoy.getDay();
      const monday = new Date(hoy);
      monday.setDate(hoy.getDate() - (day === 0 ? 6 : day - 1));
      const fechas: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        if (d <= hoy) fechas.push(d.toISOString().split('T')[0]);
      }
      const lunes = new Date(monday);
      const viernes = new Date(monday);
      viernes.setDate(monday.getDate() + 4);
      return {
        fechas,
        label: `Semana del ${lunes.getDate()} al ${Math.min(viernes.getDate(), hoy.getDate())} de ${hoy.toLocaleDateString('es-MX', { month: 'long' })} de ${hoy.getFullYear()}`,
        periodo: 'Reporte Semanal',
      };
    } else {
      const year = hoy.getFullYear();
      const month = hoy.getMonth();
      const fechas: string[] = [];
      for (let d = 1; d <= hoy.getDate(); d++) {
        const fecha = new Date(year, month, d);
        fechas.push(fecha.toISOString().split('T')[0]);
      }
      return {
        fechas,
        label: `${hoy.toLocaleDateString('es-MX', { month: 'long' })} ${year}`,
        periodo: 'Reporte Mensual',
      };
    }
  }, []);

  // Fetch empleados
  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const data = await api.get('/empleados');
        setEmpleados(Array.isArray(data) ? data : data.data ?? []);
      } catch {
        // Error handled by api-client
      }
    };
    fetchEmpleados();
  }, []);

  // Fetch asistencias del rango
  useEffect(() => {
    const fetchAsistencias = async () => {
      setLoading(true);
      try {
        const { fechas } = getDateRange(tipoReporte);
        const start = fechas[0];
        const end = fechas[fechas.length - 1];

        const data = await api.get(`/asistencias/reporte/detallado?fechaInicio=${start}&fechaFin=${end}`);
        
        if (Array.isArray(data)) {
          const stats: EmpleadoStats[] = data.map((emp: any) => ({
            id: emp.id,
            nombre: emp.nombre,
            apellidos: emp.apellidos,
            numeroEmpleado: emp.numeroEmpleado,
            puntuales: emp.stats.puntuales,
            retardos: emp.stats.retardos,
            faltas: emp.stats.faltas,
            total: emp.asistencias.length,
            horasTrabajadas: emp.stats.horasTrabajadas,
            ausencias: emp.stats.vacaciones,
            permisos: emp.stats.permisos,
          })).filter((e: EmpleadoStats) => e.total > 0 || e.ausencias > 0 || e.permisos > 0);
          
          setAsistencias(data.flatMap((emp: any) => emp.asistencias));
          // Note: In a real implementation I would set a specific state for these stats
          // but for now I'll adapt to the existing structure
          (window as any)._detailedStats = stats;
        }
      } catch {
        // Error handled by api-client
      } finally {
        setLoading(false);
      }
    };
    fetchAsistencias();
  }, [tipoReporte, getDateRange]);

  // Filtrar asistencias por empleado seleccionado
  const asistenciasFiltradas = selectedEmpleadoId
    ? asistencias.filter(a => a.empleadoId === selectedEmpleadoId || a.empleado?.id === selectedEmpleadoId)
    : asistencias;

  // Calcular estadísticas reales
  const totalRegistros = asistenciasFiltradas.length;
  const puntuales = asistenciasFiltradas.filter(a => a.estado === 'puntual').length;
  const retardos = asistenciasFiltradas.filter(a => a.estado === 'retardo').length;
  const faltas = asistenciasFiltradas.filter(a => a.estado === 'falta').length;

  const pctPuntuales = totalRegistros > 0 ? ((puntuales / totalRegistros) * 100).toFixed(1) : '0.0';
  const pctRetardos = totalRegistros > 0 ? ((retardos / totalRegistros) * 100).toFixed(1) : '0.0';
  const pctFaltas = totalRegistros > 0 ? ((faltas / totalRegistros) * 100).toFixed(1) : '0.0';
  const tasaEfectiva = totalRegistros > 0 ? (((puntuales + retardos) / totalRegistros) * 100).toFixed(1) : '0.0';

  const { label: periodoLabel, periodo: periodoNombre } = getDateRange(tipoReporte);
  const folio = `SIRAP-${tipoReporte.charAt(0).toUpperCase()}-${fechaGeneracion.getFullYear()}${String(fechaGeneracion.getMonth() + 1).padStart(2, '0')}${String(fechaGeneracion.getDate()).padStart(2, '0')}-001`;

  // Estadísticas por empleado (usando los datos procesados)
  const empleadoStats: EmpleadoStats[] = ((window as any)._detailedStats || []).filter(
    (e: EmpleadoStats) => !selectedEmpleadoId || e.id === selectedEmpleadoId
  );

  const empleadoSeleccionado = selectedEmpleadoId
    ? empleados.find(e => e.id === selectedEmpleadoId)
    : null;

  // Exports
  const handleGenerarPDF = () => {
    setIsExporting(true);
    const printContent = reportRef.current;
    if (!printContent) { setIsExporting(false); return; }

    const printWindow = window.open('', '_blank');
    if (!printWindow) { setIsExporting(false); toast.error('Permite ventanas emergentes para generar el PDF'); return; }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte SIRAP - ${folio}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', -apple-system, sans-serif; color: #1a1a2e; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4; margin: 15mm; }
          @media print { body { margin: 0; } .no-print { display: none !important; } }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <script>
          setTimeout(() => {
            window.print();
            setTimeout(() => window.close(), 500);
          }, 600);
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => setIsExporting(false), 2000);
  };

  const handleExportarExcel = () => {
    setIsExporting(true);
    const empleadosCSV = empleadoStats.length > 0
      ? empleadoStats.map(e => {
          const pct = e.total > 0 ? (((e.puntuales + e.retardos) / e.total) * 100).toFixed(0) : '0';
          return `${e.numeroEmpleado},${e.nombre} ${e.apellidos},${e.puntuales},${e.retardos},${e.faltas},${pct}%`;
        }).join('\n')
      : '';
    const csv = `\uFEFFREPORTE OFICIAL DE ASISTENCIA - SIRAP\nFolio,${folio}\nTipo,${periodoNombre}\nPeriodo,${periodoLabel}\nFecha,${fechaGeneracion.toLocaleDateString('es-MX')}\nGenerado por,${user.username || 'Administrador'}\n\nRESUMEN\nConcepto,Cantidad,Porcentaje\nTotal,${totalRegistros},100%\nPuntuales,${puntuales},${pctPuntuales}%\nRetardos,${retardos},${pctRetardos}%\nFaltas,${faltas},${pctFaltas}%\n\nDETALLE\nNo. Empleado,Nombre,Puntuales,Retardos,Faltas,% Asistencia\n${empleadosCSV}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Reporte_${tipoReporte}_${fechaGeneracion.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  const c = { primary: '#111827', secondary: '#4b5563', accent: '#111827', green: '#059669', amber: '#d97706', red: '#dc2626', bg: '#ffffff', border: '#e5e7eb', surface: '#ffffff' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Controls Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
        padding: '20px 0', borderBottom: `1px solid ${c.border}`, background: 'transparent'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Tipo de Reporte</label>
            <select
              className="input"
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              style={{ minWidth: '260px', fontSize: '0.88rem', fontWeight: 500, border: `1px solid ${c.border}`, borderRadius: '6px', background: '#fff' }}
            >
              <option value="diario">Reporte Diario</option>
              <option value="semanal">Reporte Semanal</option>
              <option value="mensual">Reporte Mensual</option>
            </select>
          </div>
          {/* Filtro por empleado */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Empleado</label>
            <select
              className="input"
              value={selectedEmpleadoId ?? ''}
              onChange={(e) => setSelectedEmpleadoId(e.target.value ? +e.target.value : null)}
              style={{ minWidth: '220px', fontSize: '0.88rem', fontWeight: 500, border: `1px solid ${c.border}`, borderRadius: '6px', background: '#fff' }}
            >
              <option value="">Todos los empleados</option>
              {empleados.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} {emp.apellidos} ({emp.numeroEmpleado})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExportarExcel} disabled={isExporting || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '6px', border: `1px solid ${c.border}`,
              background: '#fff', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', color: c.secondary,
              transition: 'all 0.15s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = c.primary; e.currentTarget.style.borderColor = c.secondary; }}
            onMouseOut={(e) => { e.currentTarget.style.color = c.secondary; e.currentTarget.style.borderColor = c.border; }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Exportar CSV
          </button>
          <button
            onClick={handleGenerarPDF} disabled={isExporting || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '6px', border: 'none',
              background: isExporting ? '#e5e7eb' : c.primary, color: isExporting ? '#9ca3af' : '#fff',
              fontSize: '0.82rem', fontWeight: 500, cursor: isExporting ? 'wait' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            {isExporting ? 'Generando...' : 'Imprimir / PDF'}
          </button>
        </div>
      </div>

      {/* === DOCUMENTO REPORTE === */}
      <div ref={reportRef} style={{
        maxWidth: '940px', margin: '0 auto', width: '100%',
        background: '#fff', 
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: c.primary, fontSize: '0.85rem', lineHeight: '1.5',
      }}>
        {/* Header */}
        <div style={{
          padding: '40px 0 20px 0', borderBottom: `2px solid ${c.primary}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: c.secondary, marginBottom: '8px' }}>
              Sistema Integral de Registro de Asistencia de Personal
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: c.primary }}>SIRAP</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px', color: c.primary }}>Reporte Oficial</div>
            <div style={{ fontSize: '0.8rem', color: c.secondary }}>{periodoNombre}</div>
          </div>
        </div>

        {/* Folio bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 0', borderBottom: `1px solid ${c.border}`,
          fontSize: '0.75rem',
        }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            <span><span style={{ color: c.secondary, marginRight: '8px' }}>Folio:</span><span style={{ fontWeight: 500, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{folio}</span></span>
            <span><span style={{ color: c.secondary, marginRight: '8px' }}>Fecha:</span><span style={{ fontWeight: 500 }}>{fechaGeneracion.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span></span>
          </div>
          <span style={{
            color: c.secondary, fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase'
          }}>USO INTERNO</span>
        </div>

        <div style={{ padding: '40px 0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: c.secondary }}>
              <div style={{
                width: '24px', height: '24px', border: `2px solid ${c.border}`, borderTopColor: c.primary,
                borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
              }}></div>
              Cargando datos...
            </div>
          ) : (
            <>
              {/* Datos Generales */}
              <div style={{ marginBottom: '40px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: c.secondary, marginBottom: '16px' }}>
                  Datos Generales
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: empleadoSeleccionado
                    ? 'minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)'
                    : 'minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr)',
                  gap: '24px',
                }}>
                  {[
                    { label: 'Período', value: periodoLabel },
                    ...(empleadoSeleccionado ? [{ label: 'Empleado', value: `${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellidos} (${empleadoSeleccionado.numeroEmpleado})` }] : []),
                    { label: 'Elaborado por', value: user.username || 'Administrador' },
                    { label: 'Cargo', value: user.rol ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1) : 'Administrador' },
                  ].map((item, i) => (
                    <div key={i} style={{ paddingBottom: '12px', borderBottom: `1px solid ${c.border}` }}>
                      <div style={{ fontSize: '0.7rem', color: c.secondary, marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, color: c.primary }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPIs */}
              <div style={{ marginBottom: '40px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: c.secondary, marginBottom: '16px' }}>
                  Resumen Ejecutivo
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                  {[
                    { label: 'Total Registros', value: totalRegistros, pct: '100', color: c.primary },
                    { label: 'Puntuales', value: puntuales, pct: pctPuntuales, color: c.green },
                    { label: 'Retardos', value: retardos, pct: pctRetardos, color: c.amber },
                    { label: 'Faltas', value: faltas, pct: pctFaltas, color: c.red },
                  ].map((kpi, i) => (
                    <div key={i} style={{
                      padding: '24px', borderRadius: '8px', border: `1px solid ${c.border}`, background: '#fff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                         <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: kpi.color }}></div>
                         <div style={{ fontSize: '0.75rem', color: c.secondary }}>{kpi.label}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 300, color: c.primary, letterSpacing: '-0.02em' }}>{kpi.value}</span>
                        <span style={{ fontSize: '0.8rem', color: c.secondary }}>{kpi.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicadores */}
              <div style={{ marginBottom: '40px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: c.secondary, marginBottom: '16px' }}>
                  Indicadores de Gestión
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                  {[
                    { label: 'Asistencia Efectiva', value: `${tasaEfectiva}%` },
                    { label: 'Puntualidad Global', value: `${pctPuntuales}%` },
                    { label: 'Índice de Ausentismo', value: `${pctFaltas}%` },
                  ].map((ind, i) => (
                    <div key={i} style={{
                      padding: '20px 24px', borderLeft: `3px solid ${c.border}`, background: c.bg
                    }}>
                        <div style={{ fontSize: '0.75rem', color: c.secondary, marginBottom: '8px' }}>{ind.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 400, color: c.primary }}>{ind.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabla de empleados */}
              <div style={{ marginBottom: '40px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: c.secondary, marginBottom: '16px' }}>
                  Detalle por Empleado
                </div>
                <div style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '16px 8px', fontWeight: 500, color: c.secondary, borderBottom: `1px solid ${c.border}` }}>#</th>
                        <th style={{ textAlign: 'left', padding: '16px 8px', fontWeight: 500, color: c.secondary, borderBottom: `1px solid ${c.border}` }}>Empleado</th>
                        <th style={{ textAlign: 'center', padding: '16px 8px', fontWeight: 500, color: c.secondary, borderBottom: `1px solid ${c.border}` }}>Ret.</th>
                        <th style={{ textAlign: 'center', padding: '16px 8px', fontWeight: 500, color: c.secondary, borderBottom: `1px solid ${c.border}` }}>Fal.</th>
                        <th style={{ textAlign: 'center', padding: '16px 8px', fontWeight: 500, color: c.secondary, borderBottom: `1px solid ${c.border}` }}>Aus/Per</th>
                        <th style={{ textAlign: 'center', padding: '16px 8px', fontWeight: 500, color: c.secondary, borderBottom: `1px solid ${c.border}` }}>Horas</th>
                        <th style={{ textAlign: 'center', padding: '16px 8px', fontWeight: 500, color: c.secondary, borderBottom: `1px solid ${c.border}` }}>Asist.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empleadoStats.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: c.secondary }}>Sin registros para este periodo</td>
                        </tr>
                      ) : empleadoStats.map((emp, i) => {
                        const pct = emp.total > 0 ? Number((((emp.puntuales + emp.retardos) / emp.total) * 100).toFixed(0)) : 0;
                        return (
                          <tr key={emp.id} style={{ borderBottom: i === empleadoStats.length - 1 ? 'none' : `1px solid ${c.border}` }}>
                            <td style={{ padding: '16px 8px', color: c.secondary }}>{i + 1}</td>
                            <td style={{ padding: '16px 8px' }}>
                              <div style={{ fontWeight: 500, color: c.primary }}>{emp.nombre} {emp.apellidos}</div>
                              <div style={{ fontSize: '0.7rem', color: c.secondary, fontFamily: 'monospace' }}>{emp.numeroEmpleado}</div>
                            </td>
                            <td style={{ textAlign: 'center', padding: '16px 8px', color: emp.retardos > 0 ? c.primary : c.secondary, fontWeight: emp.retardos > 0 ? 600 : 400 }}>
                              {emp.retardos || '-'}
                            </td>
                            <td style={{ textAlign: 'center', padding: '16px 8px', color: emp.faltas > 0 ? c.red : c.secondary, fontWeight: emp.faltas > 0 ? 600 : 400 }}>
                              {emp.faltas || '-'}
                            </td>
                            <td style={{ textAlign: 'center', padding: '16px 8px', color: c.secondary }}>
                               <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                  {emp.ausencias > 0 && <span title="Ausencias">A</span>}
                                  {emp.permisos > 0 && <span title="Permisos">P</span>}
                                  {emp.ausencias === 0 && emp.permisos === 0 && <span>-</span>}
                               </div>
                            </td>
                            <td style={{ textAlign: 'center', padding: '16px 8px', color: c.secondary }}>{emp.horasTrabajadas}h</td>
                            <td style={{ textAlign: 'center', padding: '16px 8px' }}>
                              <span style={{ fontWeight: 600, color: pct >= 95 ? c.green : pct >= 80 ? c.amber : c.red }}>{pct}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Observaciones */}
              <div style={{ marginBottom: '60px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: c.secondary, marginBottom: '16px' }}>
                  Observaciones
                </div>
                <div style={{
                  padding: '16px 0', borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`,
                  fontSize: '0.8rem', lineHeight: '1.6', color: c.secondary,
                }}>
                  <p style={{ marginBottom: '8px' }}>
                    Documento <strong>oficial</strong> generado automáticamente por el Sistema Integral de Registro de Asistencia de Personal (SIRAP). Los datos corresponden al período señalado.
                  </p>
                  <p>
                    Uso interno y <strong>confidencial</strong>.
                  </p>
                </div>
              </div>

              {/* Firmas */}
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '60px', marginTop: '40px' }}>
                  {[
                    { title: 'Elaboró', name: user.username || 'Administrador del Sistema', role: user.rol ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1) : 'Administrador' },
                    { title: 'Vo. Bo.', name: 'Dirección General', role: 'Autorización' },
                  ].map((firma, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ height: '60px', marginBottom: '12px' }}></div>
                      <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: '12px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: c.primary, marginBottom: '2px' }}>{firma.name}</div>
                        <div style={{ fontSize: '0.7rem', color: c.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{firma.role}</div>
                        <div style={{ fontSize: '0.65rem', color: c.secondary, marginTop: '8px', fontStyle: 'italic' }}>{firma.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 0', borderTop: `1px solid ${c.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '0.7rem', color: c.secondary, marginTop: '20px'
        }}>
          <span>SIRAP</span>
          <span style={{ fontFamily: 'monospace' }}>Folio: {folio}</span>
          <span>{fechaGeneracion.toLocaleDateString('es-MX')} {fechaGeneracion.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
