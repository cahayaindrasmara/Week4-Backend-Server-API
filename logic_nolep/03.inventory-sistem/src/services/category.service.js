import { prisma } from '../../lib/prisma.js';
import {status} from 'http-status';
import ApiError from '../utils/ApiError.js';

class CategoryService {
  /**
   * Create a category
   * @param {Object} categoryBody
   * @returns {Promise<Category>}
   */
  static async createCategory(categoryBody) {
    return prisma.category.create({ 
      data: categoryBody
     });
  }

  /**
   * Query for categorys
   * @returns {Promise<categorys>}
   */
  static async queryCategorys() {
    const categorys = await prisma.category.findMany({
      where: {
        isActive: true
      }
    });

    return categorys;
  }

  /**
   * Get category by ID
   * @param {ObjectId} id
   * @returns {Promise<Category>}
   */
  static async getCategoryById(id) {
    return prisma.category.findFirst({
      where: {
        id: id,
        isActive: true,
      },
    });
  }

  /**
   * Update category by ID
   * @param {ObjectId} categoryId
   * @param {Object} updateBody
   * @returns {Promise<updateCategory>}
   */
  static async updateCategoryById(categoryId, updateBody) {
    const category = await this.getCategoryById(categoryId);
    if (!category) {
      throw new ApiError(status.NOT_FOUND, 'Category not found')
    }

    const updateCategory = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: updateBody,
    });

    return updateCategory;
  }

  /**
   * Hard delete category by ID
   * @param {ObjectId} getCategoryByID
   * @returns {Promise<hardDeleteCategory>}
   */
  static async hardDeleteCategoryById(categoryId) {
    const category = await this.getCategoryById(categoryId);
    if (!category) {
      throw new ApiError(status.NOT_FOUND, 'Category not found')
    }

    const hardDeleteCategory =  await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    return hardDeleteCategory;
  }

  /**
   * Soft delete category by ID
   * @param {ObjectId} getCategoryByID
   * @returns {Promise<softDeleteCategory>}
   */
  static async softDeleteCategoryById(categoryId) {
    const category = await this.getCategoryById(categoryId);
    if (!category) {
      throw new ApiError(status.NOT_FOUND, 'Category not found')
    }

    const softDeleteCategory =  await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

  return softDeleteCategory;
  }
}

export default CategoryService;
