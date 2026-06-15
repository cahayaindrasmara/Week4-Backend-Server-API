import { prisma } from '../../lib/prisma.js';
import status from 'http-status';
import ApiError from '../utils/ApiError.js';

class OrderItemService {
  /**
   * Create a order item
   * @param {Object} orderItemBody 
   * @returns {Promise<OrderItem>}
   */
  static async createOrderItem(orderItemBody) {
    return prisma.orderItem.create({ 
      data: orderItemBody
     });
  }

  /**
   * Query for order items
   * @returns {Promise<orderItems>}
   */
  static async queryOrderItems() {
    return prisma.orderItem.findMany({});
  }

  /**
   * Get order items by ID
   * @param {ObjectId} orderItemsId 
   * @returns {Promise<orderItems>}
   */
  static async getOrderItemByID(orderItemId) {
    return prisma.orderItem.findUnique({
      where: {
        id: orderItemId,
      },
    });
  }

  /**
   * Get order items by Order
   * @param {ObjectId} orderId 
   * @returns {Promise<orderItems>}
   */
  static async getOrderItemByOrder(orderId) {
    return prisma.orderItem.findMany({
      where: {
        orderId: orderId,
      },
      include: {
        order: {
          select: {
            customerName: true,
            customerEmail: true,
          },
        },
      },
    });
  }

  /**
   * Update order item by ID
   * @param {ObjectId} orderItemId 
   * @param {Object} orderItemBody 
   * @returns {Promise<updateOrderItem>}
   */
  static async updateOrderItem(orderItemId, orderItemBody) {
    const orderItem = await this.getOrderItemByID(orderItemId);
    if (!orderItem) {
      throw new ApiError(status.NOT_FOUND, 'Order Item not found')
    }

    const updateOrderItem = await prisma.orderItem.update({
      where: {
        id: orderItemId,
      },
      data: orderItemBody,
    });

    return updateOrderItem;
  }

  /**
   * Hard delete order item by ID
   * @param {ObjectId} orderItemId 
   * @returns {Promise<hardDeleteOrderItemByID>}
   */
  static async hardDeleteOrderItemByID(orderItemId) {
    return prisma.orderItem.delete({
      where: {
        id: orderItemId,
      },
    });
  }
}

export default OrderItemService;
