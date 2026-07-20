import { prisma } from '../../lib/prisma.js';
import { status } from 'http-status';
import ApiError from '../utils/ApiError.js';
import getPagination from '../utils/pagination.js';

class ProductService {
  /**
   * Create a product
   * @param {Object} productBody
   * @returns {Promise<Product>}
   */
  static async createProduct(productBody) {
    return await prisma.product.create({
      data: productBody,
    });
  }

  /**
   * Query for products
   * @returns {Promise<QueryResult>}
   */
  static async queryProducts(page, size) {
    const { skip, take, page: currentPage, size: pageSize } = getPagination(page, size);

    const [products, totalData] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
        },
        skip,
        take,
      }),
      prisma.product.count({
        where: {
          isActive: true,
        }
      })
    ]);

    return {
      data:products,
      pagination: {
        page: currentPage,
        size: pageSize,
        totalData,
        totalPage: Math.ceil(totalData/pageSize)
      }
    }
  }

  /**
   * Get product by ID
   * @param {ObjectId} id
   * @returns {Promise<Category>}
   */
  static async getProductByID(productId) {
    return await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
      },
    });
  }

  /**
   * Get product by User ID
   * @param {ObjectId} userId
   * @returns {Promise<Product>}
   */
  static async getProductByUser(userId) {
    return await prisma.product.findMany({
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
   * Get product by Category
   * @param {String} category
   * @returns {Promise<categories>}
   */
  static async getProductByCategory(category) {
    return await prisma.product.findMany({
      where: {
        isActive: true,
        category: {
          name: {
            contains: category,
          },
        },
      },
      include: {
        category: true,
      },
    });
  }

  /**
   * Update product by ID
   * @param {ObjectId} productId
   * @param {Object} updateBody
   * @returns {Promise<updateCategory>}
   */
  static async updateProduct(productId, updateBody) {
    const product = await this.getProductByID(productId);
    if (!product) {
      throw new ApiError(status.NOT_FOUND, 'Product not found');
    }

    const updateProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: updateBody,
    });

    return updateProduct;
  }

  /**
   * Hard delete product by ID
   * @param {ObjectId} productId
   * @returns {Promise<hardDeleteProduct>}
   */
  static async hardDeleteProductById(productId) {
    const product = await this.getProductByID(productId);
    if (!product) {
      throw new ApiError(status.NOT_FOUND, 'Product not found');
    }

    return prisma.product.delete({
      where: {
        id: productId,
      },
    });
  }

  /**
   * Soft delete product by ID
   * @param {ObjectId} productId
   * @returns {Promise<softDeleteProduct>}
   */
  static async softDeleteProduct(productId) {
    const product = await this.getProductByID(productId);
    if (!product) {
      throw new ApiError(status.NOT_FOUND, 'Product not found');
    }

    return prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }
}

export default ProductService;
