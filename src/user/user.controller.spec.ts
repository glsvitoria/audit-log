import { Test, TestingModule } from '@nestjs/testing'
import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common'
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { AccessTokenGuard } from '@/auth/guards/access-token.guard'
import { randomUUID } from 'crypto'
import { UserRole } from '@/generated/prisma/enums'

describe('User Controller', () => {
  let app: INestApplication
  let currentUserMock: {
    sub: string
    role: string
    enterpriseId: string | null
  }

  const mockUserService = {
    create: vi.fn(),
    update: vi.fn(),
    profile: vi.fn(),
    delete: vi.fn(),
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    currentUserMock = {
      sub: randomUUID(),
      role: UserRole.ADMIN,
      enterpriseId: randomUUID(),
    }

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
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
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('(POST /user)', () => {
    it('should return 201 when creating a user', async () => {
      mockUserService.create.mockResolvedValue({ id: randomUUID() })

      const response = await request(app.getHttpServer()).post('/user').send({
        email: 'john@example.com',
        name: 'John Doe',
        password: 'password123',
        confirmPassword: 'password123',
        enterpriseId: randomUUID(),
      })

      expect(response.status).toBe(201)
      expect(mockUserService.create).toHaveBeenCalled()
    })

    it('should return 400 if target id is not a valid UUID', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/user/invalid-id'
      )

      expect(response.status).toBe(400)
    })
  })

  describe('(GET /user/profile)', () => {
    it('should return user profile when role is ENTERPRISE', async () => {
      currentUserMock.role = UserRole.ENTERPRISE
      mockUserService.profile.mockResolvedValue({ id: currentUserMock.sub })

      const response = await request(app.getHttpServer()).get('/user/profile')

      expect(response.status).toBe(200)
      expect(mockUserService.profile).toHaveBeenCalledWith(currentUserMock.sub)
    })
  })

  describe('(PUT /user/profile)', () => {
    it('should be able to update own profile', async () => {
      currentUserMock.role = UserRole.ENTERPRISE
      const updateDto = { name: 'John Updated' }
      mockUserService.update.mockResolvedValue({ id: currentUserMock.sub, ...updateDto })

      const response = await request(app.getHttpServer())
        .put('/user/profile')
        .send(updateDto)

      expect(response.status).toBe(200)
      expect(mockUserService.update).toHaveBeenCalledWith(updateDto, currentUserMock.sub)
    })
  })

  describe('(DELETE /user/:id)', () => {
    it('should be able to delete a user as ADMIN', async () => {
      const targetId = randomUUID()
      mockUserService.delete.mockResolvedValue({ success: true })

      const response = await request(app.getHttpServer()).delete(`/user/${targetId}`)

      expect(response.status).toBe(200)
      expect(mockUserService.delete).toHaveBeenCalledWith(targetId)
    })

    it('should return 403 if a non-admin tries to delete a user', async () => {
      currentUserMock.role = UserRole.ENTERPRISE
      
      const response = await request(app.getHttpServer()).delete(`/user/${randomUUID()}`)

      expect(response.status).toBe(403)
    })
  })

  describe('(PUT /user/:id)', () => {
    it('should be able to update any user as ADMIN', async () => {
      const targetId = randomUUID()
      const updateDto = { name: 'Admin Change' }
      mockUserService.update.mockResolvedValue({ id: targetId })

      const response = await request(app.getHttpServer())
        .put(`/user/${targetId}`)
        .send(updateDto)

      expect(response.status).toBe(200)
      expect(mockUserService.update).toHaveBeenCalledWith(updateDto, targetId)
    })
  })
})