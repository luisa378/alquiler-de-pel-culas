const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let nextId = 16;
let nextRentalId = 2;

function createPoster(title, color) {
  const titleLines = splitPosterTitle(title);
  const textLines = titleLines
    .map(function (line, index) {
      return (
        '<tspan x="12" dy="' +
        (index === 0 ? "0" : "15") +
        '">' +
        escapeXml(line) +
        "</tspan>"
      );
    })
    .join("");
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="128" viewBox="0 0 96 128">' +
    '<rect width="96" height="128" fill="' + color + '"/>' +
    '<circle cx="72" cy="24" r="16" fill="rgba(255,255,255,0.25)"/>' +
    '<rect x="14" y="76" width="68" height="8" rx="4" fill="rgba(255,255,255,0.75)"/>' +
    '<rect x="14" y="91" width="42" height="6" rx="3" fill="rgba(255,255,255,0.55)"/>' +
    '<text x="12" y="34" fill="white" font-size="11" font-family="Arial" font-weight="700">' +
    textLines +
    "</text>" +
    "</svg>";

  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function splitPosterTitle(title) {
  const words = String(title).split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach(function (word) {
    const candidate = currentLine === "" ? word : currentLine + " " + word;

    if (candidate.length <= 13) {
      currentLine = candidate;
      return;
    }

    if (currentLine !== "") {
      lines.push(currentLine);
    }

    currentLine = word;
  });

  if (currentLine !== "") {
    lines.push(currentLine);
  }

  return lines.slice(0, 3);
}

let movies = [
  {
    id: 1,
    title: "Dune: Parte Dos",
    year: 2024,
    genre: "Ciencia ficcion",
    category: "Nuevo",
    imageUrl: createPoster("Dune: Parte Dos", "#7c2d12")
  },
  {
    id: 2,
    title: "Oppenheimer",
    year: 2023,
    genre: "Drama historico",
    category: "Popular",
    imageUrl: createPoster("Oppenheimer", "#334155")
  },
  {
    id: 3,
    title: "Barbie",
    year: 2023,
    genre: "Comedia",
    category: "Comedia",
    imageUrl: createPoster("Barbie", "#be185d")
  },
  {
    id: 4,
    title: "Spider-Man: Cruzando el Multiverso",
    year: 2023,
    genre: "Animacion",
    category: "Popular",
    imageUrl: createPoster("Spider-Man: Cruzando el Multiverso", "#7e22ce")
  },
  {
    id: 5,
    title: "Top Gun: Maverick",
    year: 2022,
    genre: "Accion",
    category: "Popular",
    imageUrl: createPoster("Top Gun: Maverick", "#0f172a")
  },
  {
    id: 6,
    title: "The Batman",
    year: 2022,
    genre: "Thriller",
    category: "Popular",
    imageUrl: createPoster("The Batman", "#991b1b")
  },
  {
    id: 7,
    title: "Inside Out 2",
    year: 2024,
    genre: "Animacion",
    category: "Comedia",
    imageUrl: createPoster("Inside Out 2", "#2563eb")
  },
  {
    id: 8,
    title: "Furiosa",
    year: 2024,
    genre: "Accion",
    category: "Nuevo",
    imageUrl: createPoster("Furiosa", "#b45309")
  },
  {
    id: 9,
    title: "Talk to Me",
    year: 2022,
    genre: "Terror",
    category: "Terror",
    imageUrl: createPoster("Talk to Me", "#4c0519")
  },
  {
    id: 10,
    title: "Challengers",
    year: 2024,
    genre: "Drama deportivo",
    category: "Deportes",
    imageUrl: createPoster("Challengers", "#15803d")
  },
  {
    id: 11,
    title: "Creed III",
    year: 2023,
    genre: "Boxeo",
    category: "Deportes",
    imageUrl: createPoster("Creed III", "#1e40af")
  },
  {
    id: 12,
    title: "Air",
    year: 2023,
    genre: "Baloncesto",
    category: "Deportes",
    imageUrl: createPoster("Air", "#0369a1")
  },
  {
    id: 13,
    title: "King Richard",
    year: 2021,
    genre: "Tenis",
    category: "Deportes",
    imageUrl: createPoster("King Richard", "#166534")
  },
  {
    id: 14,
    title: "Gran Turismo",
    year: 2023,
    genre: "Motor",
    category: "Deportes",
    imageUrl: createPoster("Gran Turismo", "#1d4ed8")
  },
  {
    id: 15,
    title: "Matrix",
    year: 1999,
    genre: "Ciencia ficcion",
    category: "Popular",
    imageUrl: createPoster("Matrix", "#14532d")
  }
];

const users = [
  { id: 1, email: "user1@gmail.com", password: "pass", role: "user" },
  { id: 2, email: "admin@gmail.com", password: "admin", role: "admin" },
  { id: 3, email: "user2@gmail.com", password: "pass2", role: "user" }
];

let rentals = [
  {
    id: 1,
    userId: 1,
    movieId: 15,
    rentedAt: "2026-05-03T00:00:00.000Z",
    availableUntil: "2026-05-10T00:00:00.000Z"
  }
];

function getRentalAvailableUntil() {
  const availableUntil = new Date();
  availableUntil.setDate(availableUntil.getDate() + 7);
  return availableUntil.toISOString();
}

function isValidMovie(movie) {
  return (
    movie &&
    typeof movie.title === "string" &&
    movie.title.trim() !== "" &&
    Number.isInteger(Number(movie.year)) &&
    typeof movie.genre === "string" &&
    movie.genre.trim() !== "" &&
    isValidCategory(movie.category)
  );
}

function normalizeMovie(movie, id) {
  return {
    title: movie.title.trim(),
    year: Number(movie.year),
    genre: movie.genre.trim(),
    category: movie.category,
    imageUrl: movie.imageUrl || createPoster(movie.title.trim(), getPosterColor(id))
  };
}

function isValidCategory(category) {
  return ["Nuevo", "Popular", "Deportes", "Terror", "Comedia"].includes(category);
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
    rentedAt: rental.rentedAt,
    availableUntil: rental.availableUntil,
    movie: findMovieById(rental.movieId)
  };
}

