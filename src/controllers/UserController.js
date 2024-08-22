const { hash, compare } = require("bcryptjs")

const AppError = require("../utils/AppError");
const sqliteConnection = require("../database/sqlite");

class UserController {
    async create(request, response) {
        const { name, email, password } = request.body;

        const database = await sqliteConnection();

        /* Lidando com usuários existentes ou não. */
        const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email]);     
        if (checkUserExists) {
            /* Lidando com exceções */
            throw new AppError("Este e-mail já está em uso.");
        };

        /* Criptografando senhas de usuários. */
        const hashedPassword = await hash(password, 8);

        await database.run("INSERT INTO users (name, email, password) VALUES (?, ? ,?)",
            [name, email, hashedPassword]);

        return response.status(201).json();
    }

    async update(request, response) {
        const { name, email, password, old_password } = request.body;
        const { id } = request.params;

        const database = await sqliteConnection();
        const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

        /* Tratando exceções. */
        if (!user) {
            throw new AppError("Usuário não encontrado.");
        };

        /* Lidando com UPDATES de emails */
        const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

        if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError("Este e-mail já pertence a outro usuário.")
        };

        /* Atualizando os novos valores, caso não haja modificações permanecerá os valores antigos. */
        user.name = name ?? user.name;
        user.email = email ?? user.email;

        /* Controle de segurança para alterações de senhas. */
        if (password && !old_password) {
            throw new AppError("Você precisa informar a senha antiga.")
        };

        if (password && old_password) {
            const checkOldPassword = await compare(old_password, user.password);

            if (!checkOldPassword) {
                throw new AppError("A senha antiga não confere");
            };

            user.password = await hash(password, 8);
        };

        await database.run(
            `UPDATE users SET
            name = ?,
            email = ?,
            password = ?,
            updated_at = DATETIME('now')
            WHERE id = ?`,
            [user.name, user.email, user.password, id]
        );

        return response.json();
    }
};

module.exports = UserController;