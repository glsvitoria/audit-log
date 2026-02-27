import { Test, TestingModule } from '@nestjs/testing'
import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common'
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'
import { EnterpriseController } from './enterprise.controller'
import { EnterpriseService } from './enterprise.service'
import { AccessTokenGuard } from '@/auth/guards/access-token.guard'
import { randomUUID } from 'crypto'
import { UserRole } from '@/generated/prisma/enums'

describe('Enterprise Controller', () => {
  let app: INestApplication
  let currentUserMock: {
    sub: string
    role: string
    enterpriseId: string | null
  }

  const mockEnterpriseService = {
    create: vi.fn(),
    delete: vi.fn(),
    disable: vi.fn(),
    enable: vi.fn(),
    find: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    currentUserMock = {
      sub: randomUUID(),
      role: UserRole.ADMIN,
      enterpriseId: null,
    }

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [EnterpriseController],
      providers: [
        {
          provide: EnterpriseService,
          useValue: mockEnterpriseService,
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest()
          req.user = currentUserMock
          return true
        },
      })
      .compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Security/Access Control', () => {
    it('should return 403 if user is not ADMIN', async () => {
      currentUserMock.role = UserRole.ENTERPRISE

      const response = await request(app.getHttpServer())
        .get('/enterprise')
      
      expect(response.status).toBe(403)
    })
  })

  describe('(POST /enterprise)', () => {
    it('should return 201 when creating a enterprise', async () => {
      const createDto = {
        corporateReason: 'John Doe Ent.',
        email: 'john@example.com',
        responsibleName: 'John Doe',
        password: 'password123',
        confirmPassword: 'password123',
      }
      mockEnterpriseService.create.mockResolvedValue({ id: randomUUID() })

      const response = await request(app.getHttpServer())
        .post('/enterprise')
        .send(createDto)

      expect(response.status).toBe(201)
      expect(mockEnterpriseService.create).toHaveBeenCalledWith(createDto)
    })
  })

  describe('(GET /enterprise)', () => {
    it('should return a list of enterprises', async () => {
      mockEnterpriseService.findAll.mockResolvedValue({ data: [], total: 0 })

      const response = await request(app.getHttpServer())
        .get('/enterprise')
        .query({ init: 0, limit: 10 })

      expect(response.status).toBe(200)
      expect(mockEnterpriseService.findAll).toHaveBeenCalled()
    })
  })

  describe('(GET /enterprise/:id)', () => {
    it('should return 400 if enterpriseId is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/enterprise/invalid-uuid')

      expect(response.status).toBe(400)
    })

    it('should return a single enterprise', async () => {
      const enterpriseId = randomUUID()
      mockEnterpriseService.find.mockResolvedValue({ id: enterpriseId })

      const response = await request(app.getHttpServer())
        .get(`/enterprise/${enterpriseId}`)

      expect(response.status).toBe(200)
      expect(mockEnterpriseService.find).toHaveBeenCalledWith(enterpriseId)
    })
  })

  describe('(PATCH /enterprise/disable/:id)', () => {
    it('should disable an enterprise', async () => {
      const enterpriseId = randomUUID()
      mockEnterpriseService.disable.mockResolvedValue({ success: true })

      const response = await request(app.getHttpServer())
        .patch(`/enterprise/disable/${enterpriseId}`)

      expect(response.status).toBe(200)
      expect(mockEnterpriseService.disable).toHaveBeenCalledWith(enterpriseId)
    })
  })

  describe('(PATCH /enterprise/enable/:id)', () => {
    it('should enable an enterprise', async () => {
      const enterpriseId = randomUUID()
      mockEnterpriseService.enable.mockResolvedValue({ success: true })

      const response = await request(app.getHttpServer())
        .patch(`/enterprise/enable/${enterpriseId}`)

      expect(response.status).toBe(200)
      expect(mockEnterpriseService.enable).toHaveBeenCalledWith(enterpriseId)
    })
  })

  describe('(PUT /enterprise/:id)', () => {
    it('should update an enterprise', async () => {
      const enterpriseId = randomUUID()
      const updateDto = { corporateReason: 'New Name' }
      mockEnterpriseService.update.mockResolvedValue({ id: enterpriseId, ...updateDto })

      const response = await request(app.getHttpServer())
        .put(`/enterprise/${enterpriseId}`)
        .send(updateDto)

      expect(response.status).toBe(200)
      expect(mockEnterpriseService.update).toHaveBeenCalledWith(enterpriseId, updateDto)
    })
  })

  describe('(DELETE /enterprise/:id)', () => {
    it('should delete an enterprise', async () => {
      const enterpriseId = randomUUID()
      mockEnterpriseService.delete.mockResolvedValue({ success: true })

      const response = await request(app.getHttpServer())
        .delete(`/enterprise/${enterpriseId}`)

      expect(response.status).toBe(200)
      expect(mockEnterpriseService.delete).toHaveBeenCalledWith(enterpriseId)
    })
  })
})