import jwt from 'jsonwebtoken';
import moment from 'moment';
import config from '../config/config.js';
import tokenTypes from '../config/tokens.js';
import { prisma } from '../../lib/prisma.js';
import ApiError from '../utils/ApiError.js';

class TokenService {
  /**
   * Generate token
   * @param {ObjectId} userId
   * @param {moment} expires
   * @param {string} type
   * @param {string} [secret]
   * @returns {string}
   */
  static generateToken(userId, expires, type, secret = config.jwt.secret) {
    const payload = {
      sub: userId,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
    };
    return jwt.sign(payload, secret);
  }

  /**
   * Save a token
   * @param {string} token
   * @param {ObjectId} userId
   * @param {moment} expires
   * @param {string} type
   * @param {boolean} [blackedList]
   * @returns {Promise<Token>}
   */
  static async saveToken(token, userId, expires, type, blackedList = false) {
    const tokenDoc = await prisma.token.create({
      data: {
        token,
        userId: userId,
        expires: expires.toDate(),
        type,
        blackedList,
      },
    });
    return tokenDoc;
  }

  /**
   * Verify token and return token doc (or throw an error if it is not valid)
   * @param {string} token
   * @param {string} type
   * @returns {Promise<Token>}
   */
  static async verifyToken(token, type) {
    const payload = jwt.verify(token, config.jwt.secret);
    const tokenDoc = await prisma.token.findFirst({
      where: {
        token,
        type,
        userId: payload.sub,
        blackedList: false,
      },
    });

    if (!tokenDoc) {
      throw new ApiError(400,'Token not found');
    }

    return tokenDoc;
  }

  /**
   * Generate auth tokens
   * @param {User} user
   * @returns {Promise<Object>}
   */
  static async generateAuthTokens(user) {
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = this.generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = this.generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
    await this.saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

    return {
      access: {
        accessToken,
        expires: accessTokenExpires.toDate(),
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toDate(),
      },
    };
  }
}

export default TokenService;
