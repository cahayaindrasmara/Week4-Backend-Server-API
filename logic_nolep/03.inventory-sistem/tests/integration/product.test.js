import supertest from "supertest";
import app from "../../src/app.js";
import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import { userOneAccessToken} from "../fixtures/token.fixture.js";
import setUpTestDB from "../setupTestDB.js";
import { productOne, productTwo, productForDelete } from "../fixtures/product.fixture.js";
import { categoryTwo } from "../fixtures/category.fixture.js";
import { userTwo } from "../fixtures/user.fixture.js";

setUpTestDB()

describe('Testing Product Routes', () => {
    describe('GET /v1/products', () => {
        it('should return 200 and successfully get products', async () => {
            const response = await supertest(app)
                .get('/v1/products')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(status.OK);

            expect(response.body.status).toBe(200);
    
            expect(response.body.message).toBe('Get Products Success');

            expect(response.body.data).toHaveLength(3);

            expect(response.body.data[0]).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    name: expect.any(String),
                    description: expect.any(String),
                    price: expect.any(Number),
                    quantityInStock: expect.any(Number),
                    categoryId: expect.any(String),
                    userId: expect.any(String),
                    isActive: expect.any(Boolean)
                })
            );
        });

        it('should return 401 error when getting products without authentication', async () => {
            const response = await supertest(app)
                .get('/v1/products')
                .set('Authorization', ``)
                .expect(status.UNAUTHORIZED);
            
            expect(response.body.code).toBe(401);
    
            expect(response.body.message).toBe('Please authenticate');
        });

        it('should return inactive products', async () => {
            await prisma.product.update({
                where: {
                    id: productOne.id,
                },
                data: {
                    isActive: false,
                    deletedAt: new Date()
                }
            });

            const response = await supertest(app)
                .get('/v1/products')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(status.OK)

            expect(response.body.data.some(product => product === productOne.id)).toBe(false);
        })
    });

    describe('POST /v1/products', () => {
        it('should return 201 and successfully create product', async () => {
            const newProduct = {
                name: 'meja belajar',
                description: 'ukuran 2x1 meter',
                price: 750000,
                quantityInStock: 10,
                categoryId: categoryTwo.id,
                userId: userTwo.id,
            };

            const response = await supertest(app)
                .post('/v1/products')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newProduct)
                .expect(status.CREATED);
            
            expect(response.body.status).toBe(201);

            expect(response.body.message).toBe('Create Product Success')

            //cek response body
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    name: expect.any(String),
                    description: expect.any(String),
                    price: expect.any(Number),
                    quantityInStock: expect.any(Number),
                    categoryId: expect.any(String),
                    userId: expect.any(String),
                    isActive: expect.any(Boolean)
                })
            );

            //cek product tersimpan di database
            const dbProduct = await prisma.product.findFirst({
                where: {
                    name: newProduct.name,
                }
            });

            expect(dbProduct).not.toBeNull();
            expect(dbProduct.name).toBe(newProduct.name);
            expect(dbProduct.description).toBe(newProduct.description);
            expect(dbProduct.price).toBe(newProduct.price);
            expect(dbProduct.quantityInStock).toBe(newProduct.quantityInStock);
            expect(dbProduct.price).toBe(newProduct.price);
        });

        it('should return 401 error when creating product without authentication', async () => {
            const newProduct = {
                name: 'meja belajar',
                description: 'ukuran 2x1 meter',
                price: 750000,
                quantityInStock: 10,
                categoryId: categoryTwo.id,
                userId: userTwo.id,
            };

            const response = await supertest(app)
                .post('/v1/products')
                .set('Authorization', ``)
                .send(newProduct)
                .expect(status.UNAUTHORIZED);

            //cek status code
            expect(response.body.code).toBe(401);
            
            //cek error message
            expect(response.body.message).toBe('Please authenticate');


            //cek product tersimpan di database
            const dbProduct = await prisma.product.findFirst({
                where: {
                    name: newProduct.name,
                }
            });

            expect(dbProduct).toBeNull();
        });

        it('should return 400 error if request body is empty', async () => {
            const newProduct = {};

            const response = await supertest(app)
                .post('/v1/products')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newProduct)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('is required');
        });

        it('should return 400 error if name is empty', async () => {
            const newProduct = {
                name: '',
                description: 'ukuran 2x1 meter',
                price: 750000,
                quantityInStock: 10,
                categoryId: categoryTwo.id,
                userId: userTwo.id,
            };

            const response = await supertest(app)
                .post('/v1/products')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newProduct)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('is not allowed to be empty');

            //cek product tersimpan di database
            const dbProduct = await prisma.product.findFirst({
                where: {
                    name: newProduct.name,
                }
            });

            expect(dbProduct).toBeNull();
        });

        it('should return 400 error if description is empty', async () => {
            const newProduct = {
                name: 'meja belajar',
                description: '',
                price: 750000,
                quantityInStock: 10,
                categoryId: categoryTwo.id,
                userId: userTwo.id,
            };

            const response = await supertest(app)
                .post('/v1/products')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newProduct)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('is not allowed to be empty');

            //cek product tersimpan di database
            const dbProduct = await prisma.product.findFirst({
                where: {
                    name: newProduct.name,
                }
            });

            expect(dbProduct).toBeNull();
        });

        it('should return 400 error if price is invalid', async () => {
            const newProduct = {
                name: 'meja belajar',
                description: 'ukuran 2x1 meter',
                price: "abc",
                quantityInStock: 10,
                categoryId: categoryTwo.id,
                userId: userTwo.id,
            };

            const response = await supertest(app)
                .post('/v1/products')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newProduct)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('must be a number');

            //cek product tersimpan di database
            const dbProduct = await prisma.product.findFirst({
                where: {
                    name: newProduct.name,
                }
            });

            expect(dbProduct).toBeNull();
        });

        it('should return 400 error if quantityInStock is invalid', async () => {
            const newProduct = {
                name: 'meja belajar',
                description: 'ukuran 2x1 meter',
                price: 750000,
                quantityInStock: "abc",
                categoryId: categoryTwo.id,
                userId: userTwo.id,
            };

            const response = await supertest(app)
                .post('/v1/products')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newProduct)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('must be a number');

            //cek product tersimpan di database
            const dbProduct = await prisma.product.findFirst({
                where: {
                    name: newProduct.name,
                }
            });

            expect(dbProduct).toBeNull();
        });

        it('should return 400 error if categoryId is invalid', async () => {
            const newProduct = {
                name: 'meja belajar',
                description: 'ukuran 2x1 meter',
                price: 750000,
                quantityInStock: 10,
                categoryId: "invalidId",
                userId: userTwo.id,
            };

            const response = await supertest(app)
                .post('/v1/products')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newProduct)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('must be a valid UUID');

            //cek product tersimpan di database
            const dbProduct = await prisma.product.findFirst({
                where: {
                    name: newProduct.name,
                }
            });

            expect(dbProduct).toBeNull();
        });

        it('should return 400 error if userId is invalid', async () => {
            const newProduct = {
                name: 'meja belajar',
                description: 'ukuran 2x1 meter',
                price: 750000,
                quantityInStock: 10,
                categoryId: categoryTwo.id,
                userId: 'invalid',
            };

            const response = await supertest(app)
                .post('/v1/products')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newProduct)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('must be a valid UUID');

            //cek product tersimpan di database
            const dbProduct = await prisma.product.findFirst({
                where: {
                    name: newProduct.name,
                }
            });

            expect(dbProduct).toBeNull();
        });
    });

    describe('GET /v1/products/:productId', () => {
        it('should return 200 and successfully getting product by ID',async () => {
            const response = await supertest(app)
                .get(`/v1/products/${productOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(status.OK);
            
            expect(response.body.status).toBe(200)
    
            expect(response.body.message).toBe('Get Product by ID Success');

            expect(response.body.data).not.toBeNull();

            expect(response.body.data).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    name: expect.any(String),
                    description: expect.any(String),
                    price: expect.any(Number),
                    quantityInStock: expect.any(Number),
                    categoryId: expect.any(String),
                    userId: expect.any(String),
                    isActive: expect.any(Boolean)
                })
            );
        });

        it('should return 401 error when getting product by ID without authentication',async () => {
            const response = await supertest(app)
                .get(`/v1/products/${productOne.id}`)
                .set('Authorization', ``)
                .expect(status.UNAUTHORIZED);
    
            expect(response.body.code).toBe(401)

            expect(response.body.message).toBe('Please authenticate');
        });

        it('should return 400 error if productId is invalid',async () => {
            const response = await supertest(app)
                .get(`/v1/products/invalidId`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(status.BAD_REQUEST);

            expect(response.body.code).toBe(400); 
            
            expect(response.body.message).toContain('must be a valid');
        });

        it('should return 404 error if productId is not found',async () => {
            const response = await supertest(app)
                .get(`/v1/products/68a4002e-adf5-478b-87dc-e0f40984d261`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(status.NOT_FOUND);
            
            expect(response.body.code).toBe(404); 

            expect(response.body.message).toContain('Product not found');
        });
    });

    describe('UPDATE /v1/products/:productId', () => {
        it('should return 200 and successfully updating a product if request data is ok', async () => {
            const response = await supertest(app)
                .put(`/v1/products/${productOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({
                    name: 'Updated product',
                    description: 'Updated product',
                    price: 1
                })
                .expect(status.OK);

            //cek status code
            expect(response.body.status).toBe(200)

            //cek message
            expect(response.body.message).toContain('Update Product Success')

            //cek response body
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    id: productOne.id,
                    name: 'Updated product',
                    description: 'Updated product',
                    price: 1,
                    quantityInStock: expect.any(Number),
                    categoryId: expect.any(String),
                    userId: expect.any(String),
                    isActive: expect.any(Boolean),
                })
            );
        });

        it('should return 401 error when updating a product without authentication',async () => {
            const response = await supertest(app)
                .put(`/v1/products/${productOne.id}`)
                .set('Authorization', ``)
                .send({
                    name: 'Updated product',
                    description: 'Updated product',
                    price: 1
                })
                .expect(status.UNAUTHORIZED);

            //cek status code
            expect(response.body.code).toBe(401)

            //cek message
            expect(response.body.message).toContain('Please authenticate');
        });

        it('should return 400 error when updating a product when request body is empty',async () => {
            const response = await supertest(app)
                .put(`/v1/products/${productOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({})
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);

            //cek message
            expect(response.body.message).toContain('must have at least 1 key');
        });

        it('should return 400 error when updating a product when name is empty',async () => {
            const updatedCategory = {
                name: '',
                description: 'Updated product',
                price: 750000,
                quantityInStock: 10,
                categoryId: categoryTwo.id,
                userId: userTwo.id,
            };

            const response = await supertest(app)
                .put(`/v1/products/${productOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('is not allowed to be empty')
        });

        it('should return 400 error when updating a product when description is empty',async () => {
            const updatedCategory = {
                name: 'Updated product',
                description: '',
                price: 750000,
                quantityInStock: 10,
                categoryId: categoryTwo.id,
                userId: userTwo.id,
            };

            const response = await supertest(app)
                .put(`/v1/products/${productOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('is not allowed to be empty');
        });

        it('should return 400 error when updating a product when price is invalid',async () => {
            const updatedCategory = {
                name: 'Updated product',
                description: 'Updated product',
                price: "abc",
                quantityInStock: 10,
                categoryId: categoryTwo.id,
                userId: userTwo.id,
            };

            const response = await supertest(app)
                .put(`/v1/products/${productOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('must be a number');
        });

        it('should return 400 error when updating a product when quantityInStock is invalid',async () => {
            const updatedCategory = {
                name: 'Updated product',
                description: 'Updated product',
                price: 750000,
                quantityInStock: "abc",
                categoryId: categoryTwo.id,
                userId: userTwo.id,
            };

            const response = await supertest(app)
                .put(`/v1/products/${productOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('must be a number');
        });

        it('should return 400 error when updating a product when categoryId is invalid',async () => {
            const updatedCategory = {
                name: 'Updated product',
                description: 'Updated product',
                price: 750000,
                quantityInStock: 10,
                categoryId: 'invalidId',
                userId: userTwo.id,
            };

            const response = await supertest(app)
                .put(`/v1/products/${productOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('must be a valid UUID');
        });

        it('should return 400 error when updating a product when userId is invalid',async () => {
            const updatedCategory = {
                name: 'Updated product',
                description: 'Updated product',
                price: 750000,
                quantityInStock: 10,
                categoryId: categoryTwo.id,
                userId: 'invalidId',
            };

            const response = await supertest(app)
                .put(`/v1/products/${productOne.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('must be a valid UUID');
        });

        it('should return 400 error when updating a product when productId is invalid',async () => {
            const updatedCategory = {
                name: 'Updated product',
                description: 'Updated product',
                price: 750000,
                quantityInStock: 10,
                categoryId: categoryTwo.id,
                userId: userTwo.id,
            };

            const response = await supertest(app)
                .put(`/v1/products/invalidId`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);

            //cek message
            expect(response.body.message).toContain('must be a valid UUID')
        });

        it('should return 404 error when updating a product when productId is not found',async () => {
            const updatedCategory = {
                name: 'Updated product',
                description: 'Updated product',
                price: 750000,
                quantityInStock: 10,
                categoryId: categoryTwo.id,
                userId: userTwo.id,
            };

            const response = await supertest(app)
                .put(`/v1/products/1e1bf559-2af4-441b-ae64-fe670ac4b3ce`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(updatedCategory)
                .expect(status.NOT_FOUND);

            //cek status code
            expect(response.body.code).toBe(404);

            //cek message
            expect(response.body.message).toBe('Product not found');
        });
    });

    describe('DELETE /v1/products/:productId', () => {
      it('should return 200 and successfully hard deleting product',async () => {
        const response = await supertest(app)
            .delete(`/v1/products/${productForDelete.id}`)
            .set('Authorization', `Bearer ${userOneAccessToken}`)  

        //cek status code
        expect(response.body.status).toBe(200);

        //cek message
        expect(response.body.message).toBe('Hard Delete Product Success');

        //cek product database
        const dbProduct = await prisma.product.findUnique({
            where: {
                id: productForDelete.id
            }
        });

        expect(dbProduct).toBeNull()
      });
      
      it('should return 401 when hard deleting a product without authentication',async () => {
        const response = await supertest(app)
            .delete(`/v1/products/${productForDelete.id}`)
            .set('Authorization', ``)
            .expect(status.UNAUTHORIZED);

        //cek status code
        expect(response.body.code).toBe(401);

        //cek message
        expect(response.body.message).toBe('Please authenticate');
      });

      it('should return 400 when hard deleting a product when productId is invalid',async () => {
        const response = await supertest(app)
            .delete(`/v1/products/${'invalidId'}`)
            .set('Authorization', `Bearer ${userOneAccessToken}`)
            .expect(status.BAD_REQUEST);

        //cek status code
        expect(response.body.code).toBe(400);

        //cek message
        expect(response.body.message).toContain('must be a valid UUID');
      });

      it('should return 404 when hard deleting a product when productId is not found',async () => {
        const response = await supertest(app)
            .delete(`/v1/products/1e1bf559-2af4-441b-ae64-fe670ac4b3c1`)
            .set('Authorization', `Bearer ${userOneAccessToken}`)
            .expect(status.NOT_FOUND);

        //cek status code
        expect(response.body.code).toBe(404);

        //cek message
        expect(response.body.message).toBe('Product not found');
      });
    })

    describe('PATCH /v1/products/:productId/soft-delete', () => {
      it('should return 200 and successfully soft deleting product',async () => {
        const response = await supertest(app)
            .patch(`/v1/products/${productTwo.id}/soft-delete`)
            .set('Authorization', `Bearer ${userOneAccessToken}`)
            .expect(status.OK)

        expect(response.body.status).toBe(200);

        expect(response.body.message).toBe('Soft Delete Product Success');

        const dbProduct = await prisma.product.findUnique({
            where: {
                id: productTwo.id
            }
        });

        expect(dbProduct).not.toBeNull();
        expect(dbProduct.isActive).toBe(false);
        expect(dbProduct.deletedAt).not.toBeNull();
      });
      
      it('should return 401 when soft deleting a product without authentication',async () => {
        const response = await supertest(app)
            .patch(`/v1/products/${productTwo.id}/soft-delete`)
            .set('Authorization', ``)
            .expect(status.UNAUTHORIZED)

        expect(response.body.code).toBe(401);

        expect(response.body.message).toBe('Please authenticate')
      });

      it('should return 400 when soft deleting a product when productId is invalid',async () => {
        const response = await supertest(app)
            .patch(`/v1/products/invalidId/soft-delete`)
            .set('Authorization', `Bearer ${userOneAccessToken}`)
            .expect(status.BAD_REQUEST)

        expect(response.body.code).toBe(400);

        expect(response.body.message).toContain('must be a valid UUID')
      });

      it('should return 404 when soft deleting a product when productId is not found',async () => {
        const response = await supertest(app)
            .patch(`/v1/products/71c7e832-231e-402a-b273-d33ba8431f31/soft-delete`)
            .set('Authorization', `Bearer ${userOneAccessToken}`)
            .expect(status.NOT_FOUND)

        expect(response.body.code).toBe(404);

        expect(response.body.message).toBe('Product not found')
      });
    });
});