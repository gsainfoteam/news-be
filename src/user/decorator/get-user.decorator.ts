import { UserEntity } from '@lib/drizzle/entity/user.entity';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): UserEntity => {
    const req = ctx.switchToHttp().getRequest<{ user: UserEntity }>();

    return req.user;
  },
);
