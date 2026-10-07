import supertest from "supertest";
import app from "../../src/app.js";
import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import { adminAccessToken } from "../fixtures/token.fixture.js";
import setUpTestDB from "../setupTestDB.js";
import { orderOne,orderTwo, orderThree, orderForDelete } from "../fixtures/order.fixture.js";
import { productTwo } from "../fixtures/product.fixture.js";

setUpTestDB()

describe('Testing Order Routes', () => {
    describe('GET /v1/orders', () => {
        it('should return 200 and successfully get orders', async () => {
            const response = await supertest(app)
                .get('/v1/orders')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(status.OK);

            expect(response.body.status).toBe(200);
    
            expect(response.body.message).toBe('Get Orders Success');

            expect(response.body.data).toHaveLength(3);

            expect(response.body.data[0]).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    date: expect.any(String),
                    totalPrice: expect.any(Number),
                    customerName: expect.any(String),
                    customerEmail: expect.any(String),
                    userId: expect.any(String),
                    isActive: expect.any(Boolean)
                })
            );
        });

        it('should return 401 error when getting orders without authentication', async () => {
            const response = await supertest(app)
                .get('/v1/orders')
                .set('Authorization', ``)
                .expect(status.UNAUTHORIZED);
            
            expect(response.body.code).toBe(401);
    
            expect(response.body.message).toBe('Please authenticate');
        });

        it('should return inactive orders', async () => {
            await prisma.order.update({
                where: {
                    id: orderOne.id,
                },
                data: {
                    isActive: false,
                    deletedAt: new Date()
                }
            });

            const response = await supertest(app)
                .get('/v1/orders')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(status.OK)

            expect(response.body.data.some(order => order === orderOne.id)).toBe(false);
        })
    });

    describe('POST /v1/orders', () => {
        it('should return 201 and successfully create order', async () => {
            const newOrder = {
                customerName: 'budi',
                customerEmail: 'budi@gmail.com',
                userId: orderThree.userId,
                items: [
                    {
                        productId: productTwo.id,
                        quantity: 2
                    }
                ]
            };

            const response = await supertest(app)
                .post('/v1/orders')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrder)
                .expect(status.CREATED);
            
            expect(response.body.status).toBe(201);

            expect(response.body.message).toBe('Create Order Success')

            //cek response body
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    date: expect.any(String),
                    totalPrice: expect.any(Number),
                    customerName: expect.any(String),
                    customerEmail: expect.any(String),
                    userId: expect.any(String),
                    isActive: expect.any(Boolean)
                })
            );

            //cek order tersimpan di database
            const dbOrder = await prisma.order.findFirst({
                where: {
                    customerEmail: newOrder.customerEmail,
                }
            });

            expect(dbOrder).not.toBeNull();
            expect(dbOrder.customerName).toBe(newOrder.customerName);
            expect(dbOrder.customerEmail).toBe(newOrder.customerEmail);
            expect(dbOrder.userId).toBe(newOrder.userId);
        });

        it('should return 401 error when creating order without authentication', async () => {
            const newOrder = {
                customerName: 'budi',
                customerEmail: 'budi@gmail.com',
                userId: orderThree.userId,
                items: [
                    {
                        productId: productTwo.id,
                        quantity: 2
                    }
                ]
            };

            const response = await supertest(app)
                .post('/v1/orders')
                .set('Authorization', ``)
                .send(newOrder)
                .expect(status.UNAUTHORIZED);

            //cek status code
            expect(response.body.code).toBe(401);
            
            //cek error message
            expect(response.body.message).toBe('Please authenticate');


            //cek order tersimpan di database
            const dbOrder = await prisma.order.findFirst({
                where: {
                    customerEmail: newOrder.customerEmail,
                }
            });

            expect(dbOrder).toBeNull();
        });

        it('should return 400 error when creating order if the stock quantity is not enough', async () => {
            const newOrder = {
                customerName: 'budi',
                customerEmail: 'budi@gmail.com',
                userId: orderThree.userId,
                items: [
                    {
                        productId: productTwo.id,
                        quantity: 200
                    }
                ]
            };

            const response = await supertest(app)
                .post('/v1/orders')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrder)
                .expect(status.BAD_REQUEST);
            
            expect(response.body.code).toBe(400);

            expect(response.body.message).toBe('Stock not enough')

            //cek order tersimpan di database
            const dbOrder = await prisma.order.findFirst({
                where: {
                    customerEmail: newOrder.customerEmail,
                }
            });

            expect(dbOrder).toBeNull();
        });

        it('should return 404 error when create order if productId not found', async () => {
            const newOrder = {
                customerName: 'budi',
                customerEmail: 'budi@gmail.com',
                userId: orderThree.userId,
                items: [
                    {
                        productId: 'd66c5564-a0ae-46d9-bf37-72acbfbf0626',
                        quantity: 1
                    }
                ]
            };

            const response = await supertest(app)
                .post('/v1/orders')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrder)
                .expect(status.NOT_FOUND);
            
            expect(response.body.code).toBe(404);

            expect(response.body.message).toBe('Product not found')

            //cek order tersimpan di database
            const dbOrder = await prisma.order.findFirst({
                where: {
                    customerEmail: newOrder.customerEmail,
                }
            });

            expect(dbOrder).toBeNull();
        });

        it('should return 400 error if request body is empty', async () => {
            const newOrder = {};

            const response = await supertest(app)
                .post('/v1/orders')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrder)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('is required');
        });

        it('should return 400 error if customerName is empty', async () => {
            const newOrder = {
                customerName: '',
                customerEmail: 'budi@gmail.com',
                userId: orderThree.userId,
                items: [
                    {
                        productId: productTwo.id,
                        quantity: 2
                    }
                ]
            };

            const response = await supertest(app)
                .post('/v1/orders')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrder)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('is not allowed to be empty');

            //cek order tersimpan di database
            const dbOrder = await prisma.order.findFirst({
                where: {
                    customerEmail: newOrder.customerEmail,
                }
            });

            expect(dbOrder).toBeNull();
        });

        it('should return 400 error if customerEmail is empty', async () => {
            const newOrder = {
                customerName: orderThree.customerName,
                customerEmail: '',
                userId: orderThree.userId,
                items: [
                    {
                        productId: productTwo.id,
                        quantity: 2
                    }
                ]
            };

            const response = await supertest(app)
                .post('/v1/orders')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrder)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('is not allowed to be empty');

            //cek order tersimpan di database
            const dbOrder = await prisma.order.findFirst({
                where: {
                    customerEmail: newOrder.customerEmail,
                }
            });

            expect(dbOrder).toBeNull();
        });

        it('should return 400 error if userId is invalid', async () => {
            const newOrder = {
                customerName: 'budi',
                customerEmail: 'budi@gmail.com',
                userId: 'invalidId',
                items: [
                    {
                        productId: productTwo.id,
                        quantity: 2
                    }
                ]
            };

            const response = await supertest(app)
                .post('/v1/orders')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrder)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('must be a valid UUID');

            //cek order tersimpan di database
            const dbOrder = await prisma.order.findFirst({
                where: {
                    customerEmail: newOrder.customerEmail,
                }
            });

            expect(dbOrder).toBeNull();
        });

        it('should return 400 error if items is not an array', async () => {
            const newOrder = {
                customerName: 'budi',
                customerEmail: 'budi@gmail.com',
                userId: orderThree.userId,
                items: ""
            };

            const response = await supertest(app)
                .post('/v1/orders')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrder)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('must be an array');

            //cek order tersimpan di database
            const dbOrder = await prisma.order.findFirst({
                where: {
                    customerEmail: newOrder.customerEmail,
                }
            });

            expect(dbOrder).toBeNull();
        });

        it('should return 400 error if items is empty', async () => {
            const newOrder = {
                customerName: 'budi',
                customerEmail: 'budi@gmail.com',
                userId: orderThree.userId,
                items: []
            };

            const response = await supertest(app)
                .post('/v1/orders')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrder)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('must contain at least 1 items');

            //cek order tersimpan di database
            const dbOrder = await prisma.order.findFirst({
                where: {
                    customerEmail: newOrder.customerEmail,
                }
            });

            expect(dbOrder).toBeNull();
        });
    });

    describe('GET /v1/orders/:orderId', () => {
        it('should return 200 and successfully getting order by ID',async () => {
            const response = await supertest(app)
                .get(`/v1/orders/${orderOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(status.OK);
            
            expect(response.body.status).toBe(200)
    
            expect(response.body.message).toBe('Get Order by ID Success');

            expect(response.body.data).not.toBeNull();

            expect(response.body.data).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    date: expect.any(String),
                    totalPrice: expect.any(Number),
                    customerName: expect.any(String),
                    customerEmail: expect.any(String),
                    userId: expect.any(String),
                    isActive: expect.any(Boolean)
                })
            );
        });

        it('should return 401 error when getting order by ID without authentication',async () => {
            const response = await supertest(app)
                .get(`/v1/orders/${orderOne.id}`)
                .set('Authorization', ``)
                .expect(status.UNAUTHORIZED);
    
            expect(response.body.code).toBe(401)

            expect(response.body.message).toBe('Please authenticate');
        });

        it('should return 400 error if orderId is invalid',async () => {
            const response = await supertest(app)
                .get(`/v1/orders/invalidId`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(status.BAD_REQUEST);

            expect(response.body.code).toBe(400); 
            
            expect(response.body.message).toContain('must be a valid');
        });

        it('should return 404 error if orderId is not found',async () => {
            const response = await supertest(app)
                .get(`/v1/orders/68a4002e-adf5-478b-87dc-e0f40984d261`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(status.NOT_FOUND);
            
            expect(response.body.code).toBe(404); 

            expect(response.body.message).toContain('Order not found');
        });
    });

    describe('UPDATE /v1/orders/:orderId', () => {
        it('should return 200 and successfully updating a order if request data is ok', async () => {
            const response = await supertest(app)
                .put(`/v1/orders/${orderOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    customerName: 'Updated order',
                    customerEmail: 'Updated order',
                })
                .expect(status.OK);

            //cek status code
            expect(response.body.status).toBe(200)

            //cek message
            expect(response.body.message).toContain('Update Order Success')

            //cek response body
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    date: expect.any(String),
                    totalPrice: expect.any(Number),
                    customerName: expect.any(String),
                    customerEmail: expect.any(String),
                    userId: expect.any(String),
                    isActive: expect.any(Boolean),
                })
            );
        });

        it('should return 401 error when updating a order without authentication',async () => {
            const response = await supertest(app)
                .put(`/v1/orders/${orderOne.id}`)
                .set('Authorization', ``)
                .send({
                    customerName: 'Updated order',
                    customerEmail: 'Updated order',
                })
                .expect(status.UNAUTHORIZED);

            //cek status code
            expect(response.body.code).toBe(401)

            //cek message
            expect(response.body.message).toContain('Please authenticate');
        });

        it('should return 400 error when updating a order when request body is empty',async () => {
            const response = await supertest(app)
                .put(`/v1/orders/${orderOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({})
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);

            //cek message
            expect(response.body.message).toContain('must have at least 1 key');
        });

        it('should return 400 error when updating a order when customerName is empty',async () => {
            const updatedCategory = {
                customerName: '',
                customerEmail: orderThree.customerEmail,
                userId: orderThree.userId,
                items: [
                    {
                        productId: productTwo.id,
                        quantity: 2
                    }
                ]
            };

            const response = await supertest(app)
                .put(`/v1/orders/${orderOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('is not allowed to be empty')
        });

        it('should return 400 error when updating a order when customerEmail is empty',async () => {
            const updatedCategory = {
                customerName: orderThree.customerName,
                customerEmail: '',
                userId: orderThree.userId,
                items: [
                    {
                        productId: productTwo.id,
                        quantity: 2
                    }
                ]
            };

            const response = await supertest(app)
                .put(`/v1/orders/${orderOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('is not allowed to be empty');
        });

        it('should return 400 error when updating a order when userId is invalid',async () => {
            const updatedCategory = {
                customerName: 'budi',
                customerEmail: 'budi@gmail.com',
                userId: 'invalidId',
                items: [
                    {
                        productId: productTwo.id,
                        quantity: 2
                    }
                ]
            };

            const response = await supertest(app)
                .put(`/v1/orders/${orderOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('must be a valid UUID');
        });

        it('should return 400 error when updating a order when items is not an array',async () => {
            const updatedCategory = {
                customerName: 'budi',
                customerEmail: 'budi@gmail.com',
                userId: orderThree.userId,
                items: ''
            };

            const response = await supertest(app)
                .put(`/v1/orders/${orderOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('must be an array');
        });

        it('should return 400 error when updating a order items is an empty',async () => {
            const updatedCategory = {
                customerName: 'budi',
                customerEmail: 'budi@gmail.com',
                userId: orderThree.userId,
                items: []
            };

            const response = await supertest(app)
                .put(`/v1/orders/${orderOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedCategory)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('must contain at least 1 items');
        });
    });

    describe('DELETE /v1/orders/:orderId', () => {
      it('should return 200 and successfully hard deleting order',async () => {
        const response = await supertest(app)
            .delete(`/v1/orders/${orderForDelete.id}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)  

        //cek status code
        expect(response.body.status).toBe(200);

        //cek message
        expect(response.body.message).toBe('Hard Delete Order Success');

        //cek order database
        const dbOrder = await prisma.order.findUnique({
            where: {
                id: orderThree.id
            }
        });

        expect(dbOrder).toBeNull()
      });
      
      it('should return 401 when hard deleting a order without authentication',async () => {
        const response = await supertest(app)
            .delete(`/v1/orders/${orderThree.id}`)
            .set('Authorization', ``)
            .expect(status.UNAUTHORIZED);

        //cek status code
        expect(response.body.code).toBe(401);

        //cek message
        expect(response.body.message).toBe('Please authenticate');
      });

      it('should return 400 when hard deleting a order when orderId is invalid',async () => {
        const response = await supertest(app)
            .delete(`/v1/orders/${'invalidId'}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(status.BAD_REQUEST);

        //cek status code
        expect(response.body.code).toBe(400);

        //cek message
        expect(response.body.message).toContain('must be a valid UUID');
      });

      it('should return 404 when hard deleting a order when orderId is not found',async () => {
        const response = await supertest(app)
            .delete(`/v1/orders/1e1bf559-2af4-441b-ae64-fe670ac4b3c1`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(status.NOT_FOUND);

        //cek status code
        expect(response.body.code).toBe(404);

        //cek message
        expect(response.body.message).toBe('Order not found');
      });
    })

    describe('PATCH /v1/orders/:orderId/soft-delete', () => {
      it('should return 200 and successfully soft deleting order',async () => {
        const response = await supertest(app)
            .patch(`/v1/orders/${orderTwo.id}/soft-delete`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(status.OK)

        expect(response.body.status).toBe(200);

        expect(response.body.message).toBe('Soft Delete Order Success');

        const dbOrder = await prisma.order.findUnique({
            where: {
                id: orderTwo.id
            }
        });

        expect(dbOrder).not.toBeNull();
        expect(dbOrder.isActive).toBe(false);
        expect(dbOrder.deletedAt).not.toBeNull();
      });
      
      it('should return 401 when soft deleting a order without authentication',async () => {
        const response = await supertest(app)
            .patch(`/v1/orders/${orderTwo.id}/soft-delete`)
            .set('Authorization', ``)
            .expect(status.UNAUTHORIZED)

        expect(response.body.code).toBe(401);

        expect(response.body.message).toBe('Please authenticate')
      });

      it('should return 400 when soft deleting a order when orderId is invalid',async () => {
        const response = await supertest(app)
            .patch(`/v1/orders/invalidId/soft-delete`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(status.BAD_REQUEST)

        expect(response.body.code).toBe(400);

        expect(response.body.message).toContain('must be a valid UUID')
      });

      it('should return 404 when soft deleting a order when orderId is not found',async () => {
        const response = await supertest(app)
            .patch(`/v1/orders/71c7e832-231e-402a-b273-d33ba8431f31/soft-delete`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(status.NOT_FOUND)

        expect(response.body.code).toBe(404);

        expect(response.body.message).toBe('Order not found')
      });
    });
});