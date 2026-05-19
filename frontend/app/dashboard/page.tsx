'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../lib/api-client';
import styles from './page.module.css';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

interface DashboardStats {
  asistenciasHoy: number;
  retardosHoy: number;
  faltasHoy: number;
  empleadosActivos: number;
}

const ATTENDANCE_DATA = [
  { name: 'Lun', asistencia: 45, faltas: 5 },
  { name: 'Mar', asistencia: 42, faltas: 8 },
  { name: 'Mie', asistencia: 48, faltas: 2 },
  { name: 'Jue', asistencia: 40, faltas: 10 },
  { name: 'Vie', asistencia: 38, faltas: 12 },
];

const PUNTUALITY_DATA = [
  { name: 'Puntual', value: 75, color: '#10b981' },
  { name: 'Retardo', value: 15, color: '#f59e0b' },
  { name: 'Falta', value: 10, color: '#ef4444' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    asistenciasHoy: 0,
    retardosHoy: 0,
    faltasHoy: 0,
    empleadosActivos: 0,
  });
  const [attendanceData, setAttendanceData] = useState<any[]>(ATTENDANCE_DATA);
  const [punctualityData, setPunctualityData] = useState<any[]>(PUNTUALITY_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchGraphData()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.get('/asistencias/stats/hoy');
      setStats(data);
    } catch {
      // Error handled by api-client
    }
  };

  const fetchGraphData = async () => {
    try {
      const data = await api.get('/asistencias/stats/graficas');
      if (data.attendanceData) setAttendanceData(data.attendanceData);
      if (data.punctualityData) setPunctualityData(data.punctualityData);
    } catch {
      // Error handled by api-client
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeSection}>
        <h2 className={styles.welcomeTitle}>Panel de Control</h2>
        <p className={styles.welcomeSubtitle}>
          Resumen de asistencias del día {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Tarjetas de estadísticas - Diseño Modern Flat Professional */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 'var(--spacing-xl)' }}>
        {/* 
 ## 6. Ajustes de Diseño (Bordes Cuadrados)
- [ ] Eliminar border-radius de las tarjetas de estadísticas en el Dashboard
- [ ] Eliminar border-radius de los componentes de Tarjetas NFC (tarjetas, tabla, badges)
- [ ] Revisar y actualizar variables de CSS globales para radios de borde
- [ ] Asegurar consistencia en botones y inputs en todo el dashboard
 */}
        {[
          {
            label: 'Asistencias Hoy',
            value: stats.asistenciasHoy,
            subtext: 'Entradas registradas',
            color: '#10b981',
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
          },
          {
            label: 'Retardos Hoy',
            value: stats.retardosHoy,
            subtext: 'Fuera de tolerancia',
            color: '#f59e0b',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
          },
          {
            label: 'Faltas Hoy',
            value: stats.faltasHoy,
            subtext: 'Sin registro aún',
            color: '#ef4444',
            icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
          },
          {
            label: 'Empleados Activos',
            value: stats.empleadosActivos,
            subtext: 'Personal en turno',
            color: '#3b82f6',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
          },
        ].map((card) => (
          <div key={card.label} style={{
            background: '#ffffff',
            borderRadius: '0',
            padding: '20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '140px',
            transition: 'all 0.2s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '0',
                background: `${card.color}10`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: card.color,
                border: `1px solid ${card.color}20`
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {card.label.split(' ')[0]}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>
                  {card.value}
                </div>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{card.subtext}</span>
                <span style={{ 
                  fontSize: '0.65rem', 
                  padding: '2px 8px', 
                  borderRadius: '0', 
                  background: `${card.color}15`, 
                  color: card.color,
                  fontWeight: 600
                }}>
                  Hoy
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartsGrid}>
        {/* ── Gráfica de Barras mejorada ── */}
        <div className={styles.chartCard}>
          <div style={{ marginBottom: 16 }}>
            <h3 className={styles.chartTitle} style={{ margin: 0 }}>Asistencia Semanal</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '3px 0 0' }}>Asistencias vs. Faltas de la semana</p>
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} barGap={6} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 0,
                    fontSize: '0.8rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  labelStyle={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}
                />
                <Bar dataKey="asistencia" name="Asistencias" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="faltas" name="Faltas" fill="#f87171" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 8 }}>
            {[{ color: '#3b82f6', label: 'Asistencias' }, { color: '#f87171', label: 'Faltas' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#64748b' }}>
                <div style={{ width: 10, height: 10, borderRadius: 0, background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Donut con barras de progreso ── */}
        <div className={styles.chartCard}>
          <div style={{ marginBottom: 16 }}>
            <h3 className={styles.chartTitle} style={{ margin: 0 }}>Estado de Puntualidad</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '3px 0 0' }}>Distribución del día de hoy</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, height: '280px' }}>
            {/* Donut */}
            <div style={{ width: 180, height: 180, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={punctualityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {(punctualityData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value}%`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Breakdown con progress bars */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(punctualityData || []).map(item => (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>{item.name}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: item.color }}>{item.value}%</span>
                  </div>
                  <div style={{ height: 7, background: '#f1f5f9', borderRadius: 0, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${item.value}%`,
                      background: item.color,
                      borderRadius: 0,
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
