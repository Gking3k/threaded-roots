const {
  rateLimit,
} = require("express-rate-limit");


const loginLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 10,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    message: {
      message:
        "Too many login attempts. Please try again later.",
    },
  });


const orderLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 20,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    message: {
      message:
        "Too many order requests. Please try again later.",
    },
  });


const paymentLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 20,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    message: {
      message:
        "Too many payment requests. Please try again later.",
    },
  });


module.exports = {
  loginLimiter,
  orderLimiter,
  paymentLimiter,
};