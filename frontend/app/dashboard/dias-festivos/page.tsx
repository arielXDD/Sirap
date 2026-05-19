'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api-client';
import styles from './page.module.css';

export default function DiasFestivosPage() {
  const [dias, setDias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDia, setNewDia] = useState({
    fecha: '',
    descripcion: '',
    tipo: 'no_laborable'
  });

  useEffect(() => {
    fetchDias();
  }, []);

  const fetchDias = async () => {
    try {
      setLoading(true);
      const data = await api.get('/dias-festivos?limit=100');
      const lista: any[] = Array.isArray(data) ? data : data.data ?? [];
      lista.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      setDias(lista);
    } catch {
      // Error handled by api
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/dias-festivos', newDia);
      toast.success('Día festivo registrado');
      setShowModal(false);
      setNewDia({ fecha: '', descripcion: '', tipo: 'no_laborable' });
      fetchDias();
    } catch {
      // Error handled by api
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este día festivo?')) return;
    try {
      await api.delete(`/dias-festivos/${id}`);
      toast.success('Día festivo eliminado');
      fetchDias();
    } catch {
      // Error handled by api
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Calendario de Días Festivos</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Agregar Festivo</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dias.map(dia => (
              <tr key={dia.id}>
                <td>{new Date(dia.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                <td>{dia.descripcion}</td>
                <td>
                  <span className={`badge ${dia.tipo === 'no_laborable' ? 'badge-error' : 'badge-warning'}`}>
                    {dia.tipo.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                    onClick={() => handleDelete(dia.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {dias.length === 0 && !loading && (
          <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No hay días festivos registrados
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className="card" style={{ maxWidth: '450px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3>Registrar Día Festivo</h3>
            <form onSubmit={handleSubmit} style={{ marginTop: 'var(--spacing-lg)' }}>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="label">Fecha</label>
                <input 
                  type="date" className="input" required
                  value={newDia.fecha}
                  onChange={e => setNewDia({...newDia, fecha: e.target.value})}
                />
              </div>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="label">Descripción</label>
                <input 
                  type="text" className="input" required
                  placeholder="Ej: Navidad, Año Nuevo"
                  value={newDia.descripcion}
                  onChange={e => setNewDia({...newDia, descripcion: e.target.value})}
                />
              </div>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label className="label">Tipo</label>
                <select 
                  className="input"
                  value={newDia.tipo}
                  onChange={e => setNewDia({...newDia, tipo: e.target.value})}
                >
                  <option value="no_laborable">No Laborable (General)</option>
                  <option value="laborable_especial">Laborable Especial</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
