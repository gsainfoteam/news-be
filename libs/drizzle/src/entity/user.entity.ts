export class UserEntity {
  id!: string;
  email!: string;
  name!: string;
  picture!: string | null;
  nickname!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
