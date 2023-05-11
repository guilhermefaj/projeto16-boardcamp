import { db } from "../database/database.connection.js"

export async function getGames(req, res) {
    try {
        const games = await db.query(`SELECT * FROM games;`)
        res.send(games.rows)
    } catch (err) {
        res.status(500).send(err.message);
    }
};

export async function postGames(req, res) {
    const { name, image, stockTotal, pricePerDay } = req.body;

    try {
        const existingGame = await db.query(`SELECT name FROM games WHERE name = $1;`, [name]);

        if (existingGame.rowCount > 0) {
            return res.status(409).send(`Um jogo com o nome ${name} já existe.`)
        }

        await db.query(
            `INSERT INTO games 
            (name, image, "stockTotal", "pricePerDay") 
            VALUES ($1, $2, $3, $4);`,
            [name, image, stockTotal, pricePerDay]
        );
        res.status(201).send(`O jogo ${name} foi inserido ao banco de dados.`)
    } catch (err) {
        res.status(500).send(err.message);
    }
}
