import {
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EditorService } from '../editor.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { EditorEntity, UserEntity } from '@lib/drizzle';
import { Role } from 'src/user/enum/role.enum';
import { ROLE_KEY } from '../decorator/role.decorator';

interface EditorRequest extends Request {
  user: UserEntity;
  role: Role;
  editorInfo: EditorEntity;
}

@Injectable()
export class EditorGuard extends AuthGuard('jwt') {
  constructor(
    private readonly editorService: EditorService,
    private reflector: Reflector,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authenticated = await super.canActivate(context);
    if (!authenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest<EditorRequest>();
    const user = request.user;
    if (!user) {
      return false;
    }
    const editor = await this.editorService.findEditorByEmail(user.email);
    if (!editor) {
      throw new ForbiddenException('User is not editor');
    }
    const role = editor.isEditorship ? Role.EDITORSHIP : Role.EDITOR;
    const requiredRole = this.reflector.getAllAndOverride<Role>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRole === Role.EDITORSHIP && requiredRole !== role) return false;

    return true;
  }
}
