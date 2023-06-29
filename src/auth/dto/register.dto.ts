import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
  } from 'class-validator';
  
  export class RegisterDto {
    @IsString()
    @MaxLength(30)
    @MinLength(5)
    @IsNotEmpty()
    @ApiProperty()
    username: string;
  
    @IsString()
    @IsEmail()
    @MaxLength(100)
    @MinLength(10)
    @IsNotEmpty()
    @ApiProperty()
    email: string;
  
    @IsString()
    @MaxLength(30)
    @MinLength(8)
    @IsNotEmpty()
    @ApiProperty()
    password: string;
  }
  