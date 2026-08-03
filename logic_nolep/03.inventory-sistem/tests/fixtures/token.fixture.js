import moment from "moment/moment";
import config from "../../src/config/config.js";
import tokenTypes from "../../src/config/tokens.js";
import tokenService from "../../src/services/token.service.js";
import { userOne, admin } from "./user.fixture.js";

const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
const userOneAccessToken = tokenService.generateToken(userOne.id, accessTokenExpires, tokenTypes.ACCESS);
const adminAccessToken = tokenService.generateToken(admin.id, accessTokenExpires, tokenTypes.ACCESS);

export {
    userOneAccessToken,
    adminAccessToken,
}