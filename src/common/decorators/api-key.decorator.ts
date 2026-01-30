import { ApiKeyGuard } from '@/auth/guards/api-key.guard'
import { UseGuards } from '@nestjs/common'

export const ApiKeyAuth = () => UseGuards(ApiKeyGuard)
