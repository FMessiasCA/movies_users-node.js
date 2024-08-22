const knex = require("../database/knex");

class NotesController {
    async create(request, response) {
        const { title, description, tags, rating } = request.body;
        const { user_id } = request.params;

        const [movieNote_id] = await knex("movieNotes").insert({
            title,
            description,
            rating,
            user_id
        });

        const tagsInsert = tags.map(name => {
            return {
                movieNote_id,
                name,
                user_id
            }
        });

        await knex("movieTags").insert(tagsInsert);

        response.json();
    }
};

module.exports = NotesController;