import { StrategiesHelper } from '@/common/helpers/strategies.helper'
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
@Injectable()
export class AccessTokenGuard extends AuthGuard(
	StrategiesHelper.ACCESS_TOKEN_STRATEGY
) {}
