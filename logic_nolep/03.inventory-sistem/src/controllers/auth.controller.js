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

  const userResponse = {
    id: userCreated.id,
    name: userCreated.name,
    email: userCreated.email,
    role: userCreated.role,
    isActive: userCreated.isActive
  }

  res.status(status.CREATED).send({ userResponse, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await TokenService.generateAuthTokens(user);

  const userResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  }

  res.send({ userResponse, tokens });
});

export default {
  register,
  login,
};
