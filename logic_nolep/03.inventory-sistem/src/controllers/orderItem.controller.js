import OrderItemService from '../services/orderItem.service.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsyncs.js';
import status from 'http-status';

class OrderItemController {
  static createOrderItem = catchAsync(async (req, res) => {
    const orderItem = await OrderItemService.createOrderItem(req.body);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Create Order Item Success',
      data: orderItem,
    });
  });

  static getOrderItems = catchAsync(async (req, res) => {
    const orderItems = await OrderItemService.queryOrderItems();

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get Order Items Success',
      data: orderItems,
    });
  });

  static getOrderItemByID = catchAsync(async (req, res) => {
    const orderItem = await OrderItemService.getOrderItemByID(req.params.orderItemId);
    if (!orderItem) {
      throw new ApiError(status.NOT_FOUND, 'Order Item not found');
    }

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get Order Item By ID Success',
      data: orderItem,
    });
  });

  static getOrderItemByOrder = catchAsync(async (req, res) => {
    const orderItem = await OrderItemService.getOrderItemByOrder(req.params.orderId);
    if (!orderItem) {
      throw new ApiError(status.NOT_FOUND, 'Order Item not found');
    }

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get Order Item By Order Success',
      data: orderItem,
    });
  });

  static updateOrderItem = catchAsync(async (req, res) => {
    const orderItem = await OrderItemService.updateOrderItem(req.params.orderItemId, req.body);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Update Order Item Success',
      data: orderItem,
    });
  });

  static hardDeleteOrderItem = catchAsync(async (req, res) => {
    await OrderItemService.hardDeleteOrderItemByID(req.params.orderItemId);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Hard Delete Order Item Success',
      data: null,
    });
  });
}

export default OrderItemController;
