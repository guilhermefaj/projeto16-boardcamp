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
};

export async function postCustomer(req, res) {
    const { name, phone, cpf, birthday } = req.body;

    try {
        const existingCpf = await db.query(`SELECT cpf FROM customers WHERE cpf = $1;`, [cpf]);

        if (existingCpf.rowCount > 0) {
            return res.status(400).send(`Esse CPF já foi cadastrado.`)
        }

        await db.query(`
        INSERT INTO customers
        (name, phone, cpf, birthday)
        VALUES ($1, $2, $3, $4);
        `, [name, phone, cpf, birthday]);
        res.status(201).send(`Consumidor cadastrado!`)
    } catch (err) {
        res.status(500).send(err.message);
    }
};