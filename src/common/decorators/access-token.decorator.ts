import { AccessTokenGuard } from '@/auth/guards/access-token.guard'
import { UseGuards } from '@nestjs/common'

export const AccessTokenAuth = () => UseGuards(AccessTokenGuard)
