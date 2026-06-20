import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsString } from 'class-validator';

export class RegisterEditorsDto {
  @ApiProperty({
    description: 'List of editor emails to register',
    example: ['editor1@example.com', 'editor2@example.com'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsEmail({}, { each: true })
  emails!: string[];
}
