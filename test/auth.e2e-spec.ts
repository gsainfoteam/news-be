/* eslint-disable @typescript-eslint/no-unsafe-assignment -- expect.any() is typed any */
import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { createFakeIdp, fakeUser, FakeIdp } from '@infoteam/account-testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AccountModule } from '../src/auth/account';
import { AuthController } from '../src/auth/auth.controller';
import { AuthRepository } from '../src/auth/auth.repository';
import { AuthService } from '../src/auth/auth.service';
import { MemberService } from '../src/member/member.service';
import { UserRepository } from '../src/user/user.repository';
import { UserService } from '../src/user/user.service';

type User = {
  id: string;
  nickname?: string;
  termsAgreedAt: Date | null;
  privacyAgreedAt: Date | null;
};

describe('Auth API with the account SDK', () => {
  const clientId = 'news-test';
  let idp: FakeIdp;
  let app: INestApplication<App>;
  const users = new Map<string, User>();
  const refreshTokens = new Map<string, { userId: string; expiresAt: Date }>();
  const config: Record<string, string> = {
    REFRESH_TOKEN_SECRET: 'refresh-secret',
    REFRESH_TOKEN_EXPIRE: '14d',
    JWT_TEMP_SECRET: 'temp-secret',
  };

  beforeAll(async () => {
    idp = await createFakeIdp();
    jest.spyOn(globalThis, 'fetch').mockImplementation(idp.fetch);

    const module = await Test.createTestingModule({
      imports: [
        AccountModule.forRoot({
          issuer: 'https://idp.test',
          clientId,
          clientSecret: 'secret',
        }),
        JwtModule.register({
          secret: 'jwt-secret',
          signOptions: { expiresIn: 60 },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        {
          provide: AuthRepository,
          useValue: {
            upsertUser: ({ sub }: { sub: string }) => {
              const user = users.get(sub) ?? {
                id: sub,
                termsAgreedAt: null,
                privacyAgreedAt: null,
              };
              users.set(sub, user);
              return Promise.resolve(user);
            },
            deleteExpiredRefreshTokens: () => Promise.resolve(),
            createRefreshToken: (
              userId: string,
              token: string,
              expiresAt: Date,
            ) => {
              refreshTokens.set(token, { userId, expiresAt });
              return Promise.resolve();
            },
            deleteRefreshToken: (token: string) => {
              const record = refreshTokens.get(token);
              if (!record) return Promise.reject(new NotFoundException());
              refreshTokens.delete(token);
              return Promise.resolve(record);
            },
          },
        },
        {
          provide: UserRepository,
          useValue: {
            registerUser: (id: string, nickname?: string) => {
              const user = users.get(id);
              if (!user || (user.termsAgreedAt && user.privacyAgreedAt))
                return Promise.reject(new NotFoundException());
              users.set(id, {
                ...user,
                nickname,
                termsAgreedAt: new Date(),
                privacyAgreedAt: new Date(),
              });
              return Promise.resolve();
            },
          },
        },
        { provide: MemberService, useValue: {} },
        {
          provide: ConfigService,
          useValue: { getOrThrow: (key: string) => config[key] },
        },
      ],
    }).compile();
    app = module.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useLogger(false);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    jest.restoreAllMocks();
  });

  async function login(user: ReturnType<typeof fakeUser>, status: number) {
    const { body } = await idp.authorize({ clientId, user });
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...body, transport: 'cookie' })
      .expect(status);
  }

  function refreshCookie(res: request.Response) {
    const cookies = res.headers['set-cookie'] as unknown as string[];
    return cookies[0].split(';')[0];
  }

  it('rejects a new user with a ticket and signs them up with it once', async () => {
    const user = fakeUser();
    const rejected = await login(user, 403);
    expect(rejected.body).toMatchObject({
      error: 'session_rejected',
      ticket: expect.any(String),
      details: { reason: 'consent_required' },
    });
    expect(users.get(user.sub)?.termsAgreedAt).toBeNull();

    const signup = {
      ticket: (rejected.body as { ticket: string }).ticket,
      nickname: '지니어스',
    };
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(signup)
      .expect(200);
    expect(res.body).toEqual({ access_token: expect.any(String) });
    expect(res.headers['set-cookie'][0]).toMatch(
      /^refresh_token=.+; Path=\/auth; .*HttpOnly; Secure; SameSite=Strict/,
    );
    expect(users.get(user.sub)).toMatchObject({
      nickname: '지니어스',
      termsAgreedAt: expect.any(Date),
    });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(signup)
      .expect(404);
  });

  it('logs in a user who agreed, then refreshes and logs out', async () => {
    const user = fakeUser();
    users.set(user.sub, {
      id: user.sub,
      termsAgreedAt: new Date(),
      privacyAgreedAt: new Date(),
    });

    const res = await login(user, 200);
    expect(res.body).toEqual({ access_token: expect.any(String) });

    const refreshed = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshCookie(res))
      .expect(200);
    expect(refreshed.body).toEqual({ access_token: expect.any(String) });

    // the old refresh token is rotated away
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshCookie(res))
      .expect(401);

    const logout = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', refreshCookie(refreshed))
      .expect(201);
    expect(logout.headers['set-cookie'][0]).toMatch(/^refresh_token=;/);
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshCookie(refreshed))
      .expect(401);
  });

  it('rejects a malformed or forged ticket, a code the IdP did not issue, and transport body', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ ticket: null })
      .expect(400);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ ticket: 'not-a-jwt' })
      .expect(401);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ ticket: 'a.b.c' })
      .expect(401);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        code: 'forged',
        code_verifier: 'v',
        redirect_uri: 'https://news.test/auth/callback',
        nonce: 'n',
      })
      .expect(401);
    const { body } = await idp.authorize({ clientId, user: fakeUser() });
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...body, transport: 'body' })
      .expect(400);
  });
});
