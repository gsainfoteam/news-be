import { GithubService } from '@lib/github';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { generateKeyPairSync } from 'crypto';
import { of, throwError } from 'rxjs';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe('GithubService', () => {
  const jwtService = new JwtService();
  let post: jest.Mock<unknown>;

  const createService = (env: Record<string, string>) =>
    new GithubService(
      new ConfigService(env),
      { post } as unknown as HttpService,
      jwtService,
    );

  beforeEach(() => {
    post = jest
      .fn()
      .mockReturnValueOnce(of({ data: { token: 'installation-token' } }))
      .mockReturnValueOnce(of({ data: undefined }));
  });

  it('does nothing without app credentials', async () => {
    createService({}).triggerFrontendDeploy();
    await flush();
    expect(post).not.toHaveBeenCalled();
  });

  it('dispatches the news-fe deploy workflow with an installation token', async () => {
    createService({
      GITHUB_APP_ID: '123',
      GITHUB_APP_INSTALLATION_ID: '456',
      GITHUB_APP_PRIVATE_KEY: privateKey.replaceAll('\n', '\\n'),
    }).triggerFrontendDeploy();
    await flush();

    const [tokenUrl, , { headers: tokenHeaders }] = post.mock.calls[0] as [
      string,
      unknown,
      { headers: { Authorization: string } },
    ];
    expect(tokenUrl).toBe(
      'https://api.github.com/app/installations/456/access_tokens',
    );
    const appToken = tokenHeaders.Authorization.replace('Bearer ', '');
    expect(
      jwtService.verify(appToken, { algorithms: ['RS256'], publicKey }),
    ).toMatchObject({ iss: '123' });

    expect(post).toHaveBeenNthCalledWith(
      2,
      'https://api.github.com/repos/gsainfoteam/news-fe/actions/workflows/production.yml/dispatches',
      { ref: 'main' },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer installation-token',
        }) as unknown,
      }),
    );
  });

  it('logs instead of throwing when GitHub fails', async () => {
    post = jest.fn().mockReturnValue(throwError(() => new Error('boom')));
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    createService({
      GITHUB_APP_ID: '123',
      GITHUB_APP_INSTALLATION_ID: '456',
      GITHUB_APP_PRIVATE_KEY: privateKey,
    }).triggerFrontendDeploy();
    await flush();

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('failed to trigger frontend deploy'),
    );
  });
});
