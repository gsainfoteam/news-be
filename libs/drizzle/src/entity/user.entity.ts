export class UserEntity {
  id!: string;
  email!: string;
  name!: string;
  profile?: string;
  nickname?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
