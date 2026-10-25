import { Permission, Role } from '../enum';

export class MemberEntity {
  id!: string;
  email!: string;
  name!: string;
  role!: Role;
  permission!: Permission;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
