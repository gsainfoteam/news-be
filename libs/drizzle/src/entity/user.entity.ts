export class UserEntity {
  id!: string;
  email!: string;
  name!: string;
  profile!: string | null;
  nickname!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
