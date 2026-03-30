import * as dotenv from 'dotenv';
dotenv.config();

export const testData = {
  validUser: {
    email: process.env.VALID_EMAIL!,
    password: process.env.VALID_PASSWORD!,
  },
  invalidUser: {
    email: process.env.INVALID_EMAIL!,
    password: process.env.INVALID_PASSWORD!,
  },
  newUser: {
    password: process.env.NEW_USER_PASSWORD!,
  },
};
