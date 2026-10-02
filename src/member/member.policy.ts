import { Permission, Role } from '@lib/drizzle';

export const DEFAULT_PERMISSION: Record<Role, Permission> = {
  [Role.EDITOR_IN_CHIEF]: Permission.EDITORSHIP,
  [Role.DEPUTY_EDITOR_IN_CHIEF]: Permission.EDITOR,
  [Role.REPORTING_SENIOR_REPORTER]: Permission.EDITOR,
  [Role.SENIOR_DESIGNER]: Permission.EDITOR,
  [Role.DIGITAL_SENIOR_REPORTER]: Permission.EDITOR,
  [Role.REPORTING_REPORTER]: Permission.NONE,
  [Role.DESIGNER]: Permission.NONE,
  [Role.DIGITAL_REPORTER]: Permission.NONE,
  [Role.CUB_REPORTER]: Permission.NONE,
  [Role.ALUMNI]: Permission.NONE,
};

const PERMISSION_ORDER: Record<Permission, number> = {
  [Permission.NONE]: 0,
  [Permission.EDITOR]: 1,
  [Permission.EDITORSHIP]: 2,
};

export const hasPermission = (
  actual: Permission,
  required: Permission,
): boolean => PERMISSION_ORDER[actual] >= PERMISSION_ORDER[required];
