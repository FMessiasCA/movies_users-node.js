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

        if (movieTags) {
            const filterTags = movieTags.split(',').map(tag => tag.trim());

            movieNotes = await knex("movieTags")
                .select([
                    "movieNotes.id",
                    "movieNotes.title",
                    "movieNotes.user_id"
                ])
                .where("movieNotes.user_id", user_id)
                .whereLike("movieNotes.title", `%${title}%`)
                .whereIn("name", filterTags)
                .innerJoin("movieNotes", "movieNotes.id", "movieTags.movieNote_id")
                .orderBy("movieNotes.title");

        } else {
            movieNotes = await knex("movieNotes")
                .where({ user_id })
                .whereLike("title", `%${title}%`)
                .orderBy("title");
        }

        const userMovieTags = await knex("movieTags").where({ user_id });
        const movieNotesWithTags = movieNotes.map( note => {
            const movieNoteTags = userMovieTags.filter( tag => tag.movieNote_id === note.id);

            return {
                ...note,
                tags: movieNoteTags
            }
        });

        return response.json(movieNotesWithTags);
    }
};

module.exports = NotesController;