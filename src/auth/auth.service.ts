import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { LoginDto, RegisterDto } from './dto';
import { JwtPayload } from './types';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entites/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private blacklistToken = new Set<string>();

  async register(@Res() response, dto: RegisterDto): Promise<any> {
    try{
      const hash = await argon.hash(dto.password);
      dto.password = hash;
      const existingUsername = await this.userModel.findOne({ username: dto.username }).exec();
      if (existingUsername) throw new HttpException('Username already exists', HttpStatus.BAD_REQUEST);
      const existingEmail = await this.userModel.findOne({ email: dto.email }).exec();
      if (existingEmail) throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      const user = await new this.userModel(dto).save();
      const token = await this.getToken(user._id, user.username, user.email);
      const data = { _id: user._id, username: user.username, email: user.email };
      await this.updateRtHash(user._id, token.refresh_token);
      return response.status(HttpStatus.CREATED).json({
        message: 'Register user successfully',
        data,
      });
    } catch (err) {
      return response.status(err.status).json({
        status: err.status,
        error: err.response
      });
    }
  }

  async login(@Res() response, dto: LoginDto): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email: dto.email });
      if (!user) throw new ForbiddenException('These credentials do not match our records.');
      const passwordMatches = await argon.verify(user.password, dto.password);
      if (!passwordMatches) throw new ForbiddenException('These credentials do not match our records.');
      const token = await this.getToken(user._id, user.username, user.email);
      await this.updateRtHash(user._id, token.refresh_token);
      const data = { _id: user._id, username: user.username, email: user.email, accessToken: token.access_token, refreshToken: token.refresh_token };
      return response.status(HttpStatus.OK).json({
        message: 'Login successfully',
        data
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }

  async logout(@Req() request, @Res() response, userId: number): Promise<any> {
    try {
      await this.userModel.updateMany(
        {
          _id: userId,
          refreshToken: { $ne: null },
        },
        {
          $unset: {
            refreshToken: '',
          },
        },
      );
      const token = request.headers.authorization?.split(' ')[1];
      if (token) await this.invalidateToken(token);
      return response.status(HttpStatus.OK).json({
        message: 'Logout successfully',
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }

  async refreshToken(@Res() response, userId: number, rt: string): Promise<any> {
    try {
      const user = await this.userModel.findOne({ _id: userId }).exec();
      if (!user || !user.refreshToken) throw new ForbiddenException('Access denied!');
      const rtMatches = await argon.verify(user.refreshToken, rt);
      if (!rtMatches) throw new ForbiddenException('Access denied!');
      const token = await this.getToken(user._id, user.username, user.email);
      const data = { accessToken: token.access_token, refreshToken: token.refresh_token };
      await this.updateRtHash(user._id, token.refresh_token);
      return response.status(HttpStatus.CREATED).json({
        message: 'Refresh token successfully',
        data,
      });
    } catch (err) {
      return response.status(err.status).json(err.response);
    }
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    const hash = await argon.hash(rt);
    await this.userModel.findByIdAndUpdate(
      userId,
      { refreshToken: hash },
      { new: true },
    );
  }

  async getToken(
    userId: number,
    username: string,
    email: string
  ): Promise<any> {
    const jwtPayload: JwtPayload = {
      _id: userId,
      username: username,
      email: email
    };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: this.config.get<string>('AT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: this.config.get<string>('RT_EXPIRES_IN'),
      }),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async invalidateToken(token: string) {
    this.blacklistToken.add(token);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.blacklistToken.has(token);
  }
}
