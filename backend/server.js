const express = require("express");
const cors = require("cors");

const app = express();
const router = express.Router();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let nextId = 4;
let nextRentalId = 1;

function createPoster(title, color) {
  const safeTitle = String(title).slice(0, 22);
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="128" viewBox="0 0 96 128">' +
    '<rect width="96" height="128" fill="' + color + '"/>' +
    '<circle cx="72" cy="24" r="16" fill="rgba(255,255,255,0.25)"/>' +
    '<rect x="14" y="76" width="68" height="8" rx="4" fill="rgba(255,255,255,0.75)"/>' +
    '<rect x="14" y="91" width="42" height="6" rx="3" fill="rgba(255,255,255,0.55)"/>' +
    '<text x="14" y="54" fill="white" font-size="13" font-family="Arial" font-weight="700">' +
    safeTitle +
    "</text>" +
    "</svg>";

  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

let movies = [
  {
    id: 1,
    title: "Matrix",
    year: 1999,
    genre: "Ciencia ficcion",
    imageUrl: createPoster("Matrix", "#14532d")
  },
  {
    id: 2,
    title: "Toy Story",
    year: 1995,
    genre: "Animacion",
    imageUrl: createPoster("Toy Story", "#c2410c")
  },
  {
    id: 3,
    title: "Origen",
    year: 2010,
    genre: "Suspense",
    imageUrl: createPoster("Origen", "#1e3a8a")
  }
];

const users = [
  { id: 1, email: "user1@gmail.com", password: "pass", role: "user" },
  { id: 2, email: "admin@gmail.com", password: "admin", role: "admin" },
  { id: 3, email: "user2@gmail.com", password: "pass2", role: "user" }
];

let rentals = [];

function isValidMovie(movie) {
  return (
    movie &&
    typeof movie.title === "string" &&
    movie.title.trim() !== "" &&
    Number.isInteger(Number(movie.year)) &&
    typeof movie.genre === "string" &&
    movie.genre.trim() !== ""
  );
}

function normalizeMovie(movie, id) {
  return {
    title: movie.title.trim(),
    year: Number(movie.year),
    genre: movie.genre.trim(),
    imageUrl: movie.imageUrl || createPoster(movie.title.trim(), getPosterColor(id))
  };
}

function getPosterColor(id) {
  const colors = ["#0f766e", "#7c2d12", "#334155", "#4338ca", "#be123c", "#166534"];
  return colors[id % colors.length];
}

function findMovieById(id) {
  return movies.find(function (movie) {
    return movie.id === id;
  });
}

function findUserById(id) {
  return users.find(function (user) {
    return user.id === id;
  });
}

function getRequestUser(req) {
  return findUserById(Number(req.header("x-user-id")));
}

function isAdminRequest(req) {
  const user = getRequestUser(req);
  return Boolean(user && user.role === "admin");
}

function requireAdmin(req, res) {
  if (!isAdminRequest(req)) {
    res.status(403).json({ message: "Solo el administrador puede realizar esta accion" });
    return false;
  }

  return true;
}

function buildRentalResponse(rental) {
  const user = findUserById(rental.userId);

  return {
    id: rental.id,
    userId: rental.userId,
    userEmail: user ? user.email : "Usuario eliminado",
    movie: findMovieById(rental.movieId)
  };
}

router.get("/", function (_req, res) {
  res.json({ message: "API de peliculas funcionando" });
});

router.post("/login", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const user = users.find(function (item) {
    return item.email === email && item.password === password;
  });

  if (!user) {
    res.status(401).json({ message: "Credenciales no validas" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    role: user.role
  });
});

router.get("/movies", function (_req, res) {
  res.json(movies);
});

router.get("/movies/available", function (_req, res) {
  const rentedMovieIds = rentals.map(function (rental) {
    return rental.movieId;
  });

  const availableMovies = movies.filter(function (movie) {
    return !rentedMovieIds.includes(movie.id);
  });

  res.json(availableMovies);
});

router.get("/movies/:id", function (req, res) {
  const id = Number(req.params.id);
  const movie = findMovieById(id);

  if (!movie) {
    res.status(404).json({ message: "Pelicula no encontrada" });
    return;
  }

  res.json(movie);
});

router.post("/movies", function (req, res) {
  if (!requireAdmin(req, res)) {
    return;
  }

  if (!isValidMovie(req.body)) {
    res.status(400).json({ message: "Datos de pelicula no validos" });
    return;
  }

  const cleanMovie = normalizeMovie(req.body, nextId);
  const newMovie = {
    id: nextId,
    title: cleanMovie.title,
    year: cleanMovie.year,
    genre: cleanMovie.genre,
    imageUrl: cleanMovie.imageUrl
  };

  nextId += 1;
  movies.push(newMovie);

  res.status(201).json(newMovie);
});

router.put("/movies/:id", function (req, res) {
  if (!requireAdmin(req, res)) {
    return;
  }

  const id = Number(req.params.id);
  const index = movies.findIndex(function (item) {
    return item.id === id;
  });

  if (index === -1) {
    res.status(404).json({ message: "Pelicula no encontrada" });
    return;
  }

  if (!isValidMovie(req.body)) {
    res.status(400).json({ message: "Datos de pelicula no validos" });
    return;
  }

  const cleanMovie = normalizeMovie(
    {
      title: req.body.title,
      year: req.body.year,
      genre: req.body.genre,
      imageUrl: movies[index].imageUrl
    },
    id
  );

  const updatedMovie = {
    id: id,
    title: cleanMovie.title,
    year: cleanMovie.year,
    genre: cleanMovie.genre,
    imageUrl: cleanMovie.imageUrl
  };

  movies[index] = updatedMovie;

  res.json(updatedMovie);
});

router.delete("/movies/:id", function (req, res) {
  if (!requireAdmin(req, res)) {
    return;
  }

  const id = Number(req.params.id);
  const originalLength = movies.length;

  movies = movies.filter(function (item) {
    return item.id !== id;
  });

  if (movies.length === originalLength) {
    res.status(404).json({ message: "Pelicula no encontrada" });
    return;
  }

  rentals = rentals.filter(function (rental) {
    return rental.movieId !== id;
  });

  res.status(204).send();
});

router.post("/rentals", function (req, res) {
  const userId = Number(req.body.userId);
  const movieId = Number(req.body.movieId);
  const user = findUserById(userId);
  const movie = findMovieById(movieId);
  const existingRental = rentals.find(function (rental) {
    return rental.movieId === movieId;
  });

  if (!user) {
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }

  if (user.role !== "user") {
    res.status(403).json({ message: "El administrador no puede alquilar peliculas" });
    return;
  }

  if (!movie) {
    res.status(404).json({ message: "Pelicula no encontrada" });
    return;
  }

  if (existingRental) {
    res.status(409).json({ message: "La pelicula ya esta alquilada" });
    return;
  }

  const newRental = {
    id: nextRentalId,
    userId: userId,
    movieId: movieId
  };

  nextRentalId += 1;
  rentals.push(newRental);

  res.status(201).json(buildRentalResponse(newRental));
});

router.get("/rentals", function (req, res) {
  if (!requireAdmin(req, res)) {
    return;
  }

  const rentalList = rentals
    .map(buildRentalResponse)
    .filter(function (rental) {
      return Boolean(rental.movie);
    });

  res.json(rentalList);
});

router.get("/rentals/user/:userId", function (req, res) {
  const userId = Number(req.params.userId);
  const user = findUserById(userId);

  if (!user) {
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }

  const userRentals = rentals
    .filter(function (rental) {
      return rental.userId === userId;
    })
    .map(buildRentalResponse)
    .filter(function (rental) {
      return Boolean(rental.movie);
    });

  res.json(userRentals);
});

app.use("/", router);
app.use("/api", router);

if (require.main === module) {
  app.listen(PORT, function () {
    console.log("Servidor escuchando en http://localhost:" + PORT);
  });
}

module.exports = app;
