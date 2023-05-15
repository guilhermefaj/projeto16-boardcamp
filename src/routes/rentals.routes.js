import { Router } from "express";
import { getRentals, postRentals, returnRental } from "../controllers/rentals.controller.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { rentalSchema, returnRentalSchema } from "../schemas/rentals.schemas.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", getRentals);
rentalsRouter.post("/rentals", validateSchema(rentalSchema), postRentals);
rentalsRouter.post("/rentals/:id/return", validateSchema(returnRentalSchema), returnRental)

export default rentalsRouter;