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

export async function putCustomer(req, res) {
    const { name, phone, cpf, birthday } = req.body;
    const { id } = req.params;

    try {
        const existingCustomerResult = await db.query(`SELECT id, cpf FROM customers WHERE id = $1;`, [id]);

        if (existingCustomerResult.rowCount === 0) {
            return res.status(404).send(`Cliente não encontrado.`);
        }

        const existingCustomer = existingCustomerResult.rows[0];
        const existingCpf = existingCustomer.cpf;

        if (cpf && existingCpf !== cpf) {
            const duplicateCpfResult = await db.query(`SELECT id FROM customers WHERE cpf = $1;`, [cpf]);

            if (duplicateCpfResult.rowCount > 0) {
                return res.status(409).send(`O CPF já pertence a outro cliente.`);
            }
        }

        await db.query(`
            UPDATE customers
            SET name = $1, phone = $2, birthday = $3, cpf = $4
            WHERE id = $5;
        `, [name, phone, birthday, cpf, id])

        res.status(200).send(`Dados do cliente atualizados com sucesso`)
    } catch (err) {
        res.status(500).send(err.message);
    }
};