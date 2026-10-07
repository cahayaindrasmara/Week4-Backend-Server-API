import OrderItemService from '../services/orderItem.service.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsyncs.js';
import status from 'http-status';

class OrderItemController {
  static createOrderItem = catchAsync(async (req, res) => {
    const orderItem = await OrderItemService.createOrderItem(req.body);

    const orderItemsResponse = {
      id: orderItem.id,
      orderId: orderItem.orderId,
      productId: orderItem.productId,
      quantity: orderItem.quantity,
      unitPrice: orderItem.unitPrice
    }

    res.status(status.CREATED).send({
      status: status.CREATED,
      message: 'Create Order Item Success',
      data: orderItemsResponse,
    });
  });

  static getOrderItems = catchAsync(async (req, res) => {
    const {page, size} = req.query;

    const orderItems = await OrderItemService.queryOrderItems(page,size);

    const orderItemsResponse = orderItems.data.map(orderItem => ({
      id: orderItem.id,
      orderId: orderItem.orderId,
      productId: orderItem.productId,
      quantity: orderItem.quantity,
      unitPrice: orderItem.unitPrice
    }));

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get Order Items Success',
      data: orderItemsResponse,
      pagination: orderItems.pagination,
    });
  });

  static getOrderItemByID = catchAsync(async (req, res) => {
    const orderItem = await OrderItemService.getOrderItemByID(req.params.orderItemId);
    if (!orderItem) {
      throw new ApiError(status.NOT_FOUND, 'Order Item not found');
    }

    const orderItemsResponse = {
      id: orderItem.id,
      orderId: orderItem.orderId,
      productId: orderItem.productId,
      quantity: orderItem.quantity,
      unitPrice: orderItem.unitPrice
    }

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get Order Item By ID Success',
      data: orderItemsResponse,
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

    const orderItemsResponse = {
      id: orderItem.id,
      orderId: orderItem.orderId,
      productId: orderItem.productId,
      quantity: orderItem.quantity,
      unitPrice: orderItem.unitPrice
    }

    res.status(status.OK).send({
      status: status.OK,
      message: 'Update Order Item Success',
      data: orderItemsResponse,
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
