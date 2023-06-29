import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import * as fs from 'fs';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let email: string;
  let username: string;
  let jwtToken: string;
  let mongoConnection: Connection;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const connectionUri = mongoServer.getUri();
    mongoConnection = (await connect(connectionUri)).connection;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('MONGODB_CONNECTION')
      .useValue(connectionUri)
      .compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongoServer.stop();
    await app.close();
  });

  describe('User Registration', () => {
    it('should register a user', async () => {
      username = generateRandomUsername();
      email = generateRandomEmail();
      const password = 'password';
      const response = await request(app.getHttpServer())
        .post('/register')
        .send({ username, email, password })
        .expect(HttpStatus.CREATED);
    });
  });

  describe('User Login', () => {
    it('should return an access token when logged in', async () => {
      const password = 'password';
      const response = await request(app.getHttpServer())
        .post('/login')
        .send({ email, password })
        .expect(HttpStatus.OK);
      jwtToken = response.body.data.accessToken;
      expect(jwtToken).toBeDefined();
    });
  });

  describe('CRUD Operation', () => {
    const filePath = join('./uploads', 'test-file.png');
    const fileData = fs.readFileSync(filePath);
    let name: string = 'Testing';
    let gender: string = 'men';
    let birthDate: Date = new Date('1990-12-14');
    let height: number = 170;
    let weight: number = 62;
    let interests: string[] = ['Music', 'Sport'];
    it('should get profile', async () => {
      await request(app.getHttpServer())
        .get('/getProfile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);
    });
    it('should create an profile', async () => {
      await request(app.getHttpServer())
        .post('/createProfile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .set('Content-Type', 'multipart/form-data')
        .field('name', name)
        .field('gender', gender)
        .field('height', height)
        .field('weight', weight)
        .field('interests', interests)
        .attach('image', fileData, 'test-file.png')
        .expect(HttpStatus.CREATED);
    });
    it('should update profile', async () => {
      await request(app.getHttpServer())
        .put('/updateProfile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .field('name', name)
        .field('gender', gender)
        .field('height', height)
        .field('weight', weight)
        .field('interests', interests)
        .attach('image', fileData, 'test-file.png')
        .expect(HttpStatus.OK);
    });
    it('should delete profile', async () => {
      await request(app.getHttpServer())
        .delete('/deleteProfile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);
    });
  });
});

function generateRandomUsername(): string {
  const prefix = 'user_';
  const uniqueId = uuidv4().replace(/-/g, '');
  return prefix + uniqueId;
}

function generateRandomEmail(): string {
  const prefix = 'user_';
  const uniqueId = uuidv4().replace(/-/g, '');
  const domain = 'example.com';
  return `${prefix}${uniqueId}@${domain}`;
}
