import { prisma } from '../../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import {status} from 'http-status';

class OrderService {
  /**
   * Create a order
   * @param {Object} orderBody 
   * @returns  {Promise<Order>}
   */
  static async createOrder(orderBody) {
    return prisma.order.create({ 
      data: orderBody
     });
  }

  /**
   * Query for orders
   * @returns {Promise<orders>}
   */
  static async queryOrders() {
    const orders =  await prisma.order.findMany({
      where: {
        isActive: true,
      },
    });

    return orders;
  }

  /**
   * Get category by ID
   * @param {ObjectId} orderId 
   * @returns {Promise<Order>}
   */
  static async getOrderByID(orderId) {
    return prisma.order.findFirst({
      where: {
        id: orderId,
        isActive: true,
      },
    });
  }

  /**
   * Get order by User ID
   * @param {ObjectId} userId 
   * @returns {Promise<Order>}
   */
  static async getOrderByUser(userId) {
    return prisma.order.findMany({
      where: {
        userId: userId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * 
   * @param {ObjectId} orderId 
   * @param {Object} orderBody 
   * @returns {Promise<updateOrder>}
   */
  static async updateOrderById(orderId, orderBody) {
    const order = await this.getOrderByID(orderId);
    if (!order) {
      throw new ApiError(status.NOT_FOUND, 'Order not found')
    }

    const updateOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: orderBody,
    });

    return updateOrder;
  }

  /**
   * Hard delete order by ID
   * @param {ObjectId} orderId 
   * @returns {Promise<hardDeleteOrder>}
   */
  static async hardDeleteOrderById(orderId) {
    const order = await this.getOrderByID(orderId);
    if (!order) {
      throw new ApiError(status.NOT_FOUND, 'Order not found')
    }

    const hardDeleteOrder =  await prisma.order.delete({
      where: {
        id: orderId,
      },
    });

    return hardDeleteOrder;
  }

  /**
   * Soft delete order by ID
   * @param {ObjectId} orderId 
   * @returns {Promise<softDeleteOrder>}
   */
  static async softDeleteOrderById(orderId) {
    const order = await this.getOrderByID(orderId);
    if (!order) {
      throw new ApiError(status.NOT_FOUND, 'Order not found')
    }

    const softDeleteOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return softDeleteOrder;
  }
}

export default OrderService;
