import Joi from "joi";
import crypto from "crypto";
import { account } from "models";
import { generateToken, decodeToken } from "lib/token.js";
import dotenv from "dotenv";

dotenv.config();

export const Login = async (ctx) => {
  const LoginInput = Joi.object().keys({
    id: Joi.string().alphanum().min(5).max(20).required(),
    password: Joi.string().min(5).max(20).required(),
  });

  const Result = Joi.validate(ctx.request.body, LoginInput);

  if (Result.error) {
    console.log(`Login - Joi 형식 에러`);
    ctx.status = 400;
    ctx.body = {
      error: "001",
    };
    return;
  }

  const founded = await account.findOne({
    where: {
      id: ctx.request.body.id,
    },
  });

  if (founded == null) {
    console.log(
      `Login - 존재하지 않는 계정입니다. / 입력된 아이디 : ${ctx.request.body.id}`
    );
    ctx.status = 400;
    ctx.body = {
      msg: "아이디나 비밀번호를 확인해 주세요.",
    };
    return;
  }

  const input = crypto
    .createHmac("sha256", process.env.Password_KEY)
    .update(ctx.request.body.password)
    .digest("hex");

  if (founded.password != input) {
    console.log(`Login - 비밀번호를 틀렸습니다.`);
    ctx.status = 400;
    ctx.body = {
      msg: "아이디나 비밀번호를 확인해 주세요.",
    };
    return;
  }

  const payload = {
    user_code: founded.user_code,
  };

  let token = null;
  token = await generateToken(payload);

  console.log(token);

  ctx.body = {
    token: token,
  };

  console.log(`로그인에 성공하였습니다.`);
};

export const Register = async (ctx) => {
  const Registeration = Joi.object().keys({
    id: Joi.string().alphanum().min(5).max(20).required(),
    password: Joi.string().min(8).max(20).required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().length(11).required(),
  });

  const result = Joi.validate(ctx.request.body, Registeration);

  if (result.error) {
    console.log("Register - Joi 형식 에러");
    ctx.status = 400;
    ctx.body = {
      error: "001",
    };
    return;
  }

  const existId = await account.findOne({
    where: {
      id: ctx.request.body.id,
    },
  });

  if (existId != null) {
    console.log(
      `Register - 이미 존재하는 아이디입니다. / 입력된 아이디 : ${ctx.request.body.id}`
    );

    ctx.status = 400;
    ctx.body = {
      msg: "이미 존재하는 아이디입니다.",
    };
    return;
  }

  const existEmail = await account.findOne({
    where: {
      email: ctx.request.body.email,
    },
  });

  if (existEmail != null) {
    console.log(
      `Register - 이미 가입된 이메일입니다. / 입력된 이메일 : ${ctx.request.body.email}`
    );

    ctx.status = 400;
    ctx.body = {
      msg: "이미 존재하는 이메일입니다.",
    };
    return;
  }

  const existPhone = await account.findOne({
    where: {
      phone: ctx.request.body.phone,
    },
  });

  if (existPhone != null) {
    console.log(
      `Register - 이미 가입된 전화번호입니다. / 입력된 번호 : ${ctx.request.body.phone}`
    );

    ctx.status = 400;
    ctx.body = {
      error: "이미 가입된 전화번호입니다.",
    };
    return;
  }

  const password = crypto
    .createHmac("sha256", process.env.Password_KEY)
    .update(ctx.request.body.password)
    .digest("hex");

  await account.create({
    id: ctx.request.body.id,
    password: password,
    name: ctx.request.body.name,
    email: ctx.request.body.email,
    phone: ctx.request.body.phone,
  });

  console.log(
    `Register - 새로운 회원이 저장되었습니다. / 아이디 : ${ctx.request.body.id}`
  );

  ctx.status = 200;
};

export const UserInfo = async (ctx) => {
  const user = await decodeToken(ctx.header.token);

  if (user == null) {
    console.log(`UserInfo - 올바르지 않은 토큰입니다.`);
    ctx.status = 400;
    ctx.body = {
      error: "009",
    };
    return;
  }

  //유저 정보 받아오기
  const founded = await account.findOne({
    where: {
      user_code: user.user_code,
    },
  });

  if (founded == null) {
    console.log(`UserInfo - 존재하지 않는 계정입니다.`);
    ctx.status = 400;
    ctx.body = {
      error: "005",
    };
    return;
  }

  console.log(`UserInfo - 유저 정보를 반환하였습니다.`);

  ctx.status = 200;
  ctx.body = {
    name: founded.name,
    email: founded.email,
    phone: founded.phone,
    credit: founded.credit,
    electricity: founded.electricity,
  };
};
