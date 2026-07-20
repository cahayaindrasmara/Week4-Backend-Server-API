import { prisma } from '../../lib/prisma.js';
import status from 'http-status';
import ApiError from '../utils/ApiError.js';
import bcrypt from 'bcryptjs';
import getPagination from '../utils/pagination.js';

class UserService {
  /**
   * Create a user
   * @param {Object} userBody
   * @returns {Promise<User>}
   */
  static async createUser(userBody) {
    userBody.password = await bcrypt.hash(userBody.password, 10);
    return prisma.user.create({
      data: userBody,
    });
  }

  /**
   * Get user by email
   * @param {string} email
   * @returns {Promise<User>}
   */
  static async getUserByEmail(email) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  /**
   * Query for users
   * @returns {Promise<Users>}
   */
  static async queryUsers(page, size) {
    const {skip, take, page: currentPage, size: pageSize} = getPagination(page, size);

    const [users, totalData] = await Promise.all([
      prisma.user.findMany({
        where: {
          isActive: true,
        },
        skip,
        take,
      }),
      prisma.user.count({
        where: {
          isActive: true,
        }
      })
    ])

    return {
      data: users,
      pagination: {
        page: currentPage,
        size: pageSize,
        totalData,
        totalPage: Math.ceil(totalData/pageSize)
      }
    }
  }

  /**
   * Get user by ID
   * @param {ObjectId} userId
   * @returns {Promise<User>}
   */
  static async getUserById(userId) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
      },
    });
  }

  /**
   * Update user by ID
   * @param {ObjectId} userId
   * @param {Object} userBody
   * @returns {Promise<updateUser>}
   */
  static async updateUserById(userId, userBody) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }

    userBody.password = await bcrypt.hash(userBody.password, 10);

    const updateUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: userBody,
    });

    return updateUser;
  }

  /**
   * Hard delete user by ID
   * @param {ObjectId} userId
   * @returns {Promise<User>}
   */
  static async hardDeleteUserById(userId) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }

    return prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

  /**
   * Soft delelte user by ID
   * @param {ObjectId} userId
   * @returns {Promise<User>}
   */
  static async softDeleteUserById(userId) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }

    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }
}

export default UserService;
