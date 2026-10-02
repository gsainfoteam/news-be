import { MemberEntity } from '@lib/drizzle';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetMember = createParamDecorator(
  (_data, ctx: ExecutionContext): MemberEntity => {
    const req = ctx.switchToHttp().getRequest<{ memberInfo: MemberEntity }>();

    return req.memberInfo;
  },
);
