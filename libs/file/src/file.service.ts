import { Injectable, NotFoundException } from '@nestjs/common';
import { Loggable } from '@lib/logger';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Loggable()
@Injectable()
export class FileService {
  private readonly s3Client: S3Client;
  private readonly s3Url: string;
  private readonly bucket: string;
  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
    this.bucket = configService.getOrThrow<string>('AWS_S3_BUCKET');
    this.s3Url = `https://s3.${this.configService.getOrThrow<string>('AWS_REGION')}.amazonaws.com/${this.bucket}/`;
  }

  getUrl(key: string): string {
    return `${this.s3Url}${key}`;
  }

  async createPresignedUrl(
    key: string,
    length: number,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentLength: length,
      ContentType: contentType,
    });
    const expiresIn = 5 * 60; // 5 minutes
    return await getSignedUrl(this.s3Client, command, {
      expiresIn,
      signableHeaders: new Set(['content-type']),
    });
  }

  // 공개 URL로 내보내면 안 되는 파일(제보 첨부 등)을 잠시 열람할 수 있는 URL
  async createPresignedGetUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const expiresIn = 10 * 60; // 10 minutes
    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async verifyFileExist(key: string): Promise<boolean> {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await this.s3Client
      .send(command)
      .then(() => true)
      .catch((error) => {
        if (error instanceof S3ServiceException && error.name === 'NotFound') {
          throw new NotFoundException(
            `File with key ${key} not found in S3 bucket`,
          );
        }
        throw error;
      });
  }
}
