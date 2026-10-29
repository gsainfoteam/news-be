import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ImageService } from '@lib/image';
import { Loggable } from '@lib/logger';
import { NewspaperRepository } from './newspaper.repository';
import { CreateNewspaperDto } from './dto/req/create-newspaper.dto';
import { CreateNewspaperFileUrlDto } from './dto/req/create-newspaper-file-url.dto';
import { SearchNewspapersDto } from './dto/req/search-newspapers.dto';
import { NewspaperDto } from './dto/res/newspaper.dto';
import { NewspaperListDto } from './dto/res/newspaper-list.dto';
import { NewspaperUploadUrlDto } from './dto/res/newspaper-upload-url.dto';

@Loggable()
@Injectable()
export class NewspaperService {
  constructor(
    private readonly newspaperRepository: NewspaperRepository,
    private readonly imageService: ImageService,
  ) {}

  async getUploadUrl({
    fileName,
    contentLength,
  }: CreateNewspaperFileUrlDto): Promise<NewspaperUploadUrlDto> {
    const key = `newspaper/${randomUUID()}/${fileName}`;
    return new NewspaperUploadUrlDto(
      await this.imageService.createPresignedUrl(
        key,
        contentLength,
        'application/pdf',
      ),
      key,
    );
  }

  async createNewspaper(body: CreateNewspaperDto): Promise<NewspaperDto> {
    await this.imageService.verifyFileExist(body.fileKey);
    const newspaper = await this.newspaperRepository.createNewspaper(body);
    return new NewspaperDto(
      newspaper,
      this.imageService.getUrl(newspaper.fileKey),
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
            this.imageService.getUrl(newspaper.fileKey),
          ),
      ),
      count,
    );
  }

  async deleteNewspaper(id: number): Promise<void> {
    await this.newspaperRepository.deleteNewspaper(id);
  }
}
