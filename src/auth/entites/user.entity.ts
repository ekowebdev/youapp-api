import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty()
  _id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  profileId: string;

  profile: string;
}
