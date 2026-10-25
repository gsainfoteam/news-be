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

const ROLE_TITLE: Record<Role, string> = {
  [Role.EDITOR_IN_CHIEF]: '편집장',
  [Role.DEPUTY_EDITOR_IN_CHIEF]: '부편집장',
  [Role.REPORTING_SENIOR_REPORTER]: '취재부 책임기자',
  [Role.SENIOR_DESIGNER]: '책임 디자이너',
  [Role.DIGITAL_SENIOR_REPORTER]: '디지털콘텐츠부 책임기자',
  [Role.REPORTING_REPORTER]: '취재부 정기자',
  [Role.DESIGNER]: '디자이너',
  [Role.DIGITAL_REPORTER]: '디지털콘텐츠부 정기자',
  [Role.CUB_REPORTER]: '수습기자',
  [Role.ALUMNI]: '거쳐간 사람(나간 부원)',
};

// Swagger description에 붙이는 직책 표: `ROLE`: 직책명 (기본 권한)
export const ROLE_DOC = Object.values(Role)
  .map(
    (role) =>
      `- \`${role}\`: ${ROLE_TITLE[role]} (${DEFAULT_PERMISSION[role]})`,
  )
  .join('\n');

export const REGISTRABLE_ROLES: Role[] = Object.values(Role).filter(
  (role) => role !== Role.EDITOR_IN_CHIEF,
);

const PERMISSION_ORDER: Record<Permission, number> = {
  [Permission.NONE]: 0,
  [Permission.EDITOR]: 1,
  [Permission.EDITORSHIP]: 2,
};

export const hasPermission = (
  actual: Permission,
  required: Permission,
): boolean => PERMISSION_ORDER[actual] >= PERMISSION_ORDER[required];
