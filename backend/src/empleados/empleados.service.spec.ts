import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmpleadosService } from './empleados.service';
import { Empleado } from './empleado.entity';

const mockEmpleado: Partial<Empleado> = {
  id: 1,
  numeroEmpleado: 'EMP001',
  nombre: 'Juan',
  apellidos: 'Pérez',
  puesto: 'Desarrollador',
  area: 'Tecnología',
  estatus: 'activo',
};

const mockEmpleadoRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
};

describe('EmpleadosService', () => {
  let service: EmpleadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpleadosService,
        { provide: getRepositoryToken(Empleado), useValue: mockEmpleadoRepository },
      ],
    }).compile();

    service = module.get<EmpleadosService>(EmpleadosService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an empleado successfully', async () => {
      mockEmpleadoRepository.findOne.mockResolvedValue(null);
      mockEmpleadoRepository.create.mockReturnValue(mockEmpleado);
      mockEmpleadoRepository.save.mockResolvedValue(mockEmpleado);

      const result = await service.create({
        numeroEmpleado: 'EMP001',
        nombre: 'Juan',
        apellidos: 'Pérez',
        puesto: 'Desarrollador',
        area: 'Tecnología',
        fechaIngreso: '2024-01-01',
        estatus: 'activo',
      });

      expect(result).toEqual(mockEmpleado);
      expect(mockEmpleadoRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when numero empleado already exists', async () => {
      mockEmpleadoRepository.findOne.mockResolvedValue(mockEmpleado);

      await expect(
        service.create({
          numeroEmpleado: 'EMP001',
          nombre: 'Otro',
          apellidos: 'Empleado',
          puesto: 'Cargo',
          area: 'Área',
          fechaIngreso: '2024-01-01',
          estatus: 'activo',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return an empleado when found', async () => {
      mockEmpleadoRepository.findOne.mockResolvedValue(mockEmpleado);

      const result = await service.findOne(1);

      expect(result).toEqual(mockEmpleado);
    });

    it('should throw NotFoundException when not found', async () => {
      mockEmpleadoRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivate', () => {
    it('should set estatus to inactivo', async () => {
      const empleadoActivo = { ...mockEmpleado, estatus: 'activo' };
      mockEmpleadoRepository.findOne.mockResolvedValue(empleadoActivo);
      mockEmpleadoRepository.save.mockResolvedValue({ ...empleadoActivo, estatus: 'inactivo' });

      const result = await service.deactivate(1);

      expect(result.estatus).toBe('inactivo');
      expect(mockEmpleadoRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ estatus: 'inactivo' }),
      );
    });
  });

  describe('findAll with pagination', () => {
    it('should return paginated result when pagination is provided', async () => {
      const data = [mockEmpleado];
      mockEmpleadoRepository.findAndCount.mockResolvedValue([data, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('totalPages', 1);
    });

    it('should return plain array when pagination is not provided', async () => {
      mockEmpleadoRepository.find.mockResolvedValue([mockEmpleado]);

      const result = await service.findAll();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
