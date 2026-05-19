
const seed = async () => {
  try {
    console.log('Creating Employee...');
    const empResponse = await fetch('http://localhost:3000/empleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Juan',
        apellidos: 'Perez',
        numeroEmpleado: 'EMP001',
        puesto: 'Desarrollador',
        area: 'TI',
        email: 'juan@test.com',
        telefono: '1234567890',
        fechaContratacion: '2024-01-01',
        fechaNacimiento: '1990-01-01',
        direccion: 'Calle Test'
      })
    });

    if (!empResponse.ok) {
        const text = await empResponse.text();
        console.log('Employee creation failed or already exists:', text);
    } else {
        const emp = await empResponse.json();
        console.log('Employee created:', emp);
    }

    console.log('Creating Attendance...');
    // Assuming ID 1 for simplicity, or we could fetch the list to find an ID
    const attResponse = await fetch('http://localhost:3000/asistencias/registrar/1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipoRegistro: 'manual' })
    });

    if (!attResponse.ok) {
        const text = await attResponse.text();
        console.log('Attendance creation failed:', text);
    } else {
        const att = await attResponse.json();
        console.log('Attendance created:', att);
    }

  } catch (error) {
    console.error('Seed script error:', error);
  }
};

seed();
