export type JwtTokenType = {
  access_token: string;
  refresh_token: string;
  expiresAt: Date;
};

export type IssueTokenType = {
  access_token: string;
  refresh_token: string;
};
