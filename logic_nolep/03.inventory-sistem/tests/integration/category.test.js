import supertest from "supertest";
import app from "../../src/app.js";
import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import { userOneAccessToken } from "../fixtures/token.fixture.js";
import setUpTestDB from "../setupTestDB.js";
import { categoryForDelete, categoryOne, categoryTwo } from "../fixtures/category.fixture.js";

setUpTestDB()

describe('Testing Categories Routes', () => {
    describe('GET /v1/categories', () => {
        it('should return 200 and successfully get categories', async () => {
            const response = await supertest(app)
                .get('/v1/categories')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(status.OK);

            expect(response.body.status).toBe(200);
    
            expect(response.body.message).toBe('Get Categories Success');

            expect(response.body.data).toHaveLength(3);

            expect(response.body.data[0]).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    name: expect.any(String),
                    isActive: expect.any(Boolean),
                })
            );
        });

        it('should return 401 error when getting categories without authentication', async () => {
            const response = await supertest(app)
                .get('/v1/categories')
                .set('Authorization', ``)
                .expect(status.UNAUTHORIZED);
            
            expect(response.body.code).toBe(401);
    
            expect(response.body.message).toBe('Please authenticate');
        });

        it('should return inactive categories', async () => {
            await prisma.category.update({
                where: {
                    id: categoryOne.id,
                },
                data: {
                    isActive: false,
                    deletedAt: new Date()
                }
            });

            const response = await supertest(app)
                .get('/v1/categories')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(status.OK)
            
            expect(response.body.data.some(category => category.id === categoryOne.id)).toBe(false);
        })
    });

    describe('POST /v1/categories', () => {
        it('should return 201 and successfully create category', async () => {
            const newCategory = {
                name: 'pakaian',
            };

            const response = await supertest(app)
                .post('/v1/categories')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newCategory)
                .expect(status.CREATED);
            
            expect(response.body.status).toBe(201);

            expect(response.body.message).toBe('Create Category Success')

            //cek response body
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    name: newCategory.name,
                })
            );

            //cek category tersimpan di database
            const dbCategory = await prisma.category.findUnique({
                where: {
                    id: response.body.data.id,
                }
            });

            expect(dbCategory).not.toBeNull();
            expect(dbCategory.name).toBe(newCategory.name);
        });

        it('should return 401 error when creating category without authentication', async () => {
            const newCategory = {
                name: 'pakaian',
            };

            const response = await supertest(app)
                .post('/v1/categories')
                .set('Authorization', ``)
                .send(newCategory)
                .expect(status.UNAUTHORIZED);

            //cek status code
            expect(response.body.code).toBe(401);
            
            //cek error message
            expect(response.body.message).toBe('Please authenticate');


            //cek category tersimpan di database
            const dbCategory = await prisma.category.findFirst({
                where: {
                    name: newCategory.name,
                }
            });

            expect(dbCategory).toBeNull();
        });

        it('should return 400 error if request body is empty', async () => {

            const newCategory = {
            };

            const response = await supertest(app)
                .post('/v1/categories')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('is required');
        });

        it('should return 400 error if name is empty', async () => {
            const newCategory = {
                name: '',
            };

            const response = await supertest(app)
                .post('/v1/categories')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('is not allowed to be empty');

            //cek category tersimpan di database
            const dbCategory = await prisma.category.findFirst({
                where: {
                    name: newCategory.name,
                }
            });

            expect(dbCategory).toBeNull();
        });

        it('should return 400 error if name is already used', async () => {
            const newCategory = {
                name: categoryOne.name,
            }

            const response = await supertest(app)
                .post('/v1/categories')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newCategory)
                .expect(status.BAD_REQUEST);

                //cek status code
                expect(response.body.code).toBe(400);

                //cek error message
                expect(response.body.message).toBe('Category already taken');

                //cek category tersimpan di database
                const dbCategory = await prisma.category.findFirst({
                    where: {
                        name: newCategory.name,
                    }
                });

                expect(dbCategory).not.toBeNull();
        });
    });

    describe('GET /v1/categories/:categoryId', () => {
        it('should return 200 and successfully getting category by ID',async () => {
            const response = await supertest(app)
                .get(`/v1/categories/${categoryOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(status.OK);
            
            expect(response.body.status).toBe(200)
    
            expect(response.body.message).toBe('Get Category Success');

            expect(response.body.data).not.toBeNull();

            expect(response.body.data).toEqual(
                expect.objectContaining({
                    id: categoryOne.id,
                    name: expect.any(String),
                    isActive: expect.any(Boolean)
                })
            );
        });

        it('should return 401 error when getting category by ID without authentication',async () => {
            const response = await supertest(app)
                .get(`/v1/categories/${categoryOne.id}`)
                .set('Authorization', ``)
                .expect(status.UNAUTHORIZED);
    
            expect(response.body.code).toBe(401)

            expect(response.body.message).toBe('Please authenticate');
        });

        it('should return 404 when getting an inactive category', async () => {
            await prisma.category.update({
                where: {
                    id: categoryOne.id
                },
                data: {
                    isActive: false,
                    deletedAt: new Date()
                }
            });

            const response = await supertest(app)
                .get(`/v1/categories/${categoryOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(status.NOT_FOUND)

            expect(response.body.code).toBe(404)

            expect(response.body.message).toBe('Category not found')
        });

        it('should return 400 error if categoryId is invalid',async () => {
            const response = await supertest(app)
                .get(`/v1/categories/1234566`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(status.BAD_REQUEST);

            expect(response.body.code).toBe(400); 
            
            expect(response.body.message).toContain('must be a valid');
        });

        it('should return 404 error if categoryId is not found',async () => {
            const response = await supertest(app)
                .get(`/v1/categories/68a4002e-adf5-478b-87dc-e0f40984d261`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(status.NOT_FOUND);
            
            expect(response.body.code).toBe(404); 

            expect(response.body.message).toContain('Category not found');
        });
    });

    describe('UPDATE /v1/categories/:categoryId', () => {
        it('should return 200 and successfully updating a category if request data is ok', async () => {
            const response = await supertest(app)
                .put(`/v1/categories/${categoryOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({
                    name: 'Updated category',
                })
                .expect(status.OK);

            //cek status code
            expect(response.body.status).toBe(200)

            //cek message
            expect(response.body.message).toContain('Update Category Success')

            //cek response body
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    id: categoryOne.id,
                    name: 'Updated category',
                    isActive: expect.any(Boolean)
                })
            );

            const dbCategory = await prisma.category.findUnique({
                where: {
                    id: categoryOne.id,
                }
            });

            expect(dbCategory).not.toBeNull();
            expect(dbCategory.name).toBe('Updated category');
        });

        it('should return 401 error when updating a category without authentication',async () => {
            const response = await supertest(app)
                .put(`/v1/categories/${categoryOne.id}`)
                .set('Authorization', ``)
                .send({
                    name: 'Updated category',
                })
                .expect(status.UNAUTHORIZED);

            //cek status code
            expect(response.body.code).toBe(401)

            //cek message
            expect(response.body.message).toContain('Please authenticate');
        });

        it('should return 400 error when updating a category when request body is empty',async () => {
            const response = await supertest(app)
                .put(`/v1/categories/${categoryOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({})
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);

            //cek message
            expect(response.body.message).toContain('must have at least 1 key');
        });

        it('should return 400 error when updating a category when name is empty',async () => {
            const updatedCategory = {
                name: "",
            };

            const response = await supertest(app)
                .put(`/v1/categories/${categoryOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('is not allowed to be empty')
        });

        it('should return 400 error when updating a category when the name is already used',async () => {
            const updatedCategory = {
                name: categoryTwo.name,
            };

            const response = await supertest(app)
                .put(`/v1/categories/${categoryOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);

            //cek message
            expect(response.body.message).toBe('Category already taken')
        });

        it('should return 400 error when updating a category when userId is invalid',async () => {
            const updatedCategory = {
                name: 'pakaian',
            };

            const response = await supertest(app)
                .put(`/v1/categories/invalidId`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);

            //cek message
            expect(response.body.message).toContain('must be a valid UUID')
        });

        it('should return 404 error when updating a category when userId is not found',async () => {
            const updatedCategory = {
                name: 'pakaian',
            };

            const response = await supertest(app)
                .put(`/v1/categories/1e1bf559-2af4-441b-ae64-fe670ac4b3ce`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updatedCategory)
                .expect(status.NOT_FOUND);

            //cek status code
            expect(response.body.code).toBe(404);

            //cek message
            expect(response.body.message).toBe('Category not found');
        });
    });

    describe('DELETE /v1/categories/:categoryId', () => {
      it('should return 200 and successfully hard deleting category',async () => {
        const response = await supertest(app)
            .delete(`/v1/categories/${categoryForDelete.id}`)
            .set('Authorization', `Bearer ${userOneAccessToken}`)  

        //cek status code
        expect(response.body.status).toBe(200);

        //cek message
        expect(response.body.message).toBe('Hard Delete Category Success');

        //cek database
        const dbCategory = await prisma.category.findUnique({
            where: {
                id: categoryForDelete.id
            }
        });

        expect(dbCategory).toBeNull();
      });
      
      it('should return 401 when hard deleting a category without authentication',async () => {
        const response = await supertest(app)
            .delete(`/v1/categories/${categoryOne.id}`)
            .set('Authorization', ``)
            .expect(status.UNAUTHORIZED);

        //cek status code
        expect(response.body.code).toBe(401);

        //cek message
        expect(response.body.message).toBe('Please authenticate');
      });

      it('should return 400 when hard deleting a category when categoryId is invalid',async () => {
        const response = await supertest(app)
            .delete(`/v1/categories/${'invalidId'}`)
            .set('Authorization', `Bearer ${userOneAccessToken}`)
            .expect(status.BAD_REQUEST);

        //cek status code
        expect(response.body.code).toBe(400);

        //cek message
        expect(response.body.message).toContain('must be a valid UUID');
      });

      it('should return 404 when hard deleting a category when categoryId is not found',async () => {
        const response = await supertest(app)
            .delete(`/v1/categories/1e1bf559-2af4-441b-ae64-fe670ac4b3c1`)
            .set('Authorization', `Bearer ${userOneAccessToken}`)
            .expect(status.NOT_FOUND);

        //cek status code
        expect(response.body.code).toBe(404);

        //cek message
        expect(response.body.message).toBe('Category not found');
      });
    })

    describe('PATCH /v1/categories/:categoryId/soft-delete', () => {
      it('should return 200 and successfully soft deleting category',async () => {
        const response = await supertest(app)
            .patch(`/v1/categories/${categoryOne.id}/soft-delete`)
            .set('Authorization', `Bearer ${userOneAccessToken}`)
            .expect(status.OK)

        expect(response.body.status).toBe(200);

        expect(response.body.message).toBe('Soft Delete Category Success');

        const dbCategory = await prisma.category.findUnique({
            where: {
                id: categoryOne.id
            }
        });

        expect(dbCategory).not.toBeNull();
        expect(dbCategory.isActive).toBe(false);
        expect(dbCategory.deletedAt).not.toBeNull();
      });
      
      it('should return 401 when soft deleting a category without authentication',async () => {
        const response = await supertest(app)
            .patch(`/v1/categories/${categoryOne.id}/soft-delete`)
            .set('Authorization', ``)
            .expect(status.UNAUTHORIZED)

        expect(response.body.code).toBe(401);

        expect(response.body.message).toBe('Please authenticate')
      });

      it('should return 400 when soft deleting a category when categoryId is invalid',async () => {
        const response = await supertest(app)
            .patch(`/v1/categories/invalidId/soft-delete`)
            .set('Authorization', `Bearer ${userOneAccessToken}`)
            .expect(status.BAD_REQUEST)

        expect(response.body.code).toBe(400);

        expect(response.body.message).toContain('must be a valid UUID')
      });

      it('should return 404 when soft deleting a category when categoryId is not found',async () => {
        const response = await supertest(app)
            .patch(`/v1/categories/71c7e832-231e-402a-b273-d33ba8431f31/soft-delete`)
            .set('Authorization', `Bearer ${userOneAccessToken}`)
            .expect(status.NOT_FOUND)

        expect(response.body.code).toBe(404);

        expect(response.body.message).toBe('Category not found')
      });
    });
});