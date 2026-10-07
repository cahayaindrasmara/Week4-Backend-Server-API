import UserService from '../services/user.service.js';
import catchAsync from '../utils/catchAsyncs.js';
import { status } from 'http-status';
import ApiError from '../utils/ApiError.js';

class UserController {
  static createUser = catchAsync(async (req, res) => {
    const existingUser = await UserService.getUserByEmail(req.body.email)

    if (existingUser) {
      throw new ApiError(status.BAD_REQUEST, 'Email already taken');
    }

    const user = await UserService.createUser(req.body);

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified
    }

    res.status(status.CREATED).send({
      status: status.CREATED,
      message: 'Create User Success',
      data: userResponse,
    });
  });

  static getUsers = catchAsync(async (req, res) => {
    const {page, size} = req.query;

    const users = await UserService.queryUsers(page, size);

    const userResponse = users.data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive
    }));

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get Users Success',
      data: userResponse,
      pagination: users.pagination,
    });
  });

  static getUserById = catchAsync(async (req, res) => {
    const user = await UserService.getUserById(req.params.userId);
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }

    res.status(status.OK).send({
      status: status.OK,
      message: 'Get User by ID Success',
      data: user,
    });
  });

  static updateUser = catchAsync(async (req, res) => {
    const existingUser = await UserService.getUserByEmail(req.body.email)

    if (existingUser) {
      throw new ApiError(status.BAD_REQUEST, 'Email already taken');
    }

    const user = await UserService.updateUserById(req.params.userId, req.body);

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified
    }

    res.status(status.OK).send({
      status: status.OK,
      message: 'Update User Success',
      data: userResponse,
    });
  });

  static hardDeleteUser = catchAsync(async (req, res) => {
    await UserService.hardDeleteUserById(req.params.userId);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Hard Delete User Success',
      data: null,
    });
  });

  static softDeleteUser = catchAsync(async (req, res) => {
    await UserService.softDeleteUserById(req.params.userId);

    res.status(status.OK).send({
      status: status.OK,
      message: 'Soft Delete User Success',
      data: null,
    });
  });
}

export default UserController;
