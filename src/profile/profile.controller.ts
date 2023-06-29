import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Put,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  HttpException,
  UseGuards,
  HttpCode,
  Res,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { ProfileService } from './profile.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';
import {} from './dto/update.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { AccessTokenGuard } from '../common/guards';
import { GetCurrentUser, GetCurrentUserId } from '../common/decorators';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Profile } from './schemas/profile.schema';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        filename: (req, file, callback) => {
          const fileExtName = extname(file.originalname);
          callback(null, Date.now() + `${fileExtName}`);
        },
      }),
      limits: {
        fileSize: 1024 * 500,
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(
            new HttpException('File must be an image (png, jpeg, jpg)', 400),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @Post('createProfile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Profile User' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Input Profile',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        gender: {
          type: 'string',
        },
        birthDate: {
          type: 'string',
          format: 'date',
        },
        height: {
          type: 'number',
        },
        weight: {
          type: 'number',
        },
        interests: {
          type: 'array',
          items: {
            type: 'string',
          },
          example: ['Traveling', 'Music', 'Sport'],
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({ status: 200, type: Profile })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Res() response,
    @GetCurrentUser() currentUser,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    uploadFile: Express.Multer.File,
    @Body() dto: CreateProfileDto,
  ): Promise<any> {
    return this.profileService.create(response, uploadFile, dto, currentUser);
  }

  @UseGuards(AccessTokenGuard)
  @Get('getProfile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Profile User' })
  @ApiOkResponse({ status: 200, type: Profile })
  @HttpCode(HttpStatus.OK)
  async get(@Res() response, @GetCurrentUserId() currentUser): Promise<any> {
    return this.profileService.get(response, currentUser);
  }

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        filename: (req, file, callback) => {
          const fileExtName = extname(file.originalname);
          callback(null, Date.now() + `${fileExtName}`);
        },
      }),
      limits: {
        fileSize: 1024 * 500,
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(
            new HttpException('File must be an image (png, jpeg, jpg)', 400),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @Put('updateProfile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Profile User' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update Profile',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        gender: {
          type: 'string',
        },
        birthDate: {
          type: 'string',
          format: 'date',
        },
        height: {
          type: 'number',
        },
        weight: {
          type: 'number',
        },
        interests: {
          type: 'array',
          items: {
            type: 'string',
          },
          example: ['Traveling', 'Music', 'Sport'],
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ status: 200, type: Profile })
  @HttpCode(HttpStatus.OK)
  async update(
    @Res() response,
    @GetCurrentUser() currentUser,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    uploadFile: Express.Multer.File,
    @Body() dto: UpdateProfileDto,
  ): Promise<any> {
    return this.profileService.update(response, currentUser, uploadFile, dto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete('deleteProfile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Profile User' })
  @ApiOkResponse({ status: 200, type: Profile })
  @HttpCode(HttpStatus.OK)
  async delete(@Res() response, @GetCurrentUser() currentUser): Promise<any> {
    return this.profileService.delete(response, currentUser);
  }
}
