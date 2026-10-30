import { PartialType } from '@nestjs/swagger';
import { CreateNewspaperDto } from './create-newspaper.dto';

export class UpdateNewspaperDto extends PartialType(CreateNewspaperDto) {}
