import { status } from 'http-status';
import UserService from './user.service.js';
import ApiError from '../utils/ApiError.js';
import bcrypt from 'bcryptjs';

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await UserService.getUserByEmail(email);

  if (!user) {
    throw new ApiError(status.UNAUTHORIZED, 'Incorrect email or password');
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new ApiError(status.UNAUTHORIZED, 'Incorrect email or password');
  }

  return user;
};

export default { loginUserWithEmailAndPassword };
