import CategoryService from '../services/category.service.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsyncs.js';
import { status } from 'http-status';

class CategoryController {
  static createCategory = catchAsync(async (req, res) => {
    const category = await CategoryService.createCategory(req.body);

    res.status(status.CREATED).send({
      status: status.CREATED,
      message: 'Create Category Success',
      data: category,
    });
  });

  static getCategorys = catchAsync(async (req, res) => {
    const categorys = await CategoryService.queryCategorys();

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get Categorys Success',
      data: categorys,
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
    const category = await CategoryService.updateCategoryById(req.params.categoryId, req.body);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Update Category Success',
      data: category,
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
