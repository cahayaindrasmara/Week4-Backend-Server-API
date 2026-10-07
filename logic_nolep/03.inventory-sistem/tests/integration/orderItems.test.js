import supertest from "supertest";
import app from "../../src/app.js";
import status from "http-status";
import { prisma } from "../../lib/prisma.js";
import { adminAccessToken } from "../fixtures/token.fixture.js";
import setUpTestDB from "../setupTestDB.js";
import { orderOne } from "../fixtures/order.fixture.js";
import { orderItemOne, orderItemFour } from "../fixtures/orderItems.fixture.js";
import { productOne } from "../fixtures/product.fixture.js";

setUpTestDB()

describe('Testing Order Item Routes', () => {
    describe('GET /v1/order-items', () => {
        it('should return 200 and successfully get order items', async () => {
            const response = await supertest(app)
                .get('/v1/order-items')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(status.OK);

            expect(response.body.status).toBe(200);
    
            expect(response.body.message).toBe('Get Order Items Success');

            expect(response.body.data).toHaveLength(4);

            expect(response.body.data[0]).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    orderId: expect.any(String),
                    productId: expect.any(String),
                    quantity: expect.any(Number),
                    unitPrice: expect.any(Number),
                })
            );
        });

        it('should return 401 error when getting order items without authentication', async () => {
            const response = await supertest(app)
                .get('/v1/order-items')
                .set('Authorization', ``)
                .expect(status.UNAUTHORIZED);
            
            expect(response.body.code).toBe(401);
    
            expect(response.body.message).toBe('Please authenticate');
        });
    });

    describe('POST /v1/order-items', () => {
        it('should return 201 and successfully create order', async () => {
            const newOrderItems = {
                orderId: orderOne.id,
                productId: productOne.id,
                quantity: 5,
                unitPrice: 2500000
            };

            const response = await supertest(app)
                .post('/v1/order-items')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrderItems)
                .expect(status.CREATED);
            
            expect(response.body.status).toBe(201);

            expect(response.body.message).toBe('Create Order Item Success')

            //cek response body
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    orderId: expect.any(String),
                    productId: expect.any(String),
                    quantity: expect.any(Number),
                    unitPrice: expect.any(Number),
                })
            );

            //cek order items tersimpan di database
            const dbOrderItems = await prisma.orderItem.findUnique({
                where: {
                    id: response.body.data.id,
                }
            });

            expect(dbOrderItems).not.toBeNull();
            expect(dbOrderItems.orderId).toBe(newOrderItems.orderId);
            expect(dbOrderItems.productId).toBe(newOrderItems.productId);
            expect(dbOrderItems.quantity).toBe(newOrderItems.quantity);
            expect(dbOrderItems.unitPrice).toBe(newOrderItems.unitPrice);
        });

        it('should return 401 error when creating order without authentication', async () => {
            const newOrderItems = {
                orderId: orderOne.id,
                productId: productOne.id,
                quantity: 5,
                unitPrice: 2500000
            };

            // jumlah sebelum request
            const countBefore = await prisma.orderItem.count();

            const response = await supertest(app)
                .post('/v1/order-items')
                .set('Authorization', ``)
                .send(newOrderItems)
                .expect(status.UNAUTHORIZED);

            //cek status code
            expect(response.body.code).toBe(401);
            
            //cek error message
            expect(response.body.message).toBe('Please authenticate');

            // jumlah setelah request
            const countAfter = await prisma.orderItem.count();

            // pastikan tidak ada OrderItem baru
            expect(countAfter).toBe(countBefore);
        });

        it('should return 400 error if request body is empty', async () => {
            const newOrderItems = {};

            const response = await supertest(app)
                .post('/v1/order-items')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrderItems)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('is required');
        });

        it('should return 400 error if orderId is invalid', async () => {
            const newOrderItems = {
                orderId: 'invalidId',
                productId: productOne.id,
                quantity: 5,
                unitPrice: 2500000
            };

            // jumlah sebelum request
            const countBefore = await prisma.orderItem.count();

            const response = await supertest(app)
                .post('/v1/order-items')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrderItems)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('must be a valid UUID');

            // jumlah setelah request
            const countAfter = await prisma.orderItem.count();

            // pastikan tidak ada OrderItem baru
            expect(countAfter).toBe(countBefore);
        });

        it('should return 400 error if productId is invalid', async () => {
            const newOrderItems = {
                orderId: orderOne.id,
                productId: 'invalidId',
                quantity: 5,
                unitPrice: 2500000
            };

            // jumlah sebelum request
            const countBefore = await prisma.orderItem.count();

            const response = await supertest(app)
                .post('/v1/order-items')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrderItems)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('must be a valid UUID');

            // jumlah setelah request
            const countAfter = await prisma.orderItem.count();

            // pastikan tidak ada OrderItem baru
            expect(countAfter).toBe(countBefore);
        });

        it('should return 400 error if quantity is invalid', async () => {
            const newOrderItems = {
                orderId: orderOne.id,
                productId: productOne.id,
                quantity: 'abc',
                unitPrice: 2500000
            };

            // jumlah sebelum request
            const countBefore = await prisma.orderItem.count();

            const response = await supertest(app)
                .post('/v1/order-items')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrderItems)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('must be a number');

            // jumlah setelah request
            const countAfter = await prisma.orderItem.count();

            // pastikan tidak ada OrderItem baru
            expect(countAfter).toBe(countBefore);
        });

        it('should return 400 error if unit price is invalid', async () => {
            const newOrderItems = {
                orderId: orderOne.id,
                productId: productOne.id,
                quantity: 5,
                unitPrice: 'abc'
            };

            // jumlah sebelum request
            const countBefore = await prisma.orderItem.count();

            const response = await supertest(app)
                .post('/v1/order-items')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(newOrderItems)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);
            
            //cek error message
            expect(response.body.message).toContain('must be a number');
            
            // jumlah setelah request
            const countAfter = await prisma.orderItem.count();

            // pastikan tidak ada OrderItem baru
            expect(countAfter).toBe(countBefore);
        });
    });

    describe('GET /v1/order-items/:orderId', () => {
        it('should return 200 and successfully getting order items by ID',async () => {
            const response = await supertest(app)
                .get(`/v1/order-items/${orderItemOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(status.OK);
            
            expect(response.body.status).toBe(200)
    
            expect(response.body.message).toBe('Get Order Item By ID Success');

            expect(response.body.data).not.toBeNull();

            expect(response.body.data).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    orderId: expect.any(String),
                    productId: expect.any(String),
                    quantity: expect.any(Number),
                    unitPrice: expect.any(Number),
                })
            );
        });

        it('should return 401 error when getting order item by ID without authentication',async () => {
            const response = await supertest(app)
                .get(`/v1/order-items/${orderItemOne.id}`)
                .set('Authorization', ``)
                .expect(status.UNAUTHORIZED);
    
            expect(response.body.code).toBe(401)

            expect(response.body.message).toBe('Please authenticate');
        });

        it('should return 400 error if orderItemId is invalid',async () => {
            const response = await supertest(app)
                .get(`/v1/order-items/invalidId`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(status.BAD_REQUEST);

            expect(response.body.code).toBe(400); 
            
            expect(response.body.message).toContain('must be a valid UUID');
        });

        it('should return 404 error if orderItemId is not found',async () => {
            const response = await supertest(app)
                .get(`/v1/order-items/68a4002e-adf5-478b-87dc-e0f40984d261`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(status.NOT_FOUND);
            
            expect(response.body.code).toBe(404); 

            expect(response.body.message).toContain('Order Item not found');
        });
    });

    describe('UPDATE /v1/order-items/:orderId', () => {
        it('should return 200 and successfully updating a order item if request data is ok', async () => {
            const response = await supertest(app)
                .put(`/v1/order-items/${orderItemOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    quantity: 0,
                    unitPrice: 0,
                })
                .expect(status.OK);

            //cek status code
            expect(response.body.status).toBe(200)

            //cek message
            expect(response.body.message).toContain('Update Order Item Success')

            //cek response body
            expect(response.body.data).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    orderId: expect.any(String),
                    productId: expect.any(String),
                    quantity: expect.any(Number),
                    unitPrice: expect.any(Number),
                })
            );
        });

        it('should return 401 error when updating a order item without authentication',async () => {
            const response = await supertest(app)
                .put(`/v1/order-items/${orderItemOne.id}`)
                .set('Authorization', ``)
                .send({
                    quantity: 0,
                    unitPrice: 0,
                })
                .expect(status.UNAUTHORIZED);

            //cek status code
            expect(response.body.code).toBe(401)

            //cek message
            expect(response.body.message).toContain('Please authenticate');
        });

        it('should return 400 error when updating a order item when request body is empty',async () => {
            const response = await supertest(app)
                .put(`/v1/order-items/${orderItemOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({})
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400);

            //cek message
            expect(response.body.message).toContain('must have at least 1 key');
        });

        it('should return 400 error when updating a order item when orderId is invalid',async () => {
            const updatedOrderItem = {
                orderId: 'invalidId',
                quantity: 0,
                unitPrice: 0
            };

            const response = await supertest(app)
                .put(`/v1/order-items/${orderItemOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedOrderItem)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('must be a valid UUID')
        });

        it('should return 400 error when updating a order item when productId is invalid',async () => {
            const updatedOrderItem = {
                productId: 'invalidId',
                quantity: 0,
                unitPrice: 0
            };

            const response = await supertest(app)
                .put(`/v1/order-items/${orderItemOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedOrderItem)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('must be a valid UUID');
        });

        it('should return 400 error when updating a order item when quantity is invalid',async () => {
            const updatedOrderItem = {
                quantity: 'abc',
                unitPrice: 0
            };

            const response = await supertest(app)
                .put(`/v1/order-items/${orderItemOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedOrderItem)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('must be a number');
        });

        it('should return 400 error when updating a order item when unit price is invalid',async () => {
            const updatedOrderItem = {
                quantity: 0,
                unitPrice: 'abc'
            };

            const response = await supertest(app)
                .put(`/v1/order-items/${orderItemOne.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(updatedOrderItem)
                .expect(status.BAD_REQUEST);

            //cek status code
            expect(response.body.code).toBe(400)

            //cek message
            expect(response.body.message).toContain('must be a number');
        });
    });

    describe('DELETE /v1/order-items/:orderId', () => {
      it('should return 200 and successfully hard deleting order item',async () => {
        const response = await supertest(app)
            .delete(`/v1/order-items/${orderItemFour.id}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)  

        //cek status code
        expect(response.body.status).toBe(200);

        //cek message
        expect(response.body.message).toBe('Hard Delete Order Item Success');

        //cek order items database
        const dbOrderItems = await prisma.orderItem.findFirst({
            where: {
                id: orderItemFour.id
            }
        });

        expect(dbOrderItems).toBeNull()
      });
      
      it('should return 401 when hard deleting a order item without authentication',async () => {
        const response = await supertest(app)
            .delete(`/v1/order-items/${orderItemFour.id}`)
            .set('Authorization', ``)
            .expect(status.UNAUTHORIZED);

        //cek status code
        expect(response.body.code).toBe(401);

        //cek message
        expect(response.body.message).toBe('Please authenticate');
      });

      it('should return 400 when hard deleting a order item when orderItemId is invalid',async () => {
        const response = await supertest(app)
            .delete(`/v1/order-items/${'invalidId'}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(status.BAD_REQUEST);

        //cek status code
        expect(response.body.code).toBe(400);

        //cek message
        expect(response.body.message).toContain('must be a valid UUID');
      });

      it('should return 404 when hard deleting a order when orderItemId is not found',async () => {
        const response = await supertest(app)
            .delete(`/v1/order-items/1e1bf559-2af4-441b-ae64-fe670ac4b3c1`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(status.NOT_FOUND);

        //cek status code
        expect(response.body.code).toBe(404);

        //cek message
        expect(response.body.message).toBe('Order Item not found');
      });
    });
});