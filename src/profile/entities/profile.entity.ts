import { ApiProperty } from '@nestjs/swagger';

export class Profile {
  @ApiProperty()
  name: string;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  birthDate: Date;

  @ApiProperty()
  horoscope: string;

  @ApiProperty()
  zodiac: string;

  @ApiProperty()
  height: number;

  @ApiProperty()
  weight: number;
  
  @ApiProperty({ type: Array })
  interests: string[];

  @ApiProperty()
  image: string;
}
