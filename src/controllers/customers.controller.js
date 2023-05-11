import { db } from "../database/database.connection.js"

export async function getCustormers(req, res) {
    try {
        const customers = await db.query(`SELECT * FROM customers;`)
        res.send(customers.rows)
    } catch (err) {
        res.status(500).send(err.message);
    }
};

export async function getCustomerById(req, res) {
    const { id } = req.params

    try {
        const customer = await db.query(`
        SELECT * FROM customers
        WHERE id=$1
        `, [id])

        if (customer.rowCount === 0) {
            return res.status(404).send(`Não conseguimos localizar um consumidor com o id ${id}.`)
        }

        res.send(customer.rows)
    } catch (err) {
        res.status(500).send(err.message);
    }
}