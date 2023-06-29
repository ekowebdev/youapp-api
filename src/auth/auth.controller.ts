import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import {
  Public,
  GetCurrentUserId,
  GetCurrentUser,
} from '../common/decorators';
import { AtGuard, RtGuard } from '../common/guards';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '../auth/dto';
import { Token } from '../auth/types';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { User } from './entites/user.entity';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register User' })
  @ApiCreatedResponse({ status: 201, type: User })
  @HttpCode(HttpStatus.CREATED)
  register(@Res() response, @Body() dto: RegisterDto): Promise<Token> {
    return this.authService.register(response, dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({ status: 200 })
  @HttpCode(HttpStatus.OK)
  login(@Res() response, @Body() dto: LoginDto): Promise<Token> {
    return this.authService.login(response, dto);
  }

  @UseGuards(AtGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  @ApiOkResponse({ status: 200 })
  @HttpCode(HttpStatus.OK)
  logout(@Res() response, @GetCurrentUserId() userId): Promise<boolean> {
    return this.authService.logout(response, userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refreshToken')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh Token' })
  @ApiOkResponse({ status: 200 })
  @HttpCode(HttpStatus.OK)
  refreshToken(
    @Res() response, 
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Token> {
    return this.authService.refreshToken(response, userId, refreshToken);
  }
}
