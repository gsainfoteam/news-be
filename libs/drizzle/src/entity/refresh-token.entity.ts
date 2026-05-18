export class RefreshTokenEntity {
  id!: string;
  userId!: string;
  token!: string;
  expiresAt!: Date;
  createdAt!: Date;
}
