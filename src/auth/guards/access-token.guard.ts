import { StrategiesHelper } from '@/common/helpers/strategies.helper'
import { AuthGuard } from '@nestjs/passport'

export class AccessTokenGuard extends AuthGuard(
	StrategiesHelper.ACCESS_TOKEN_STRATEGY
) {}
