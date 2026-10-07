import supertest from "supertest";
import app from "../../src/app.js";
import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import { adminAccessToken, userOneAccessToken } from "../fixtures/token.fixture.js";
import setUpTestDB from "../setupTestDB.js";
import { userForDelete, userOne, userTwo } from "../fixtures/user.fixture.js";
import { faker } from "@faker-js/faker";

setUpTestDB()

describe('Testing User Routes', () => {
    describe('GET /v1/users', () => {
        it('should return 200 and successfully get user', async () => {
            const response = await supertest(app)
                .get('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(status.OK);

            expect(response.body.status).toBe(200)
    
            expect(response.body.message).toBe('Get Users Success');

            expect(response.body.data).toHaveLength(4);

            expect(response.body.data[0]).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    name: expect.any(String),
                    email: expect.any(String),
                    role: expect.any(String),
                    isEmailVerified: expect.any(Boolean),
                    isActive: expect.any(Boolean)
                })
            );
        });

        it('should return 401 error when getting users without authentication', async () => {
            const response = await supertest(app)
                .get('/v1/users')
                .set('Authorization', ``)
                .expect(status.UNAUTHORIZED);
            
            expect(response.body.code).toBe(401);
    
            expect(response.body.message).toBe('Please authenticate');
        });

        it('should return 403 error when getting users without authorization', async () => {
            const response = await supertest(app)
                .get('/v1/users')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(status.FORBIDDEN);
    
            expect(response.body.code).toBe(403);

            expect(response.body.message).toContain('not authorized');
        });
    });

    describe('POST /v1/users', () => {
        it('should return 201 and successfully create user', async () => {

            const newUser = {
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: 'password1234',
                role: 'user'
            };

            const response = await supertest(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(status.CREATED);
            
            expect(response.body.status).toBe(201);

            expect(response.body.message).toBe('Create User Success')

            //cek response body
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    isActive: true,
                    isEmailVerified: false
                })
            );

            //password jangan dikirim ke client
            expect(response.body.data).not.toHaveProperty('password');

            //cek user tersimpan di database
            const dbUser = await prisma.user.findUnique({
                where: {
                    email: newUser.email,
                }
            });

            expect(dbUser).not.toBeNull();
            expect(dbUser.name).toBe(newUser.name);
            expect(dbUser.email).toBe(newUser.email);

            //password di database harus sudah di hash
            expect(dbUser.password).not.toBe(newUser.password);
        });

        it('should return 401 error when creating users without authentication', async () => {

            const newUser = {
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: 'password1234',
                role: 'user'
            };

            const response = await supertest(app)
                .post('/v1/users')
                .set('Authorization', ``)
                .send(newUser)
                .expect(status.UNAUTHORIZED);

            //cek status code
            expect(response.body.code).toBe(401);
            
            //cek error message
            expect(response.body.message).toBe('Please authenticate');


            //cek user tersimpan di database
            const dbUser = await prisma.user.findUnique({
                where: {
                    email: newUser.email,
                }
            });

            expect(dbUser).toBeNull();
        });

        it('should return 403 error when creating users without authorization', async () => {
            const newUser = {
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: 'password1234',
                role: 'user'
            };

            const response = await supertest(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newUser)
                .expect(status.FORBIDDEN);

            //cek status code
            expect(response.body.code).toBe(403);
            
            //cek error message
            expect(response.body.message).toContain('not authorized');

            //cek user tersimpan di database
            const dbUser = await prisma.user.findUnique({
                where: {
                    email: newUser.email,
                }
            });

            expect(dbUser).toBeNull();
        });

        it('should return 400 error if request body is empty', async () => {

            const newUser = {
            };

            const response = await supertest(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('is required');
        });

        it('should return 400 error if name is empty', async () => {
            const newUser = {
                name: '',
                email: faker.internet.email().toLowerCase(),
                password: 'password1234',
                role: 'user'
            };

            const response = await supertest(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('is not allowed to be empty');

            //cek user tersimpan di database
            const dbUser = await prisma.user.findUnique({
                where: {
                    email: newUser.email,
                }
            });

            expect(dbUser).toBeNull();
        });

        it('should return 400 error if email is empty', async () => {
            const newUser = {
                name: faker.person.fullName(),
                email: '',
                password: 'password1234',
                role: 'user'
            };

            const response = await supertest(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('is not allowed to be empty');

            //cek user tersimpan di database
            const dbUser = await prisma.user.findUnique({
                where: {
                    email: newUser.email,
                }
            });

            expect(dbUser).toBeNull();
        });

        it('should return 400 error if password is empty', async () => {
            const newUser = {
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: '',
                role: 'user'
            };

            const response = await supertest(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('is not allowed to be empty');

            //cek user tersimpan di database
            const dbUser = await prisma.user.findUnique({
                where: {
                    email: newUser.email,
                }
            });

            expect(dbUser).toBeNull();
        });

        it('should return 400 error if email is invalid', async () => {
            const newUser = {
                name: faker.person.fullName(),
                email: 'test',
                password: 'password1234',
                role: 'user'
            };

            const response = await supertest(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('must be a valid email');

            //cek user tersimpan di database
            const dbUser = await prisma.user.findUnique({
                where: {
                    email: newUser.email,
                }
            });

            expect(dbUser).toBeNull();
        });

        it('should return 400 error if email is already used', async () => {
            const newUser = {
                name: userOne.name,
                email: userOne.email,
                password: userOne.password,
                role: userOne.role
            }

            const response = await supertest(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(status.BAD_REQUEST);

                //cek status code
                expect(response.body.code).toBe(400);

                //cek error message
                expect(response.body.message).toBe('Email already taken');

                //cek user tersimpan di database
                const dbUser = await prisma.user.findUnique({
                    where: {
                        email: newUser.email,
                    }
                });

                expect(dbUser).not.toBeNull();
        });

        it('should return 400 error if password length is less than 8 characters',async () => {
            const newUser = {
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: 'pass12',
                role: 'user'
            }

            const response = await supertest(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(status.BAD_REQUEST);

                //cek status code
                expect(response.body.code).toBe(400);

                //cek error message
                expect(response.body.message).toBe('password must be at least 8 characters');

                //cek user tersimpan di database
                const dbUser = await prisma.user.findUnique({
                    where: {
                        email: newUser.email,
                    }
                });

                expect(dbUser).toBeNull();
        });

        it('should return 400 error if password does not contain both letters and numbers',async () => {
            const newUser = {
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: '!!!!!!!!',
                role: 'user'
            }

            const response = await supertest(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newUser)
                .expect(status.BAD_REQUEST);

                //cek status code
                expect(response.body.code).toBe(400);

                //cek error message
                expect(response.body.message).toBe('password must contain at least 1 letter and 1 number');

                //cek user tersimpan di database
                const dbUser = await prisma.user.findUnique({
                    where: {
                        email: newUser.email,
                    }
                });

                expect(dbUser).toBeNull();
        });
    });

    describe('GET /v1/users/:userId', () => {
        it('should return 200 and successfully getting user by ID',async () => {

            const response = await supertest(app)
                .get(`/v1/users/${userOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(status.OK);
            
            expect(response.body.status).toBe(200)
    
            expect(response.body.message).toBe('Get User by ID Success');

            expect(response.body.data).not.toBeNull();

            expect(response.body.data).toEqual(
                expect.objectContaining({
                    id: userOne.id,
                    name: expect.any(String),
                    email: expect.any(String),
                    role: expect.any(String),
                    isEmailVerified: expect.any(Boolean),
                    isActive: expect.any(Boolean)
                })
            );
        });

        it('should return 401 error when getting user by ID without authentication',async () => {
            const response = await supertest(app)
                .get(`/v1/users/${userOne.id}`)
                .set('Authorization', ``)
                .expect(status.UNAUTHORIZED);
    
            expect(response.body.code).toBe(401)

            expect(response.body.message).toBe('Please authenticate');
        });

        it('should return 403 error when getting user by ID without authorization',async () => {
            const response = await supertest(app)
                .get(`/v1/users/${userOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(status.FORBIDDEN);
            
            expect(response.body.code).toBe(403); 
            
            expect(response.body.message).toContain('not authorized');
        });

        it('should return 400 error if userId is invalid',async () => {
            const response = await supertest(app)
                .get(`/v1/users/1234566`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(status.BAD_REQUEST);

            expect(response.body.code).toBe(400); 
            
            expect(response.body.message).toContain('must be a valid');
        });

        it('should return 404 error if userId is not found',async () => {
            const response = await supertest(app)
                .get(`/v1/users/68a4002e-adf5-478b-87dc-e0f40984d261`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(status.NOT_FOUND);
            
            expect(response.body.code).toBe(404); 

            expect(response.body.message).toContain('User not found');
        });
    });

    describe('UPDATE /v1/users/:userId', () => {
        it('should return 200 and successfully updating a user if request data is ok', async () => {
            const response = await supertest(app)
                .put(`/v1/users/${userOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    name: 'Updated user',
                    email: 'updated@gmail.com',
                    password: 'updated12345'
                })
                .expect(status.OK);

            //cek status code
            expect(response.body.status).toBe(200)

            //cek message
            expect(response.body.message).toContain('Update User Success')

            //cek response body
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    id: userOne.id,
                    name: 'Updated user',
                    email: 'updated@gmail.com',
                    role: expect.any(String),
                    isEmailVerified: expect.any(Boolean),
                    isActive: expect.any(Boolean)
                })
            )

            //password jangan dikirim ke client
            expect(response.body.data).not.toHaveProperty('password');
        });

        it('should return 401 error when updating a user without authentication',async () => {
            const response = await supertest(app)
                .put(`/v1/users/${userOne.id}`)
                .set('Authorization', ``)
                .send({
                    name: 'Updated user',
                    email: 'updated@gmail.com'
                })
                .expect(status.UNAUTHORIZED);

            //cek status code
            expect(response.body.code).toBe(401)

            //cek message
            expect(response.body.message).toContain('Please authenticate');
        });

        it('should return 403 error when updating a user without authorization',async () => {
            const response = await supertest(app)
                .put(`/v1/users/${userOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({
                    name: 'Updated user',
                    email: 'updated@gmail.com'
                })
                .expect(status.FORBIDDEN);

            //cek status code
            expect(response.body.code).toBe(403)

            //cek message
            expect(response.body.message).toContain('not authorized');
        });

        it('should return 400 error when updating a user when request body is empty',async () => {
            const response = await supertest(app)
                .put(`/v1/users/${userOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({})
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);

            //cek message
            expect(response.body.message).toContain('must have at least 1 key');
        });

        it('should return 400 error when updating a user when name is empty',async () => {
            const updatedUser = {
                name: "",
                email: faker.internet.email().toLowerCase(),
                password: "updated1234",
                role: "admin"
            };

            const response = await supertest(app)
                .put(`/v1/users/${userOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('is not allowed to be empty')
        });

        it('should return 400 error when updating a user when email is empty',async () => {
            const updatedUser = {
                name: faker.person.fullName(),
                email: '',
                password: "updated1234",
                role: "admin"
            };

            const response = await supertest(app)
                .put(`/v1/users/${userOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('is not allowed to be empty');
        });

        it('should return 400 error when updating a user when password is empty',async () => {
            const updatedUser = {
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: "",
                role: "admin"
            };

            const response = await supertest(app)
                .put(`/v1/users/${userOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('is not allowed to be empty');
        });

        it('should return 400 error when updating a user when role is empty',async () => {
            const updatedUser = {
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: 'updated1234',
                role: ''
            };

            const response = await supertest(app)
                .put(`/v1/users/${userOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);

            //cek message
            expect(response.body.message).toContain('is not allowed to be empty')
        });

        it('should return 400 error when updating a user when the email is invalid',async () => {
            const updatedUser = {
                name: faker.person.fullName(),
                email: 'updatedemail.com',
                password: "updated1234",
                role: 'admin'
            };

            const response = await supertest(app)
                .put(`/v1/users/${userOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('must be a valid email')
        });

        it('should return 400 error when updating a user when the email is already used',async () => {
            const updatedUser = {
                name: faker.person.fullName(),
                email: userTwo.email,
                password: "updated1234",
                role: 'admin'
            };

            const response = await supertest(app)
                .put(`/v1/users/${userOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);

            //cek message
            expect(response.body.message).toBe('Email already taken')
        });

        it('should return 400 error when updating a user when password length is less than 8 characters',async () => {
            const updatedUser = {
                name: faker.person.fullName(),
                email: userOne.email,
                password: "upda12",
                role: 'admin'
            };

            const response = await supertest(app)
                .put(`/v1/users/${userOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);

            //cek message
            expect(response.body.message).toBe('password must be at least 8 characters')
        });

        it('should return 400 error when updating a user when password does not contain both letters and numbers',async () => {
            const updatedUser = {
                name: faker.person.fullName(),
                email: userOne.email,
                password: "!!!!!!!!",
                role: 'admin'
            };

            const response = await supertest(app)
                .put(`/v1/users/${userOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);

            //cek message
            expect(response.body.message).toBe('password must contain at least 1 letter and 1 number')
        });

        it('should return 400 error when updating a user when userId is invalid',async () => {
            const updatedUser = {
                name: faker.person.fullName(),
                email: userOne.email,
                password: 'updated1234',
                role: 'admin'
            };

            const response = await supertest(app)
                .put(`/v1/users/invalidId`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedUser)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);

            //cek message
            expect(response.body.message).toContain('must be a valid UUID')
        });

        it('should return 404 error when updating a user when userId is not found',async () => {
            const updatedUser = {
                name: faker.person.fullName(),
                email: faker.internet.email().toLocaleLowerCase(),
                password: 'updated1234',
                role: 'admin'
            };

            const response = await supertest(app)
                .put(`/v1/users/1e1bf559-2af4-441b-ae64-fe670ac4b3ce`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedUser)
                .expect(status.NOT_FOUND);

            //cek status code
            expect(response.body.code).toBe(404);

            //cek message
            expect(response.body.message).toBe('User not found');
        });
    });

    describe('DELETE /v1/users/:userId', () => {
      it('should return 200 and successfully hard deleting user',async () => {
        const response = await supertest(app)
            .delete(`/v1/users/${userForDelete.id}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)  

        //cek status code
        expect(response.body.status).toBe(200);

        //cek message
        expect(response.body.message).toBe('Hard Delete User Success');

        //cek database
        const dbUser = await prisma.user.findUnique({
            where: {
                id: userForDelete.id
            }
        });

        expect(dbUser).toBeNull()
      });
      
      it('should return 401 when hard deleting a user without authentication',async () => {
        const response = await supertest(app)
            .delete(`/v1/users/${userTwo.id}`)
            .set('Authorization', ``)
            .expect(status.UNAUTHORIZED);

        //cek status code
        expect(response.body.code).toBe(401);

        //cek message
        expect(response.body.message).toBe('Please authenticate');
      });

      it('should return 403 when hard deleting a user without authorization',async () => {
        const response = await supertest(app)
            .delete(`/v1/users/${userTwo.id}`)
            .set('Authorization', `Bearer ${userOneAccessToken}`)
            .expect(status.FORBIDDEN);

        //cek status code
        expect(response.body.code).toBe(403);

        //cek message
        expect(response.body.message).toContain('not authorized');
      });

      it('should return 400 when hard deleting a user when userId is invalid',async () => {
        const response = await supertest(app)
            .delete(`/v1/users/${'invalidId'}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(status.BAD_REQUEST);

        //cek status code
        expect(response.body.code).toBe(400);

        //cek message
        expect(response.body.message).toContain('must be a valid UUID');
      });

      it('should return 404 when hard deleting a user when userId is not found',async () => {
        const response = await supertest(app)
            .delete(`/v1/users/1e1bf559-2af4-441b-ae64-fe670ac4b3c1`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(status.NOT_FOUND);

        //cek status code
        expect(response.body.code).toBe(404);

        //cek message
        expect(response.body.message).toBe('User not found');
      });
    })

    describe('PATCH /v1/users/:userId/soft-delete', () => {
      it('should return 200 and successfully soft deleting user',async () => {
        const response = await supertest(app)
            .patch(`/v1/users/${userTwo.id}/soft-delete`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(status.OK)

        expect(response.body.status).toBe(200);

        expect(response.body.message).toBe('Soft Delete User Success');

        const dbUser = await prisma.user.findUnique({
            where: {
                id: userTwo.id
            }
        });

        expect(dbUser).not.toBeNull();
        expect(dbUser.isActive).toBe(false);
        expect(dbUser.deletedAt).not.toBeNull();
      });
      
      it('should return 401 when soft deleting a user without authentication',async () => {
        const response = await supertest(app)
            .patch(`/v1/users/${userTwo.id}/soft-delete`)
            .set('Authorization', ``)
            .expect(status.UNAUTHORIZED)

        expect(response.body.code).toBe(401);

        expect(response.body.message).toBe('Please authenticate')
      });

      it('should return 403 when soft deleting a user without authorization',async () => {
        const response = await supertest(app)
            .patch(`/v1/users/${userTwo.id}/soft-delete`)
            .set('Authorization', `Bearer ${userOneAccessToken}`)
            .expect(status.FORBIDDEN)

        expect(response.body.code).toBe(403);

        expect(response.body.message).toContain('not authorized')
      });

      it('should return 400 when soft deleting a user when userId is invalid',async () => {
        const response = await supertest(app)
            .patch(`/v1/users/invalidId/soft-delete`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(status.BAD_REQUEST)

        expect(response.body.code).toBe(400);

        expect(response.body.message).toContain('must be a valid UUID')
      });

      it('should return 404 when soft deleting a user when userId is not found',async () => {
        const response = await supertest(app)
            .patch(`/v1/users/71c7e832-231e-402a-b273-d33ba8431f31/soft-delete`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(status.NOT_FOUND)

        expect(response.body.code).toBe(404);

        expect(response.body.message).toBe('User not found')
      });
    });
});