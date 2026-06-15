import UserService from '../services/user.service.js';
import catchAsync from '../utils/catchAsyncs.js';
import {status} from 'http-status';
import ApiError from '../utils/ApiError.js';

class UserController {
  static createUser = catchAsync(async (req, res) => {
    const user = await UserService.createUser(req.body);

    res.status(status.CREATED).send({
      status: status.CREATED,
      message: "Create User Success",
      data: user
    });
  });

  static getUsers = catchAsync(async (req, res) => {
    const users = await UserService.queryUsers();

    res.status(status.OK).send({
      status: status.OK,
      message: "Get Users Success",
      data: users
    });
  });

  static getUserById = catchAsync(async (req, res) => {
    const user = await UserService.getUserById(req.params.userId);
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'User not found')
    }

    res.status(status.OK).send({
      status: status.OK,
      message: "Get User by ID Success",
      data: user
    });
  });

  static updateUser = catchAsync(async (req, res) => {
    const user = await UserService.updateUserById(req.params.userId, req.body);

    res.status(status.OK).send({
      status: status.OK,
      message: "Update User Success",
      data: user
    });
  });

  static hardDeleteUser = catchAsync(async (req, res) => {
    await UserService.hardDeleteUserById(req.params.userId);

    res.status(status.OK).send({
      status: status.OK,
      message: "Hard Delete User Success",
      data: null
    });
  });

  static softDeleteUser = catchAsync(async (req, res) => {
    await UserService.softDeleteUserById(req.params.userId);

    res.status(status.OK).send({
      status: status.OK,
      message: "Soft Delete User Success",
      data: null
    });
  })
}

export default UserController;
