import ProductService from '../services/product.service.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsyncs.js';
import { status } from 'http-status';

class ProductController {
  static createProduct = catchAsync(async (req, res) => {
    const product = await ProductService.createProduct(req.body);

    res.status(status.CREATED).send({
      status: status.CREATED,
      message: 'Create Product Success',
      data: product,
    });
  });

  static getProducts = catchAsync(async (req, res) => {
    const { category, page, size } = req.query;

    let products;

    if (category) {
      products = await ProductService.getProductByCategory(category);

      res.status(status.OK).send({
        status: status.OK,
        message: `Search Product by ${category} Success`,
        data: products
      })
    } else {
      products = await ProductService.queryProducts(page, size);

      res.status(status.OK).send({
        status: status.OK,
        message: 'Get Products Success',
        data: products.data,
        pagination: products.pagination,
      });
    }
  });

  static getProductByID = catchAsync(async (req, res) => {
    const { productId } = req.params;

    const product = await ProductService.getProductByID(productId);
    if (!product) {
      throw new ApiError(status.NOT_FOUND, 'Product not found');
    }

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get Product by ID Success',
      data: product,
    });
  });

  static getProductByUser = catchAsync(async (req, res) => {
    const { userId } = req.params;

    const product = await ProductService.getProductByUser(userId);
    if (!product) {
      throw new ApiError(status.NOT_FOUND, 'Category not found');
    }

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get Product by User Success',
      data: product,
    });
  });

  static updateProduct = catchAsync(async (req, res) => {
    const product = await ProductService.updateProduct(req.params.productId, req.body);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Update Product Success',
      data: product,
    });
  });

  static hardDeleteProduct = catchAsync(async (req, res) => {
    await ProductService.hardDeleteProductById(req.params.productId);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Hard Delete Product Success',
      data: null,
    });
  });

  static softDeleteProduct = catchAsync(async (req, res) => {
    await ProductService.softDeleteProduct(req.params.productId);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Soft Delete Product Success',
      data: null,
    });
  });
}

export default ProductController;
