import CategoryService from '../services/category.service.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsyncs.js';
import { status } from 'http-status';

class CategoryController {
  static createCategory = catchAsync(async (req, res) => {
    const existingCategory = await CategoryService.getCategoryByName(req.body.name)

    if (existingCategory) {
      throw new ApiError(status.BAD_REQUEST, 'Category already taken');
    }

    const category = await CategoryService.createCategory(req.body);

    const categoryResponse = {
      id: category.id,
      name: category.name,
      isActive: category.isActive
    }

    res.status(status.CREATED).send({
      status: status.CREATED,
      message: 'Create Category Success',
      data: categoryResponse,
    });
  });

  static getCategories = catchAsync(async (req, res) => {
    const {page, size} = req.query;

    const categories = await CategoryService.queryCategorys(page, size);

    const categoriesResponse = categories.data.map(category => ({
      id: category.id,
      name: category.name,
      isActive: category.isActive
    }))

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get Categories Success',
      data: categoriesResponse,
      pagination: categories.pagination,
    });
  });

  static getCategory = catchAsync(async (req, res) => {
    const category = await CategoryService.getCategoryById(req.params.categoryId);
    if (!category) {
      throw new ApiError(status.NOT_FOUND, 'Category not found');
    }

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get Category Success',
      data: category,
    });
  });

  static updateCategory = catchAsync(async (req, res) => {
    const existingCategory = await CategoryService.getCategoryByName(req.body.name)

    if (existingCategory) {
      throw new ApiError(status.BAD_REQUEST, 'Category already taken');
    }
    
    const category = await CategoryService.updateCategoryById(req.params.categoryId, req.body);

    const categoryResponse = {
      id: category.id,
      name: category.name,
      isActive: category.isActive
    }

    res.status(status.OK).send({
      status: status.OK,
      message: 'Update Category Success',
      data: categoryResponse,
    });
  });

  static hardDeleteCategory = catchAsync(async (req, res) => {
    await CategoryService.hardDeleteCategoryById(req.params.categoryId);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Hard Delete Category Success',
      data: null,
    });
  });

  static softDeleteCategory = catchAsync(async (req, res) => {
    await CategoryService.softDeleteCategoryById(req.params.categoryId);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Soft Delete Category Success',
      data: null,
    });
  });
}

export default CategoryController;
