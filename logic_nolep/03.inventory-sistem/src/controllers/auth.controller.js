import { status } from 'http-status';
import catchAsync from '../utils/catchAsyncs.js';
import { authService, UserService, TokenService } from '../services/index.js';
import ApiError from '../utils/ApiError.js';

const register = catchAsync(async (req, res) => {
  const existingUser = await UserService.getUserByEmail(req.body.email);

  if (existingUser) {
    throw new ApiError(status.BAD_REQUEST, 'Email already taken');
  }
  const userCreated = await UserService.createUser(req.body);
  const tokens = await TokenService.generateAuthTokens(userCreated);
  res.status(status.CREATED).send({ userCreated, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await TokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

export default {
  register,
  login,
};
