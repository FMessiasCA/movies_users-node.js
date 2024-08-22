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

    async show(request, response) {
        const { id } = request.params;

        const movieNote = await knex("movieNotes").where({ id }).first();
        const movieTags = await knex("movieTags").where({ movieNote_id: id }).orderBy("name");

        return response.json({
            ...movieNote,
            movieTags
        });
    }

    async delete(request, response) {
        const { id } = request.params;

        await knex("movieNotes").where({ id }).delete();

        return response.json();
    }

    async index(request, response) {
        const { title, user_id, movieTags } = request.query;

        let movieNotes;

        if ( movieTags ) {
            const filterTags = movieTags.split(',').map( tag => tag.trim());

            movieNotes = await knex("movieTags").whereIn("name", filterTags);

        } else {
            movieNotes = await knex("movieNotes").where({ user_id }).whereLike("title", `%${title}%`).orderBy("title");
        }


        return response.json(movieNotes);
    }
};

module.exports = NotesController;