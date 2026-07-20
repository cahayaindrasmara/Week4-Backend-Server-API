import status from 'http-status';
import ApiError from '../utils/ApiError.js';

const authorization = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(status.FORBIDDEN, 'You are not authorized'));
    }

    next();
  };
};

export default authorization;
