import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Res,
  UploadedFile,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProfileDto, UpdateProfileDto } from './dto';
import { GetCurrentUser, GetCurrentUserId } from '../common/decorators';
import sharp = require('sharp');
import { Profile } from './entities/profile.entity';
import { User } from '../auth/entites/user.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Profile') private profileModel: Model<Profile>,
  ) {}

  private zodiacSigns: string[] = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];

  async create(
    @Res() response,
    uploadFile: any,
    dto: CreateProfileDto,
    @GetCurrentUser() currentUser,
  ): Promise<any> {
    try{
      const userId = currentUser._id;
      const user = await this.userModel.findOne({ _id: currentUser._id, profileId: { $ne: null } }).exec();
      if (user) throw new ForbiddenException(`Profile User ID #${userId} has been created`);
      if (dto.birthDate) {
        dto.zodiac = this.getZodiac(dto);
        dto.horoscope = this.getHoroscope(dto);
      }
      if (uploadFile) {
        const base64Image = await this.convertImageToBase64(uploadFile);
        dto.image = base64Image;
      }
      const profile = new this.profileModel(dto);
      profile.save();
      await this.userModel.findByIdAndUpdate(
        currentUser._id,
        { profileId: profile._id },
        { new: true },
      );
      const data = await this.getProfileUser(currentUser._id);
      return response.status(HttpStatus.CREATED).json({
        message: 'Profile created successfully',
        data,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }

  async get(@Res() response, @GetCurrentUserId() currentUser): Promise<any> {
    try {
      const data = await this.getProfileUser(currentUser);
      if (!data) throw new NotFoundException(`Profile User ID #${currentUser} not found`);
      return response.status(HttpStatus.OK).json({
        message: 'Profile found successfully',
        data,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }

  async update(
    @Res() response,
    @GetCurrentUser() currentUser,
    @UploadedFile() uploadFile,
    dto: UpdateProfileDto,
  ): Promise<any> {
    try {
      const user = await this.userModel.findById(currentUser._id).exec();
      const profile = await this.profileModel.findOne({ _id: user.profileId }).exec();
      if (!profile) throw new NotFoundException(`Profile User ID #${currentUser._id} not found`);
      if (uploadFile) {
        const base64Image = await this.convertImageToBase64(uploadFile);
        dto.image = base64Image;
      }
      if (dto.birthDate) {
        dto.zodiac = this.getZodiac(dto);
        dto.horoscope = this.getHoroscope(dto);
      }
      await this.profileModel.findByIdAndUpdate(
        profile._id,
        dto,
        { new: true },
      );
      const data = await this.getProfileUser(currentUser._id);
      return response.status(HttpStatus.OK).json({
        message: 'Profile updated successfully',
        data,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }

  }

  async delete(@Res() response, @GetCurrentUser() currentUser): Promise<any> {
    try {
      const user = await this.userModel.findById(currentUser._id).exec();
      const profile = await this.profileModel.findOne({ _id: user.profileId }).exec();
      if (!profile) throw new NotFoundException(`Profile User ID #${currentUser._id} not found`);
      const data = await this.profileModel.findByIdAndDelete(profile._id);
      await this.userModel.updateMany({
        _id: currentUser._id,
        profileId: { $ne: null },
      }, {
        $unset:{
          profileId: ''
        }
      });
      return response.status(HttpStatus.OK).json({
        message: 'Profile deleted successfully',
        data,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }

  async getProfileUser(@GetCurrentUserId() currentUser): Promise<User> {
    const data = await this.userModel.findOne({ _id: currentUser })
                    .populate({
                      path: 'profileId',
                      select: ('name gender birthDate horoscope zodiac height weight interests image')
                    }).select('username email').lean().exec();
    if (data && data.profileId) {
      data.profile = data.profileId;
      delete data.profileId;
    }
    return data;
  }

  async convertImageToBase64(@UploadedFile() file: Express.Multer.File): Promise<string> {
    const buffer = await sharp(file.path).toBuffer();
    return buffer.toString('base64');
  }

  getZodiac(dto: any): string {
    const month = dto.birthDate.getMonth() + 1;
    const day = dto.birthDate.getDate();
    let zodiac = '';
    switch (month) {
      case 1:
        zodiac = day <= 19 ? this.zodiacSigns[9] : this.zodiacSigns[10];
        break;
      case 2:
        zodiac = day <= 18 ? this.zodiacSigns[10] : this.zodiacSigns[11];
        break;
      case 3:
        zodiac = day <= 20 ? this.zodiacSigns[11] : this.zodiacSigns[0];
        break;
      case 4:
        zodiac = day <= 19 ? this.zodiacSigns[0] : this.zodiacSigns[1];
        break;
      case 5:
        zodiac = day <= 20 ? this.zodiacSigns[1] : this.zodiacSigns[2];
        break;
      case 6:
        zodiac = day <= 21 ? this.zodiacSigns[2] : this.zodiacSigns[3];
        break;
      case 7:
        zodiac = day <= 22 ? this.zodiacSigns[3] : this.zodiacSigns[4];
        break;
      case 8:
        zodiac = day <= 22 ? this.zodiacSigns[4] : this.zodiacSigns[5];
        break;
      case 9:
        zodiac = day <= 22 ? this.zodiacSigns[5] : this.zodiacSigns[6];
        break;
      case 10:
        zodiac = day <= 23 ? this.zodiacSigns[6] : this.zodiacSigns[7];
        break;
      case 11:
        zodiac = day <= 21 ? this.zodiacSigns[7] : this.zodiacSigns[8];
        break;
      case 12:
        zodiac = day <= 21 ? this.zodiacSigns[8] : this.zodiacSigns[9];
        break;
      default:
        break;
    }
    return zodiac;
  }

  getHoroscope(dto: any): string {
    const date = dto.birthDate;
    const year = date.getFullYear();
    let horoscope = '';
    switch (year % 12) {
      case 0:
        horoscope = 'Monkey';
        break;
      case 1:
        horoscope = 'Rooster';
        break;
      case 2:
        horoscope = 'Dog';
        break;
      case 3:
        horoscope = 'Pig';
        break;
      case 4:
        horoscope = 'Rat';
        break;
      case 5:
        horoscope = 'Ox';
        break;
      case 6:
        horoscope = 'Tiger';
        break;
      case 7:
        horoscope = 'Rabbit';
        break;
      case 8:
        horoscope = 'Dragon';
        break;
      case 9:
        horoscope = 'Snake';
        break;
      case 10:
        horoscope = 'Horse';
        break;
      case 11:
        horoscope = 'Goat';
        break;
      default:
        break;
    }
    return horoscope;
  }

}
