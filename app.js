const express = require('express')

const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndRunServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    console.log('DateBase Initialization success..')
    app.listen(3000, () => {
      console.log('Server is runnig at http://localhost:3000/')
    })
  } catch (r) {
    console.log(`DB Error: ${r.message}`)
    process.exit(1)
  }
}

initializeDBAndRunServer()

// get movies API

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT
      *
    FROM
      movie
  `
  const moviesList = await db.all(getMoviesQuery)
  const convertKeysIntoCamelCase = movie => {
    return {
      movieId: movie.movie_id,
      directorId: movie.director_id,
      movieName: movie.movie_name,
      leadActor: movie.lead_actor,
    }
  }
  response.send(moviesList.map(movie => convertKeysIntoCamelCase(movie)))
})

// Add movie API

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails

  const addMovieQuery = `
      INSERT INTO
        movie(director_id, movie_name, lead_actor)
      VALUES(${directorId}, '${movieName}', '${leadActor}')
    `

  await db.run(addMovieQuery)

  response.send('Movie Successfully Added')
})

// GET movie API

app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params

  const getMovieQuery = `
    SELECT 
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId}
  `

  const movieObject = await db.get(getMovieQuery)
  const getKeysInCamelCase = movieObject => {
    return {
      movieId: movieObject.movie_id,
      directorId: movieObject.director_id,
      movieName: movieObject.movie_name,
      leadActor: movieObject.lead_actor,
    }
  }
  const camelCaseMovieObject = getKeysInCamelCase(movieObject)
  response.send(camelCaseMovieObject)
})

// Update movie API

app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params

  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails

  const updateMovieQuery = `
        UPDATE 
          movie
        SET 
          director_id = ${directorId},
          movie_name = '${movieName}',
          lead_actor = '${leadActor}'
        WHERE
          movie_id = ${movieId}
    `

  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

// Delete movie API

app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params

  const deleteMovieQuery = `
        DELETE FROM
          movie
        WHERE 
          movie_id = ${movieId}
    `
  await db.run(deleteMovieQuery)

  response.send('Movie Removed')
})

// get directors list API

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director
  `
  const directorList = await db.all(getDirectorsQuery)
  const convertKeysIntoCamelCase = directorObj => {
    return {
      directorId: directorObj.director_id,
      directorName: directorObj.director_name,
    }
  }
  response.send(
    directorList.map(directorObj => convertKeysIntoCamelCase(directorObj)),
  )
})

// get list of movies directed by specific director

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params

  const getSpecificDirectorMoviesQuery = `
      SELECT 
        movie_name
      FROM
        movie
      WHERE 
        director_id = ${directorId}
    `

  const moviesList = await db.all(getSpecificDirectorMoviesQuery)

  const getKeysInCamelCase = movieObj => {
    return {
      movieName: movieObj.movie_name,
    }
  }

  response.send(moviesList.map(movieObj => getKeysInCamelCase(movieObj)))
})

module.exports = app
