import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import config from './config.js';
import tokenTypes from './tokens.js';
import { prisma } from '../../lib/prisma.js';
import ApiError from '../utils/ApiError.js';

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new ApiError(400,'Invalid token type');
    }

    const user = await prisma.user.findFirst({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      return done(null, false);
    }
    done(null, user)
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

export default jwtStrategy;
