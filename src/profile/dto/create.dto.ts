import {
  IsArray,
  IsDate,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  @IsOptional()
  @ApiProperty()
  name?: string;

  @IsEnum(['men', 'women'], {
    message: 'gender must be one of the following values: men/women',
  })
  @IsOptional()
  @ApiProperty()
  gender?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty()
  birthDate?: Date;

  @IsString()
  @MaxLength(30)
  @IsOptional()
  horoscope?: string;

  @IsString()
  @MaxLength(30)
  @IsOptional()
  zodiac?: string;

  @IsNumberString()
  @IsOptional()
  @ApiProperty()
  height?: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty()
  weight?: number;

  @ApiProperty()
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @Type(() => Array)
  @IsArray()
  @IsOptional()
  interests?: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  image?: string;
}
