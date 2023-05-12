import { Router } from "express";
import { getCustomerById, getCustormers, postCustomer, putCustomer } from "../controllers/customers.controller.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { customerSchema } from "../schemas/customers.schemas.js";

const customersRouter = Router();

customersRouter.get("/customers", getCustormers);
customersRouter.get("/customers/:id", getCustomerById);
customersRouter.post("/customers", validateSchema(customerSchema), postCustomer);
customersRouter.put("/customers/:id", validateSchema(customerSchema), putCustomer);

export default customersRouter;