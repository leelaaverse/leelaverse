import { Request, Response } from 'express';
import { register, login, logout, getMe } from '../../controllers/authController';
import { AppError } from '../../middleware/errorHandler';

// Mock dependencies
jest.mock('../../config/database', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../config/config', () => ({
  config: {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '7d',
    BCRYPT_SALT_ROUNDS: 12,
    NODE_ENV: 'test',
  },
}));

// Mock bcryptjs module
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

const mockPrisma = require('../../config/database').prisma;
const mockBcrypt = require('bcryptjs');

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('jwt-token'),
}));

// Extend Request type for authenticated requests
interface MockAuthenticatedRequest extends Partial<Request> {
  user?: { id: string };
}

describe('Auth Controller', () => {
  let mockReq: MockAuthenticatedRequest;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      mockReq.body = userData;

      const mockUser = {
        id: 'user-id',
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: null,
        verified: false,
        createdAt: new Date(),
      };

      mockPrisma.user.findFirst.mockResolvedValue(null);
      // mockBcrypt.genSalt.mockResolvedValue('salt'); // Already set in mock definition
      // mockBcrypt.hash.mockResolvedValue('hashed-password'); // Already set in mock definition
      mockPrisma.user.create.mockResolvedValue(mockUser);
      // mockJwt.sign.mockReturnValue('jwt-token'); // Already set in mock definition

      await register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: userData.email },
            { username: userData.username },
          ],
        },
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          username: userData.username,
          password: 'hashed-password',
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.cookie).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        token: 'jwt-token',
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        }),
      });
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      mockReq.body = userData;

      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'existing-id',
        email: userData.email,
      });

      await register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AppError)
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockReq.body = loginData;

      const mockUser = {
        id: 'user-id',
        email: loginData.email,
        username: 'testuser',
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        verified: false,
        createdAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      // mockBcrypt.compare is already mocked to return true
      mockPrisma.user.update.mockResolvedValue(mockUser);
      // mockJwt.sign.mockReturnValue('jwt-token'); // Already set in mock definition

      await login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });

      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        token: 'jwt-token',
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
      });
    });

    it('should throw error for invalid email', async () => {
      mockReq.body = { email: 'nonexistent@example.com', password: 'password123' };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AppError)
      );
    });

    it('should throw error for invalid password', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      mockReq.body = { email: mockUser.email, password: 'wrongpassword' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValueOnce(false);

      await login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AppError)
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      await logout(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.cookie).toHaveBeenCalledWith('token', '', {
        httpOnly: true,
        expires: expect.any(Date),
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });

  describe('getMe', () => {
    it('should get current user profile', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        bio: 'Test bio',
        avatar: 'avatar.jpg',
        location: 'Test City',
        website: 'https://test.com',
        verified: true,
        pro: false,
        coins: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          posts: 5,
          followers: 10,
          follows: 8,
        },
      };

      mockReq.user = { id: mockUser.id };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await getMe(mockReq as any, mockRes as Response, mockNext);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: expect.objectContaining({
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          verified: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              follows: true,
            },
          },
        }),
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        user: mockUser,
      });
    });

    it('should throw error if user not found', async () => {
      mockReq.user = { id: 'nonexistent-id' };
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await getMe(mockReq as any, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AppError)
      );
    });
  });
});