app.get("/", function (_req, res) {
  res.json({ message: "API de peliculas funcionando" });
});

app.post("/login", function (req, res) {
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

app.get("/movies", function (_req, res) {
  res.json(movies);
});

app.get("/movies/available", function (_req, res) {
  const rentedMovieIds = rentals.map(function (rental) {
    return rental.movieId;
  });

  const availableMovies = movies.filter(function (movie) {
    return !rentedMovieIds.includes(movie.id);
  });

  res.json(availableMovies);
});

app.get("/movies/:id", function (req, res) {
  const id = Number(req.params.id);
  const movie = findMovieById(id);

  if (!movie) {
    res.status(404).json({ message: "Pelicula no encontrada" });
    return;
  }

  res.json(movie);
});

app.post("/movies", function (req, res) {
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
    category: cleanMovie.category,
    imageUrl: cleanMovie.imageUrl
  };

  nextId += 1;
  movies.push(newMovie);

  res.status(201).json(newMovie);
});

app.put("/movies/:id", function (req, res) {
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
      category: req.body.category,
      imageUrl: movies[index].imageUrl
    },
    id
  );

  const updatedMovie = {
    id: id,
    title: cleanMovie.title,
    year: cleanMovie.year,
    genre: cleanMovie.genre,
    category: cleanMovie.category,
    imageUrl: cleanMovie.imageUrl
  };

  movies[index] = updatedMovie;

  res.json(updatedMovie);
});

app.delete("/movies/:id", function (req, res) {
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

app.post("/rentals", function (req, res) {
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
    movieId: movieId,
    rentedAt: new Date().toISOString(),
    availableUntil: getRentalAvailableUntil()
  };

  nextRentalId += 1;
  rentals.push(newRental);

  res.status(201).json(buildRentalResponse(newRental));
});

app.get("/rentals", function (req, res) {
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

app.get("/rentals/user/:userId", function (req, res) {
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

app.listen(PORT, function () {
  console.log("Servidor escuchando en http://localhost:" + PORT);
});
