'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api-client';
import styles from './page.module.css';

export default function EmpleadosPage() {
  // Estados
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpleado, setSelectedEmpleado] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  
  // Edición
  const [isEditing, setIsEditing] = useState(false);
  const [editEmployee, setEditEmployee] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [userRole, setUserRole] = useState('');
  
  // Nuevo empleado form state
  const [newEmployee, setNewEmployee] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    puesto: '',
    area: '',
    numeroEmpleado: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    estatus: 'activo'
  });

  // Cargar empleados al inicio
  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUserRole(u.rol || '');
    }
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      const data = await api.get('/empleados');
      // Support both paginated and array responses
      const list = Array.isArray(data) ? data : data.data ?? [];
      setEmpleados(list);
      
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const editId = params.get('editId');
        if (editId) {
          const emp = list.find((e: any) => e.id === Number(editId));
          if (emp) {
            setSelectedEmpleado(emp);
            setEditEmployee({...emp});
            setIsEditing(true);
            setShowModal(true);
            
            const url = new URL(window.location.href);
            url.searchParams.delete('editId');
            window.history.replaceState({}, '', url.toString());
          }
        }
      }
    } catch {
      setError('No se pudieron cargar los empleados');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = empleados.filter(emp =>
    emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.numeroEmpleado?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerDetalle = (empleado: any) => {
    setSelectedEmpleado(empleado);
    setEditEmployee({...empleado});
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditEmployee({...selectedEmpleado});
  };

  const handleUpdateEmployee = async () => {
    try {
      await api.patch(`/empleados/${selectedEmpleado.id}`, editEmployee);
      await fetchEmpleados();
      setShowModal(false);
      setIsEditing(false);
      toast.success('Empleado actualizado correctamente');
    } catch {
      // Error handled by api-client
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEmpleado) return;

    const formData = new FormData();
    formData.append('foto', file);

    try {
      setUploading(true);
      const res = await api.post(`/empleados/${selectedEmpleado.id}/upload-photo`, formData);
      
      const newPhotoUrl = res.fotoUrl;
      setSelectedEmpleado({ ...selectedEmpleado, fotoUrl: newPhotoUrl });
      setEditEmployee({ ...editEmployee, fotoUrl: newPhotoUrl });
      fetchEmpleados();
      toast.success('Foto actualizada');
    } catch (err) {
      toast.error('Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const handleNuevoEmpleado = () => {
    // Generar número de empleado sugerido (simple)
    const lastId = empleados.length > 0 ? Math.max(...empleados.map(e => e.id)) : 0;
    setNewEmployee({
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      puesto: '',
      area: '',
      numeroEmpleado: `EMP${String(lastId + 2).padStart(3, '0')}`,
      fechaIngreso: new Date().toISOString().split('T')[0],
      estatus: 'activo'
    });
    setShowNewEmployeeModal(true);
  };

  const handleSaveNewEmployee = async () => {
    try {
      await api.post('/empleados', newEmployee);
      await fetchEmpleados();
      setShowNewEmployeeModal(false);
      toast.success('Empleado guardado correctamente');
    } catch {
      // Error handled by api-client
    }
  };

  const isAdmin = userRole === 'administrador';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gestión de Empleados</h2>
        {isAdmin && <button className="btn btn-primary" onClick={handleNuevoEmpleado}>+ Nuevo Empleado</button>}
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <input
          type="text"
          className="input"
          placeholder="Buscar por nombre, apellido o número de empleado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Nombre Completo</th>
              <th>Puesto</th>
              <th>Área</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((empleado) => (
              <tr key={empleado.id}>
                <td style={{ fontWeight: 600 }}>{empleado.numeroEmpleado}</td>
                <td>{empleado.nombre} {empleado.apellidos}</td>
                <td>{empleado.puesto}</td>
                <td>{empleado.area}</td>
                <td>
                  <span className={`badge ${empleado.estatus === 'activo' ? 'badge-success' : 'badge-error'}`}>
                    {empleado.estatus}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.75rem' }}
                    onClick={() => handleVerDetalle(empleado)}
                  >
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No se encontraron empleados
          </div>
        )}
      </div>

      <div style={{ marginTop: 'var(--spacing-lg)', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        Mostrando {filteredData.length} empleados
      </div>

      {/* Modal de detalle */}
      {showModal && selectedEmpleado && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--spacing-lg)'
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="card" 
            style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Detalle del Empleado</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '1.5rem', 
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--spacing-lg)', gap: 'var(--spacing-md)' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '0', 
                backgroundColor: 'var(--color-bg-alt)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden',
                border: '2px solid var(--color-border)',
                position: 'relative'
              }}>
                {selectedEmpleado.fotoUrl ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${selectedEmpleado.fotoUrl}`}
                    alt="Foto de empleado"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <span style={{ fontSize: '3rem', color: 'var(--color-text-secondary)' }}>👤</span>
                )}
                {uploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem' }}>
                    Subiendo...
                  </div>
                )}
              </div>
              <label className="btn btn-outline" style={{ fontSize: '0.75rem', cursor: 'pointer' }}>
                {selectedEmpleado.fotoUrl ? 'Cambiar Foto' : 'Subir Foto'}
                <input type="file" accept=".jpg,.jpeg,.png" hidden onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                  Número de Empleado
                </label>
                {isEditing ? (
                  <input 
                    className="input" 
                    value={editEmployee.numeroEmpleado} 
                    onChange={e => setEditEmployee({...editEmployee, numeroEmpleado: e.target.value})}
                  />
                ) : (
                  <div style={{ fontWeight: 600 }}>{selectedEmpleado.numeroEmpleado}</div>
                )}
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                  Nombre
                </label>
                {isEditing ? (
                  <input 
                    className="input" 
                    value={editEmployee.nombre} 
                    onChange={e => setEditEmployee({...editEmployee, nombre: e.target.value})}
                  />
                ) : (
                  <div style={{ fontWeight: 600 }}>{selectedEmpleado.nombre}</div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                  Apellidos
                </label>
                {isEditing ? (
                  <input 
                    className="input" 
                    value={editEmployee.apellidos} 
                    onChange={e => setEditEmployee({...editEmployee, apellidos: e.target.value})}
                  />
                ) : (
                  <div style={{ fontWeight: 600 }}>{selectedEmpleado.apellidos}</div>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                    Puesto
                  </label>
                  {isEditing ? (
                    <input 
                      className="input" 
                      value={editEmployee.puesto} 
                      onChange={e => setEditEmployee({...editEmployee, puesto: e.target.value})}
                    />
                  ) : (
                    <div>{selectedEmpleado.puesto}</div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                    Área
                  </label>
                  {isEditing ? (
                    <select 
                      className="input"
                      value={editEmployee.area}
                      onChange={(e) => setEditEmployee({...editEmployee, area: e.target.value})}
                    >
                      <option value="Tecnología">Tecnología</option>
                      <option value="Diseño">Diseño</option>
                      <option value="Administración">Administración</option>
                      <option value="Finanzas">Finanzas</option>
                      <option value="Ventas">Ventas</option>
                      <option value="Recursos Humanos">Recursos Humanos</option>
                      <option value="Operaciones">Operaciones</option>
                    </select>
                  ) : (
                    <div>{selectedEmpleado.area}</div>
                  )}
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                  Email
                </label>
                {isEditing ? (
                  <input 
                    className="input" 
                    value={editEmployee.email} 
                    onChange={e => setEditEmployee({...editEmployee, email: e.target.value})}
                  />
                ) : (
                  <div>{selectedEmpleado.email}</div>
                )}
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                  Teléfono
                </label>
                {isEditing ? (
                  <input 
                    className="input" 
                    value={editEmployee.telefono} 
                    onChange={e => setEditEmployee({...editEmployee, telefono: e.target.value})}
                  />
                ) : (
                  <div>{selectedEmpleado.telefono}</div>
                )}
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                  Estado
                </label>
                {isEditing ? (
                   <select 
                    className="input"
                    value={editEmployee.estatus}
                    onChange={(e) => setEditEmployee({...editEmployee, estatus: e.target.value})}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                ) : (
                  <span className={`badge ${selectedEmpleado.estatus === 'activo' ? 'badge-success' : 'badge-error'}`}>
                    {selectedEmpleado.estatus}
                  </span>
                )}
              </div>
            </div>
            
            <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              {isEditing ? (
                <>
                  <button className="btn btn-outline" onClick={handleCancelEdit}>
                    Cancelar
                  </button>
                  <button className="btn btn-primary" onClick={handleUpdateEmployee}>
                    Guardar Cambios
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-outline" onClick={() => setShowModal(false)}>
                    Cerrar
                  </button>
                  {isAdmin && (
                    <button className="btn btn-primary" onClick={handleEditClick}>
                      Editar
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de nuevo empleado */}
      {showNewEmployeeModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--spacing-lg)'
          }}
          onClick={() => setShowNewEmployeeModal(false)}
        >
          <div 
            className="card" 
            style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Nuevo Empleado</h3>
              <button 
                onClick={() => setShowNewEmployeeModal(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '1.5rem', 
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              <div>
                <label className="label">Número de Empleado</label>
                <input 
                  type="text" 
                  className="input"
                  value={newEmployee.numeroEmpleado}
                  onChange={(e) => setNewEmployee({...newEmployee, numeroEmpleado: e.target.value})}
                  placeholder="EMP000"
                />
              </div>

              <div>
                <label className="label">Nombre</label>
                <input 
                  type="text" 
                  className="input"
                  value={newEmployee.nombre}
                  onChange={(e) => setNewEmployee({...newEmployee, nombre: e.target.value})}
                  placeholder="Ingrese el nombre"
                />
              </div>
              
              <div>
                <label className="label">Apellidos</label>
                <input 
                  type="text" 
                  className="input"
                  value={newEmployee.apellidos}
                  onChange={(e) => setNewEmployee({...newEmployee, apellidos: e.target.value})}
                  placeholder="Ingrese los apellidos"
                />
              </div>
              
              <div>
                <label className="label">Email</label>
                <input 
                  type="email" 
                  className="input"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  placeholder="correo@empresa.com"
                />
              </div>
              
              <div>
                <label className="label">Teléfono</label>
                <input 
                  type="tel" 
                  className="input"
                  value={newEmployee.telefono}
                  onChange={(e) => setNewEmployee({...newEmployee, telefono: e.target.value})}
                  placeholder="555-0000"
                />
              </div>
              
              <div>
                <label className="label">Puesto</label>
                <input 
                  type="text" 
                  className="input"
                  value={newEmployee.puesto}
                  onChange={(e) => setNewEmployee({...newEmployee, puesto: e.target.value})}
                  placeholder="Ej: Desarrollador"
                />
              </div>
              
              <div>
                <label className="label">Área</label>
                <select 
                  className="input"
                  value={newEmployee.area}
                  onChange={(e) => setNewEmployee({...newEmployee, area: e.target.value})}
                >
                  <option value="">Seleccione un área</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Diseño">Diseño</option>
                  <option value="Administración">Administración</option>
                  <option value="Finanzas">Finanzas</option>
                  <option value="Ventas">Ventas</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Operaciones">Operaciones</option>
                </select>
              </div>

              <div>
                <label className="label">Fecha de Ingreso</label>
                <input 
                  type="date" 
                  className="input"
                  value={newEmployee.fechaIngreso}
                  onChange={(e) => setNewEmployee({...newEmployee, fechaIngreso: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="label">Estado</label>
                <select 
                  className="input"
                  value={newEmployee.estatus}
                  onChange={(e) => setNewEmployee({...newEmployee, estatus: e.target.value})}
                  required
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowNewEmployeeModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSaveNewEmployee}>
                Guardar Empleado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
