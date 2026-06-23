import OrderService from '../services/order.service.js';
import UserService from '../services/user.service.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsyncs.js';
import { status } from 'http-status';

class OrderController {
  static createOrder = catchAsync(async (req, res) => {
    const order = await OrderService.createOrder(req.body);

    res.status(status.CREATED).send({
      status: status.CREATED,
      message: 'Create Order Success',
      data: order,
    });
  });

  static getOrders = catchAsync(async (req, res) => {
    const orders = await OrderService.queryOrders();

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get Orders Success',
      data: orders,
    });
  });

  static getOrderByID = catchAsync(async (req, res) => {
    const order = await OrderService.getOrderByID(req.params.orderId);
    if (!order) {
      throw new ApiError(status.NOT_FOUND, 'Order not found');
    }

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get Order by ID Success',
      data: order,
    });
  });

  static getOrderByUser = catchAsync(async (req, res) => {
    const user = await UserService.getUserById(req.params.userId);
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'Order not found');
    }

    const order = await OrderService.getOrderByUser(req.params.userId);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get Order by User Success',
      data: order,
    });
  });

  static updateOrder = catchAsync(async (req, res) => {
    const order = await OrderService.updateOrderById(req.params.orderId, req.body);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Update Order Success',
      data: order,
    });
  });

  static hardDeleteOrder = catchAsync(async (req, res) => {
    await OrderService.hardDeleteOrderById(req.params.orderId);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Hard Delete Order Success',
      data: null,
    });
  });

  static softDeleteOrder = catchAsync(async (req, res) => {
    await OrderService.softDeleteOrderById(req.params.orderId);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Soft Delete Order Success',
      data: null,
    });
  });
}

export default OrderController;
