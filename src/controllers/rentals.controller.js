import { db } from "../database/database.connection.js";

export async function getRentals(req, res) {
    try {
        const rentalsResult = await db.query(`
        SELECT rentals.id, rentals."customerId", rentals."gameId", rentals."rentDate", rentals."daysRented",
               rentals."returnDate", rentals."originalPrice", rentals."delayFee", customers.name AS customer,
               games.name AS game
        FROM rentals
        INNER JOIN customers ON rentals."customerId" = customers.id
        INNER JOIN games ON rentals."gameId" = games.id;
      `);

        const rentals = rentalsResult.rows.map((rental) => ({
            id: rental.id,
            customerId: rental.customerId,
            gameId: rental.gameId,
            rentDate: new Date(rental.rentDate).toJSON().split('T')[0],
            daysRented: rental.daysRented,
            returnDate: rental.returnDate,
            originalPrice: rental.originalPrice,
            delayFee: rental.delayFee,
            customer: {
                id: rental.customerId,
                name: rental.customer
            },
            game: {
                id: rental.gameId,
                name: rental.game
            }
        }));

        res.send(rentals);
    } catch (err) {
        res.status(500).send(err.message);
    }
};


export async function postRentals(req, res) {
    const { customerId, gameId, daysRented } = req.body;

    try {
        if (!Number.isInteger(parseInt(customerId)) || !Number.isInteger(parseInt(gameId)) || !Number.isInteger(parseInt(daysRented))) {
            return res.status(400).send('Insira valores inteiros.');
        }

        const customerQuery = await db.query(`SELECT * FROM customers WHERE id = $1;`, [customerId]);
        if (customerQuery.rowCount === 0) {
            return res.status(400).send(`O cliente não existe.`);
        }

        const games = await db.query(`SELECT * FROM games WHERE id = $1;`, [gameId]);
        if (games.rowCount === 0) {
            return res.status(400).send(`O jogo não existe.`);
        }

        const checkGameStock = await db.query(`
        SELECT * FROM rentals WHERE "gameId"=$1 AND "returnDate" IS NULL;
        `, [gameId]);

        if (checkGameStock.rowCount >= games.rows[0].stockTotal) {
            return res.status(400).send(`Não há mais desse jogo disponível no estoque!`)
        };

        const rentDate = new Date().toISOString().split('T')[0]; // Data atual
        const originalPrice = daysRented * games.rows[0].pricePerDay;

        const insertQuery = `
        INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
        VALUES ($1, $2, $3, $4, NULL, $5, NULL);
      `;

        await db.query(insertQuery, [customerId, gameId, rentDate, daysRented, originalPrice]);

        res.status(201).send();
    } catch (err) {
        res.status(500).send(err.message);
    }
}



export async function returnRental(req, res) {
    const rentalId = parseInt(req.params.id);

    try {
        const existingRental = await db.query(`SELECT * FROM rentals WHERE id = $1;`, [rentalId]);
        if (existingRental.rowCount === 0) {
            return res.status(404).send(`O aluguel não foi encontrado.`);
        }

        const rental = existingRental.rows[0];

        if (rental.returnDate !== null) {
            return res.status(400).send(`O aluguel já foi devolvido anteriormente.`);
        }

        const gameId = rental.gameId;

        const gameInfo = await db.query(`SELECT "pricePerDay" FROM games WHERE id = $1;`, [gameId]);
        const pricePerDay = gameInfo.rows[0].pricePerDay;

        const rentDate = new Date(rental.rentDate);
        const returnDate = new Date();
        const daysLate = Math.ceil((returnDate - rentDate) / (1000 * 60 * 60 * 24));
        const delayFee = daysLate > 0 ? daysLate * pricePerDay : 0;

        const updateQuery = `
        UPDATE rentals
        SET "returnDate" = $1, "delayFee" = $2
        WHERE id = $3;
      `;

        await db.query(updateQuery, [returnDate, delayFee, rentalId]);

        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.message);
    }
}


export async function deleteRental(req, res) {
    const rentalId = parseInt(req.params.id);

    try {
        const existingRental = await db.query(`SELECT id, "returnDate" FROM rentals WHERE id = $1;`, [rentalId]);
        if (existingRental.rowCount === 0) {
            return res.status(404).send(`O aluguel não existe.`);
        }

        if (existingRental.rows[0].returnDate !== null) {
            return res.status(400).send(`O aluguel já está finalizado.`);
        }

        await db.query(`DELETE FROM rentals WHERE id = $1;`, [rentalId]);

        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.message);
    }
}

