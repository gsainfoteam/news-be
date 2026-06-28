export type JwtTokenType = {
  accessToken?: string;
  refreshToken?: string;
  tempToken?: string;
  expiresAt?: Date;
};

export type IssueTokenType = {
  accessToken: string;
  refreshToken: string;
};
