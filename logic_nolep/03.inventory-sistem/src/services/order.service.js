import { prisma } from '../../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import { status } from 'http-status';

class OrderService {
  /**
   * Create a order
   * @param {Object} orderBody
   * @returns  {Promise<Order>}
   */
  static async createOrder(orderBody) {
    const { items, ...orderData } = orderBody;

    return prisma.$transaction(async (tx) => {
      let totalPrice = 0;

      const orderItems = [];

      // VALIDASI stock data dulu
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: {
            id: item.productId,
          },
        });

        if (!product) {
          throw new ApiError(status.NOT_FOUND, 'Product not found');
        }

        if (product.quantityInStock < item.quantity) {
          throw new ApiError(status.BAD_REQUEST, 'Stock not enough');
        }

        const subtotal = product.price * item.quantity;

        totalPrice += subtotal;

        orderItems.push({
          productId: item.productId,

          quantity: item.quantity,

          unitPrice: product.price,
        });
      }

      // CREATE ORDER
      const order = await tx.order.create({
        data: {
          ...orderData,
          totalPrice,
        },
      });

      // CREATE ORDER ITEMS
      await tx.orderItem.createMany({
        data: orderItems.map((item) => ({
          ...item,
          orderId: order.id,
        })),
      });

      // UPDATE STOCK
      for (const item of items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            quantityInStock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });
  }

  /**
   * Query for orders
   * @returns {Promise<Order[]>}
   */
  static async queryOrders() {
    const orders = await prisma.order.findMany({
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
      throw new ApiError(status.NOT_FOUND, 'Order not found');
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
    return prisma.order.delete({
      where: {
        id: orderId,
      },
    });
  }

  /**
   * Soft delete order by ID
   * @param {ObjectId} orderId
   * @returns {Promise<softDeleteOrder>}
   */
  static async softDeleteOrderById(orderId) {
    const order = await this.getOrderByID(orderId);
    if (!order) {
      throw new ApiError(status.NOT_FOUND, 'Order not found');
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
