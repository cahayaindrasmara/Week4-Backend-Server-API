import supertest from "supertest";
import { faker } from '@faker-js/faker';
import { status } from "http-status";
import app from "../../src/app.js";
import { prisma } from "../../lib/prisma.js";
import auth from "../../src/middlewares/auth.js";
import config from "../../src/config/config.js";
import TokenService from "../../src/services/token.service.js";
import tokenTypes from "../../src/config/tokens.js";
import { userOne } from "../fixtures/user.fixture";
import { userOneAccessToken } from "../fixtures/token.fixture.js";
import setUpTestDB from "../setupTestDB.js";
import moment from "moment";
import { randomUUID } from 'node:crypto';
import { jest } from '@jest/globals';
import bcrypt from "bcryptjs";

setUpTestDB();

describe('Testing Auth Routes', () => {
    describe('POST /v1/auth/register', () => {
        it('should return 201 and successfully register user if request data is ok', async () => {
            const newUser = {
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: 'password1234',
            }

            const response = await supertest(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(status.CREATED);

            //cek response body
            expect(response.body.userResponse).toEqual(
                expect.objectContaining({
                    name: newUser.name,
                    email: newUser.email,
                    role: 'user',
                    isActive: true,
                })
            );

            //password jangan dikirim ke client
            expect(response.body.userResponse).not.toHaveProperty('password');

            //cek user tersimpan di database
            const dbUser = await prisma.user.findUnique({
                where: {
                    email: newUser.email,
                },
            });

            expect(dbUser).not.toBeNull();
            expect(dbUser.name).toBe(newUser.name);
            expect(dbUser.email).toBe(newUser.email);

            //password di database harus sudah di hash
            expect(dbUser.password).not.toBe(newUser.password);

            //cek token di kembalikan
            expect(response.body.tokens).toBeDefined();
            expect(response.body.tokens.access).toBeDefined();
            expect(response.body.tokens.refresh).toBeDefined();
        });

        it('should return 400 error if email is invalid', async () => {
            const newUser = {
                name: faker.person.fullName(),
                email: 'invalid-email',
                password: 'password1234'
            }

            const response = await supertest(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek error message
            expect(response.body.message).toContain('valid email');

            //cek user tidak masuk Database
            const dbUser = await prisma.user.findUnique({
                where: {
                    email: newUser.email,
                },
            });

            expect(dbUser).toBeNull();
        });

        it('should return 400 error if email is already used', async () => {
            const newUser = {
                name: userOne.name,
                email: userOne.email,
                password: userOne.password
            };

            const response = await supertest(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('Email already taken');

            //cek user tidak masuk Database
            const dbUser = await prisma.user.findUnique({
                where: {
                    email: newUser.email,
                }
            })

            expect(dbUser).not.toBeNull();
        });

        it('should return 400 error if password length is less than 8 characters', async () => {
            const newUser = {
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: 'pass123'
            }

            const response = await supertest(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
                
            //cek error message
            expect(response.body.message).toContain('password must be at least 8 characters');

            //cek user tidak masuk Database
            const dbUser = await prisma.user.findUnique({
                where: {
                    email: newUser.email,
                },
            });

            expect(dbUser).toBeNull();
        });

        it('should return 400 error if password does not contain both letters and numbers', async () => {
            const newUser = {
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: "!!!!!!!!"
            }

            const response = await supertest(app)
                .post('/v1/auth/register')
                .send(newUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);

            //cek error message
            expect(response.body.message).toContain('password must contain at least 1 letter and 1 number');

            //cek user tidak masuk Database
            const dbUser = await prisma.user.findUnique({
                where: {
                    email: newUser.email,
                },
            });

            expect(dbUser).toBeNull();
        });
    });

    describe('POST /v1/auth/login', () => {
        it('should return 200 and login user if email and password match', async () => {
            const newUser = {
                email: userOne.email,
                password: userOne.password
            }

            const response = await supertest(app)
                .post("/v1/auth/login")
                .send(newUser)
                .expect(status.OK);
            
            expect(response.body.userResponse).toEqual(
                expect.objectContaining({
                    id: userOne.id,
                    name: userOne.name,
                    email: userOne.email,
                    role: userOne.role,
                    isActive: userOne.isActive,
                })
            );

            expect(response.body.userResponse).not.toHaveProperty('password');

            //cek user tersimpan di database
            const dbUser = await prisma.user.findUnique({
                where: {
                    email: newUser.email,
                },
            });

            expect(dbUser).not.toBeNull()
            expect(dbUser.name).toBe(userOne.name);
            expect(dbUser.email).toBe(userOne.email);

            //passwor di database harus sudah ter hash
            expect(dbUser.password).not.toBe(userOne.password);

            //cek token
            expect(response.body.tokens).toBeDefined();
            expect(response.body.tokens.access).toBeDefined();
            expect(response.body.tokens.refresh).toBeDefined();
        });

        it('should return 401 error if password is wrong', async () => {
            const newUser = {
                email: userOne.email,
                password: 'password1234'
            };

            const response = await supertest(app)
                .post('/v1/auth/login')
                .send(newUser)
                .expect(status.UNAUTHORIZED);

            //cek status code
            expect(response.body.code).toBe(status.UNAUTHORIZED);

            //cek error message
            expect(response.body.message).toBe('Incorrect email or password');

            //tidak ada tokens dan response
            expect(response.body).not.toHaveProperty('tokens');
            expect(response.body).not.toHaveProperty('userResponse');

            //cek user tidak masuk Database
            const dbUser = await prisma.user.findUnique({
                where: {
                    email : newUser.email,
                }
            });

            expect(dbUser).not.toBeNull();
            expect(await bcrypt.compare(userOne.password, dbUser.password)).toBe(true);
        });
    });
});

describe('Testing Auth middleware', () => {
    it('should call next with no errors if access token is valid', async () => {
        const req = {
            headers: {
                authorization: `Bearer ${userOneAccessToken}`,
            },
        }

        const res = {};
        const next = jest.fn();

        await auth()(req, res, next);

        //user ditemukan dan req.user terisi
        expect(req.user).toBeDefined();
        expect(req.user.id).toBe(userOne.id)

        //next tanpa error (tanpa argument)
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith();
    });

    it('should call next with unauthorized error if access token is not found in header', async () => {
        const req = {
            headers: {
                authorizaion: {},
            }
        }

        const res = {};
        const next = jest.fn();

        await auth()(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: status.UNAUTHORIZED,
                message: "Please authenticate",
            })
        );
    });

    it('should call next with unauthorized error if access token is not a valid jwt token', async () => {
        const req = {
            headers: {
                authorization : 'Bearer invalid-jwt token',
            },
        }

        const res = {};
        const next = jest.fn();

        await auth()(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: status.UNAUTHORIZED,
                message: 'Please authenticate',
            })
        );
    });

    it('should call next with unauthorized error if the token is not an access token', async () => {
        const refreshToken = TokenService.generateToken(
            userOne.id,
            moment().add(config.jwt.refreshExpirationDays, 'days'),
            tokenTypes.refresh,
        );

        const req = {
            headers: {
                authorization: `Bearer ${refreshToken}`,
            },
        }

        const res = {}

        const next = jest.fn();

        await auth()(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: status.UNAUTHORIZED,
                message: 'Please authenticate',
            })
        );
    });

    it('should call next with unauthorized error if access token is generated with an invalid secret', async () =>{
        const invalidSecretToken = TokenService.generateToken(
            userOne.id,
            moment().add(1, 'minute'),
            tokenTypes.accessToken,
            'invalid-secret'
        )

        const req = {
            headers: {
                authorization: `Bearer ${invalidSecretToken}`,
            },
        };

        const res = {};
        const next = jest.fn();

        await auth()(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: status.UNAUTHORIZED,
                message: 'Please authenticate',
            })
        );
    });

    it ('should call next with unauthorized error if access token is expired', async () => {
        const expiredToken = TokenService.generateToken(
            userOne.id,
            moment().subtract(1,'minute'),
            tokenTypes.accessToken,
            'invalid-secret'
        )

        const req = {
            headers: {
                authorization: `Bearer ${expiredToken}`,
            },
        };

        const res = {};
        const next = jest.fn();

        await auth()(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: status.UNAUTHORIZED,
                message: 'Please authenticate',
            })
        );
    });

    it('should call next with unauthorized error if user is not found', async () => {
        const nonExistentUserId = randomUUID();

        const token = TokenService.generateToken(
            nonExistentUserId,
            moment().add(10, 'minutes'),
            tokenTypes.ACCESS
        );

        const req = {
            headers: {
            authorization: `Bearer ${token.accessToken}`,
            },
        };

         const res = {};
        const next = jest.fn();

        await auth()(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
            statusCode: status.UNAUTHORIZED,
            message: 'Please authenticate',
            })
        );
    });
});