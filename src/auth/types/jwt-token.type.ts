export type JwtTokenType = {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
};

export type IssueTokenType = {
  accessToken: string;
  refreshToken: string;
};
