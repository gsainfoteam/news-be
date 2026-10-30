import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FileService } from '@lib/file';
import { Loggable } from '@lib/logger';
import { NewspaperRepository } from './newspaper.repository';
import { CreateNewspaperDto } from './dto/req/create-newspaper.dto';
import { CreateNewspaperFileUrlDto } from './dto/req/create-newspaper-file-url.dto';
import { SearchNewspapersDto } from './dto/req/search-newspapers.dto';
import { UpdateNewspaperDto } from './dto/req/update-newspaper.dto';
import { NewspaperDto } from './dto/res/newspaper.dto';
import { NewspaperListDto } from './dto/res/newspaper-list.dto';
import { NewspaperUploadUrlDto } from './dto/res/newspaper-upload-url.dto';

@Loggable()
@Injectable()
export class NewspaperService {
  private readonly logger = new Logger(NewspaperService.name);

  constructor(
    private readonly newspaperRepository: NewspaperRepository,
    private readonly fileService: FileService,
  ) {}

  async getUploadUrl({
    fileName,
    contentLength,
  }: CreateNewspaperFileUrlDto): Promise<NewspaperUploadUrlDto> {
    const key = `newspaper/${randomUUID()}/${fileName}`;
    return new NewspaperUploadUrlDto(
      await this.fileService.createPresignedUrl(
        key,
        contentLength,
        'application/pdf',
      ),
      'application/pdf',
      key,
    );
  }

  async createNewspaper(body: CreateNewspaperDto): Promise<NewspaperDto> {
    await this.fileService.verifyFileExist(body.fileKey);
    const newspaper = await this.newspaperRepository.createNewspaper(body);
    return new NewspaperDto(
      newspaper,
      this.fileService.getUrl(newspaper.fileKey),
    );
  }

  async getNewspapers(query: SearchNewspapersDto): Promise<NewspaperListDto> {
    const [newspapers, count] = await Promise.all([
      this.newspaperRepository.findNewspapers(query),
      this.newspaperRepository.countNewspapers(),
    ]);
    return new NewspaperListDto(
      newspapers.map(
        (newspaper) =>
          new NewspaperDto(
            newspaper,
            this.fileService.getUrl(newspaper.fileKey),
          ),
      ),
      count,
    );
  }

  async updateNewspaper(
    id: number,
    body: UpdateNewspaperDto,
  ): Promise<NewspaperDto> {
    const before = await this.newspaperRepository.getNewspaper(id);
    if (body.fileKey) await this.fileService.verifyFileExist(body.fileKey);

    const newspaper = await this.newspaperRepository.updateNewspaper(id, body);
    if (newspaper.fileKey !== before.fileKey)
      await this.removeFile(before.fileKey);

    return new NewspaperDto(
      newspaper,
      this.fileService.getUrl(newspaper.fileKey),
    );
  }

  async deleteNewspaper(id: number): Promise<void> {
    const { fileKey } = await this.newspaperRepository.deleteNewspaper(id);
    await this.removeFile(fileKey);
  }

  private async removeFile(key: string): Promise<void> {
    await this.fileService
      .deleteFile(key)
      .catch((error) =>
        this.logger.error(`Failed to delete newspaper file ${key}`, error),
      );
  }
}
