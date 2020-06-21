const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function isValidID(request, response, next) {
    const { id } = request.params;

    if ( !isUuid(id) ) {
        return response.status(400).json({
            error: 'ID is not valid'
        });
    }

    return next();
}

function findRepositoryIndex(request, response, next) {
    const { id } = request.params;

    const idx = repositories.findIndex(
        r => r.id === id
    );

    if ( idx < 0 ) {
        return response.status(400).json({
            error: "Repository does not found."
        });
    }

    request.idx = idx;

    return next();
}

/*
 * Using middlewares
 */
app.use("/repositories/:id", 
    isValidID, 
    findRepositoryIndex
);

/*
 * Starting routes
 */
app.get("/repositories", (request, response) => {
    return response.json(repositories);
});

app.post("/repositories", (request, response) => {
    const { title, url, techs } = request.body;

    const repository = {
        id: uuid(),
        title,
        url,
        techs,
        likes: 0,
    };

    repositories.push(repository);

    return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
    const { idx } = request;
    const { title, url, techs } = request.body;

    let repository = repositories[idx];

    repository = {
        ...repository, 
        title, 
        url, 
        techs
    };

    repositories[idx] = repository;

    return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
    const { idx } = request;

    repositories.splice(idx, 1);

    return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
    const { idx } = request;

    let repository = repositories[idx];
    const { likes } = repository;

    repository = {
        ...repository,
        likes: (likes + 1)
    };

    repositories[idx] = repository;

    return response.json(repository);
});

module.exports = app;
