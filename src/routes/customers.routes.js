import { Router } from "express";
import { getCustomerById, getCustormers } from "../controllers/customers.controller.js";

const customersRouter = Router();

customersRouter.get("/customers", getCustormers);
customersRouter.get("/customers/:id", getCustomerById);

export default customersRouter;