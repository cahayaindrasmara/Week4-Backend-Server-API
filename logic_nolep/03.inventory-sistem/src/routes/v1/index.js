import express from 'express';
import authRoute from './auth.route.js'
import userRoute from './user.route.js'
import categoryRoute from './category.route.js'
import productRoute from './product.route.js'
import orderRoute from './order.route.js';
import orderItemRoute from './orderItem.route.js';

const router = express.Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/users',
        route: userRoute
    }
    ,
    {
        path: '/categories',
        route: categoryRoute,
    },
    {
        path: '/products',
        route: productRoute
    },
    {
        path: '/orders',
        route: orderRoute
    },
    {
        path: '/order-items',
        route: orderItemRoute
        
    }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route)
});

export default router;