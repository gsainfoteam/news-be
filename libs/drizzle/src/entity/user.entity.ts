export class UserEntity {
  id!: string;
  email!: string;
  name!: string;
  picture!: string | null;
  nickname!: string | null;
  termsAgreedAt!: Date | null;
  privacyAgreedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
