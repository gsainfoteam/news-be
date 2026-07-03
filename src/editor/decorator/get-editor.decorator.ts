import { EditorEntity } from '@lib/drizzle';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetEditor = createParamDecorator(
  (_data, ctx: ExecutionContext): EditorEntity => {
    const req = ctx.switchToHttp().getRequest<{ editorInfo: EditorEntity }>();

    return req.editorInfo;
  },
);
