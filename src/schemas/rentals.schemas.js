import joi from "joi";

export const rentalSchema = joi.object({
    customerId: joi.number().integer().positive().required(),
    gameId: joi.number().integer().positive().required(),
    daysRented: joi.number().integer().positive().required(),
});

export const returnRentalSchema = joi.object({
    id: joi.number().integer().positive().required(),
});