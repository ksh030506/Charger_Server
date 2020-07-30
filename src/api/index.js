import Router from "koa-router";

import auth from "./auth";
import credit from "./credit";
import question from "./question";
import sale from "./sale";
import trade from "./trade";

const api = new Router();

api.use("/auth", auth.routes());
api.use("/credit", credit.routes());
api.use("/question", question.routes());
api.use("/sale", sale.routes());
api.use("/trade", trade.routes());

export default api;
