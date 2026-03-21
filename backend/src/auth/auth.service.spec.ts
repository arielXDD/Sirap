import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Usuario } from '../usuarios/usuario.entity';

const mockUsuario = {
  id: 1,
  username: 'admin',
  passwordHash: '$2b$10$hGgZyolyCgB65V6lq7CJmO71w6xrM76NXm.W4pgv/A1vJ1SNr9sfi', // admin124
  rol: 'administrador',
  activo: true,
  empleadoId: 1,
  empleado: {
    id: 1,
    numeroEmpleado: 'ADMIN001',
    nombre: 'Administrador',
    apellidos: 'del Sistema',
    puesto: 'Administrador TI',
    area: 'Tecnología',
  },
};

const mockQueryBuilder = {
  addSelect: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
};

const mockUsuarioRepository = {
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
  findOne: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Usuario), useValue: mockUsuarioRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return token when credentials are valid', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUsuario);

      const result = await service.login({ username: 'admin', password: 'admin124' });

      expect(result).toHaveProperty('access_token', 'mock-token');
      expect(result).toHaveProperty('usuario');
      expect(result.usuario.username).toBe('admin');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        service.login({ username: 'noexiste', password: 'cualquier' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUsuario);

      await expect(
        service.login({ username: 'admin', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject plaintext passwords that match the hash string but are not the real password', async () => {
      // The stored hash looks nothing like "admin124", so direct string comparison would fail
      mockQueryBuilder.getOne.mockResolvedValue(mockUsuario);

      // Passing the raw hash as the password should fail (not equal to original plaintext)
      await expect(
        service.login({ username: 'admin', password: mockUsuario.passwordHash }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return usuario when found', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(mockUsuario);

      const result = await service.validateUser({ sub: 1, username: 'admin', rol: 'administrador', empleadoId: 1 });

      expect(result).toEqual(mockUsuario);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validateUser({ sub: 99, username: 'ghost', rol: 'empleado', empleadoId: 99 }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
