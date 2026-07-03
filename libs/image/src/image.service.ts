import { Injectable, NotFoundException } from '@nestjs/common';
import { Loggable } from '@lib/logger';
import { ConfigService } from '@nestjs/config';
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Loggable()
@Injectable()
export class ImageService {
  private readonly s3Client: S3Client;
  private readonly s3Url: string;
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
    this.s3Url = `https://s3.${this.configService.getOrThrow<string>('AWS_S3_REGION')}.amazonaws.com/${this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME')}/`;
  }

  getUrl(key: string): string {
    return `${this.s3Url}${key}`;
  }

  async createPresignedUrl(key: string, length: number): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.configService.getOrThrow<string>('AWS_S3_BUCKET'),
      Key: key,
      ContentLength: length,
    });
    const expiresIn = 5 * 60; // 5 minutes
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async verifyFileExists(key: string): Promise<boolean> {
    const command = new HeadObjectCommand({
      Bucket: this.configService.getOrThrow<string>('AWS_S3_BUCKET'),
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
