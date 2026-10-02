import { SetMetadata } from '@nestjs/common';
import { Permission } from '@lib/drizzle';

export const PERMISSION_KEY = 'permission';
export const RequiredPermission = (permission: Permission) =>
  SetMetadata(PERMISSION_KEY, permission);
