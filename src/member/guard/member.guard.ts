import {
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MemberService } from '../member.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { MemberEntity, Permission, UserEntity } from '@lib/drizzle';
import { PERMISSION_KEY } from '../decorator/permission.decorator';
import { hasPermission } from '../member.policy';

interface MemberRequest extends Request {
  user: UserEntity;
  memberInfo: MemberEntity;
}

@Injectable()
export class MemberGuard extends AuthGuard('jwt') {
  constructor(
    private readonly memberService: MemberService,
    private reflector: Reflector,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authenticated = await super.canActivate(context);
    if (!authenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest<MemberRequest>();
    const user = request.user;
    if (!user) return false;

    const member = await this.memberService.findMemberByEmail(user.email);
    if (!member) throw new ForbiddenException('User is not a member');

    request.memberInfo = member;

    const requiredPermission =
      this.reflector.getAllAndOverride<Permission>(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? Permission.EDITOR;

    if (!hasPermission(member.permission, requiredPermission))
      throw new ForbiddenException(
        `This action requires ${requiredPermission} permission`,
      );

    return true;
  }
}
