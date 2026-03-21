import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AsistenciasService } from './asistencias.service';
import { Asistencia } from './asistencia.entity';
import { Empleado } from '../empleados/empleado.entity';
import { Horario } from '../horarios/horario.entity';
import { Vacacion } from '../vacaciones/vacacion.entity';
import { Permiso } from '../permisos/permiso.entity';
import { DiaFestivo } from '../dias-festivos/dia-festivo.entity';

const mockEmpleado: Partial<Empleado> = {
  id: 1,
  numeroEmpleado: 'EMP001',
  nombre: 'Juan',
  apellidos: 'Pérez',
  estatus: 'activo',
};

const mockHorario: Partial<Horario> = {
  id: 1,
  empleadoId: 1,
  diaSemana: 'lunes',
  horaEntrada: '09:00',
  horaSalida: '18:00',
  toleranciaMinutos: 15,
  activo: true,
};

const createMockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  }),
});

describe('AsistenciasService', () => {
  let service: AsistenciasService;
  let asistenciaRepo: ReturnType<typeof createMockRepo>;
  let empleadoRepo: ReturnType<typeof createMockRepo>;
  let horarioRepo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    asistenciaRepo = createMockRepo();
    empleadoRepo = createMockRepo();
    horarioRepo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsistenciasService,
        { provide: getRepositoryToken(Asistencia), useValue: asistenciaRepo },
        { provide: getRepositoryToken(Empleado), useValue: empleadoRepo },
        { provide: getRepositoryToken(Horario), useValue: horarioRepo },
        { provide: getRepositoryToken(Vacacion), useValue: createMockRepo() },
        { provide: getRepositoryToken(Permiso), useValue: createMockRepo() },
        { provide: getRepositoryToken(DiaFestivo), useValue: createMockRepo() },
      ],
    }).compile();

    service = module.get<AsistenciasService>(AsistenciasService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registrarAsistencia', () => {
    it('should throw NotFoundException when empleado not found', async () => {
      empleadoRepo.findOne.mockResolvedValue(null);

      await expect(service.registrarAsistencia(999)).rejects.toThrow(NotFoundException);
    });

    it('should register entrada when no asistencia exists for the day', async () => {
      empleadoRepo.findOne.mockResolvedValue(mockEmpleado);
      asistenciaRepo.findOne.mockResolvedValue(null);
      horarioRepo.findOne.mockResolvedValue(null);
      const newAsistencia = { id: 1, empleadoId: 1, estado: 'puntual', horaEntrada: '09:00' };
      asistenciaRepo.create.mockReturnValue(newAsistencia);
      asistenciaRepo.save.mockResolvedValue(newAsistencia);

      const result = await service.registrarAsistencia(1);

      expect(asistenciaRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('horaEntrada');
    });

    it('should throw BadRequestException when salida already registered', async () => {
      empleadoRepo.findOne.mockResolvedValue(mockEmpleado);
      asistenciaRepo.findOne.mockResolvedValue({
        id: 1,
        empleadoId: 1,
        horaEntrada: '09:00',
        horaSalida: '18:00',
      });

      await expect(service.registrarAsistencia(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('calcularMinutosRetardo (via registrarAsistencia)', () => {
    it('should mark as puntual when entrada is on time', async () => {
      empleadoRepo.findOne.mockResolvedValue(mockEmpleado);
      asistenciaRepo.findOne.mockResolvedValue(null);
      horarioRepo.findOne.mockResolvedValue({ ...mockHorario, horaEntrada: '09:00', toleranciaMinutos: 15 });

      const asistenciaCreada: any = {};
      asistenciaRepo.create.mockImplementation((data: any) => ({ ...data }));
      asistenciaRepo.save.mockImplementation(async (a: any) => a);

      // Simulate 9:05 entry — within tolerance
      jest.spyOn(Date.prototype, 'toTimeString').mockReturnValue('09:05:00 GMT-0600');

      const result = await service.registrarAsistencia(1);

      expect(result.estado).toBe('puntual');

      jest.restoreAllMocks();
    });

    it('should mark as retardo when entrada exceeds tolerance', async () => {
      empleadoRepo.findOne.mockResolvedValue(mockEmpleado);
      asistenciaRepo.findOne.mockResolvedValue(null);
      horarioRepo.findOne.mockResolvedValue({ ...mockHorario, horaEntrada: '09:00', toleranciaMinutos: 5 });

      asistenciaRepo.create.mockImplementation((data: any) => ({ ...data }));
      asistenciaRepo.save.mockImplementation(async (a: any) => a);

      // Simulate 09:20 entry — 20 min late, tolerance 5
      jest.spyOn(Date.prototype, 'toTimeString').mockReturnValue('09:20:00 GMT-0600');

      const result = await service.registrarAsistencia(1);

      expect(result.estado).toBe('retardo');
      expect(result.minutosRetardo).toBe(20);

      jest.restoreAllMocks();
    });
  });

  describe('generarFaltasAutomaticas', () => {
    it('should skip when the day is festivo', async () => {
      const mockDiaFestivoRepo = {
        findOne: jest.fn().mockResolvedValue({ id: 1, fecha: new Date(), descripcion: 'Festivo' }),
      };

      // Re-create the module with the festivo repo returning a value
      const moduleRef = await Test.createTestingModule({
        providers: [
          AsistenciasService,
          { provide: getRepositoryToken(Asistencia), useValue: asistenciaRepo },
          { provide: getRepositoryToken(Empleado), useValue: empleadoRepo },
          { provide: getRepositoryToken(Horario), useValue: horarioRepo },
          { provide: getRepositoryToken(Vacacion), useValue: createMockRepo() },
          { provide: getRepositoryToken(Permiso), useValue: createMockRepo() },
          { provide: getRepositoryToken(DiaFestivo), useValue: mockDiaFestivoRepo },
        ],
      }).compile();

      const svc = moduleRef.get<AsistenciasService>(AsistenciasService);
      await svc.generarFaltasAutomaticas(new Date());

      // Should not have called empleado.find (bails out early)
      expect(empleadoRepo.find).not.toHaveBeenCalled();
    });
  });
});
