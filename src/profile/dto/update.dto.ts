import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
