import "./styles.css";

type Role = "admin" | "user";

type Movie = {
  id: number;
  title: string;
  year: number;
  genre: string;
  imageUrl: string;
};

type User = {
  id: number;
  email: string;
  role: Role;
};

type Rental = {
  id: number;
  userId: number;
  userEmail: string;
  movie: Movie;
};

const API_BASE_URL = import.meta.env.DEV ? "http://localhost:3000" : "/api";
const MOVIES_URL = API_BASE_URL + "/movies";

const form = document.querySelector("#movie-form") as HTMLFormElement;
const loginForm = document.querySelector("#login-form") as HTMLFormElement;
const movieIdInput = document.querySelector("#movie-id") as HTMLInputElement;
const titleInput = document.querySelector("#title") as HTMLInputElement;
const yearInput = document.querySelector("#year") as HTMLInputElement;
const genreInput = document.querySelector("#genre") as HTMLInputElement;
const emailInput = document.querySelector("#email") as HTMLInputElement;
const passwordInput = document.querySelector("#password") as HTMLInputElement;
const saveButton = document.querySelector("#save-button") as HTMLButtonElement;
const cancelButton = document.querySelector("#cancel-button") as HTMLButtonElement;
const logoutButton = document.querySelector("#logout-button") as HTMLButtonElement;
const movieList = document.querySelector("#movie-list") as HTMLDivElement;
const availableList = document.querySelector("#available-list") as HTMLDivElement;
const rentedList = document.querySelector("#rented-list") as HTMLDivElement;
const allRentalsList = document.querySelector("#all-rentals-list") as HTMLDivElement;
const statusText = document.querySelector("#status") as HTMLSpanElement;
const availableStatusText = document.querySelector("#available-status") as HTMLSpanElement;
const rentedStatusText = document.querySelector("#rented-status") as HTMLSpanElement;
const allRentalsStatusText = document.querySelector("#all-rentals-status") as HTMLSpanElement;
const loginStatusText = document.querySelector("#login-status") as HTMLParagraphElement;
const adminMoviesSection = document.querySelector("#admin-movies-section") as HTMLElement;
const userAvailableSection = document.querySelector("#user-available-section") as HTMLElement;
const userRentedSection = document.querySelector("#user-rented-section") as HTMLElement;
const adminRentalsSection = document.querySelector("#admin-rentals-section") as HTMLElement;

let currentUser: User | null = null;

function isAdmin(): boolean {
  return Boolean(currentUser && currentUser.role === "admin");
}

function setStatus(message: string): void {
  statusText.textContent = message;
}

function setLoginStatus(message: string): void {
  loginStatusText.textContent = message;
}

function getAuthHeaders(): HeadersInit {
  if (!currentUser) {
    return {
      "Content-Type": "application/json"
    };
  }

  return {
    "Content-Type": "application/json",
    "x-user-id": String(currentUser.id)
  };
}

function resetForm(): void {
  movieIdInput.value = "";
  titleInput.value = "";
  yearInput.value = "";
  genreInput.value = "";
  saveButton.textContent = "Guardar";
}

function getFormMovie(): Omit<Movie, "id" | "imageUrl"> {
  return {
    title: titleInput.value,
    year: Number(yearInput.value),
    genre: genreInput.value
  };
}

function fillForm(movie: Movie): void {
  movieIdInput.value = String(movie.id);
  titleInput.value = movie.title;
  yearInput.value = String(movie.year);
  genreInput.value = movie.genre;
  saveButton.textContent = "Actualizar";
}

function showElement(element: HTMLElement, shouldShow: boolean): void {
  element.classList.toggle("hidden", !shouldShow);
}

function updateVisibleSections(): void {
  const adminLogged = isAdmin();
  const userLogged = Boolean(currentUser && currentUser.role === "user");

  showElement(form, adminLogged);
  showElement(adminMoviesSection, adminLogged);
  showElement(adminRentalsSection, adminLogged);
  showElement(userAvailableSection, userLogged);
  showElement(userRentedSection, userLogged);
}

function createMovieCard(movie: Movie, mode: "crud" | "available" | "rented"): HTMLElement {
  const article = document.createElement("article");
  article.className = "movie-card";

  const image = document.createElement("img");
  image.className = "movie-poster";
  image.src = movie.imageUrl;
  image.alt = "Poster de " + movie.title;

  const info = document.createElement("div");
  info.className = "movie-info";

  const title = document.createElement("h3");
  title.textContent = movie.title;

  const details = document.createElement("p");
  details.textContent = movie.year + " - " + movie.genre;

  const actions = document.createElement("div");
  actions.className = "card-actions";

  if (mode === "crud") {
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "small";
    editButton.textContent = "Editar";
    editButton.addEventListener("click", function () {
      fillForm(movie);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "small danger";
    deleteButton.textContent = "Eliminar";
    deleteButton.addEventListener("click", function () {
      deleteMovie(movie.id);
    });

    actions.append(editButton, deleteButton);
  }

  if (mode === "available") {
    const rentButton = document.createElement("button");
    rentButton.type = "button";
    rentButton.className = "small success";
    rentButton.textContent = "Alquilar";
    rentButton.addEventListener("click", function () {
      rentMovie(movie.id);
    });

    actions.append(rentButton);
  }

  info.append(title, details);
  article.append(image, info, actions);

  return article;
}

function createRentalCard(rental: Rental): HTMLElement {
  const article = createMovieCard(rental.movie, "rented");
  const info = article.querySelector(".movie-info") as HTMLDivElement;
  const userLine = document.createElement("p");
  userLine.className = "rental-user";
  userLine.textContent = "Alquilada por " + rental.userEmail;
  info.appendChild(userLine);

  return article;
}

function renderMovieList(target: HTMLDivElement, movies: Movie[], mode: "crud" | "available" | "rented"): void {
  target.innerHTML = "";

  if (movies.length === 0) {
    target.innerHTML = '<p class="empty">No hay peliculas para mostrar.</p>';
    return;
  }

  movies.forEach(function (movie) {
    target.appendChild(createMovieCard(movie, mode));
  });
}

function renderRentalList(target: HTMLDivElement, rentals: Rental[]): void {
  target.innerHTML = "";

  if (rentals.length === 0) {
    target.innerHTML = '<p class="empty">No hay alquileres para mostrar.</p>';
    return;
  }

  rentals.forEach(function (rental) {
    target.appendChild(createRentalCard(rental));
  });
}

function loadMovies(): void {
  if (!isAdmin()) {
    movieList.innerHTML = "";
    setStatus("Inicia sesion como admin");
    return;
  }

  setStatus("Cargando...");

  fetch(MOVIES_URL)
    .then(function (response) {
      return response.json();
    })
    .then(function (movies: Movie[]) {
      renderMovieList(movieList, movies, "crud");
      setStatus(movies.length + " peliculas");
    })
    .catch(function () {
      setStatus("No se pudo conectar con el servidor");
    });
}

function saveMovie(event: SubmitEvent): void {
  event.preventDefault();

  if (!isAdmin()) {
    setStatus("Solo el administrador puede guardar peliculas");
    return;
  }

  const id = movieIdInput.value;
  const movie = getFormMovie();
  const isEditing = id !== "";
  const url = isEditing ? MOVIES_URL + "/" + id : MOVIES_URL;
  const method = isEditing ? "PUT" : "POST";

  fetch(url, {
    method: method,
    headers: getAuthHeaders(),
    body: JSON.stringify(movie)
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("No se pudo guardar");
      }

      return response.json();
    })
    .then(function () {
      resetForm();
      loadAdminData();
    })
    .catch(function () {
      setStatus("Error al guardar la pelicula");
    });
}

function deleteMovie(id: number): void {
  if (!isAdmin()) {
    setStatus("Solo el administrador puede eliminar peliculas");
    return;
  }

  fetch(MOVIES_URL + "/" + id, {
    method: "DELETE",
    headers: getAuthHeaders()
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("No se pudo eliminar");
      }

      resetForm();
      loadAdminData();
    })
    .catch(function () {
      setStatus("Error al eliminar la pelicula");
    });
}

function login(event: SubmitEvent): void {
  event.preventDefault();
  setLoginStatus("Comprobando credenciales...");

  fetch(API_BASE_URL + "/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: emailInput.value,
      password: passwordInput.value
    })
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Login incorrecto");
      }

      return response.json();
    })
    .then(function (user: User) {
      currentUser = user;
      setLoginStatus("Sesion iniciada como " + user.email + " (" + user.role + ")");
      updateVisibleSections();
      loadDataForCurrentUser();
    })
    .catch(function () {
      currentUser = null;
      setLoginStatus("Credenciales no validas.");
      resetApplicationState();
    });
}

function logout(): void {
  currentUser = null;
  setLoginStatus("No has iniciado sesion.");
  resetApplicationState();
}

function resetApplicationState(): void {
  resetForm();
  updateVisibleSections();
  movieList.innerHTML = "";
  availableList.innerHTML = "";
  rentedList.innerHTML = "";
  allRentalsList.innerHTML = "";
  setStatus("Inicia sesion como admin");
  availableStatusText.textContent = "Inicia sesion";
  rentedStatusText.textContent = "Inicia sesion";
  allRentalsStatusText.textContent = "Inicia sesion como admin";
}

function loadAvailableMovies(): void {
  availableStatusText.textContent = "Cargando...";

  fetch(API_BASE_URL + "/movies/available")
    .then(function (response) {
      return response.json();
    })
    .then(function (movies: Movie[]) {
      renderMovieList(availableList, movies, "available");
      availableStatusText.textContent = movies.length + " disponibles";
    })
    .catch(function () {
      availableStatusText.textContent = "Error al cargar disponibles";
    });
}

function loadRentedMovies(): void {
  if (!currentUser) {
    return;
  }

  rentedStatusText.textContent = "Cargando...";

  fetch(API_BASE_URL + "/rentals/user/" + currentUser.id)
    .then(function (response) {
      return response.json();
    })
    .then(function (rentals: Rental[]) {
      const movies = rentals.map(function (rental) {
        return rental.movie;
      });

      renderMovieList(rentedList, movies, "rented");
      rentedStatusText.textContent = movies.length + " alquiladas";
    })
    .catch(function () {
      rentedStatusText.textContent = "Error al cargar alquileres";
    });
}

function loadAllRentals(): void {
  if (!isAdmin()) {
    return;
  }

  allRentalsStatusText.textContent = "Cargando...";

  fetch(API_BASE_URL + "/rentals", {
    headers: getAuthHeaders()
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (rentals: Rental[]) {
      renderRentalList(allRentalsList, rentals);
      allRentalsStatusText.textContent = rentals.length + " alquileres";
    })
    .catch(function () {
      allRentalsStatusText.textContent = "Error al cargar alquileres";
    });
}

function loadUserData(): void {
  loadAvailableMovies();
  loadRentedMovies();
}

function loadAdminData(): void {
  loadMovies();
  loadAllRentals();
}

function loadDataForCurrentUser(): void {
  if (isAdmin()) {
    loadAdminData();
    return;
  }

  if (currentUser) {
    loadUserData();
  }
}

function rentMovie(movieId: number): void {
  if (!currentUser) {
    setLoginStatus("Inicia sesion antes de alquilar.");
    return;
  }

  if (currentUser.role !== "user") {
    setLoginStatus("Solo los usuarios pueden alquilar peliculas.");
    return;
  }

  fetch(API_BASE_URL + "/rentals", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      userId: currentUser.id,
      movieId: movieId
    })
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("No se pudo alquilar");
      }

      return response.json();
    })
    .then(function () {
      loadUserData();
    })
    .catch(function () {
      availableStatusText.textContent = "No se pudo alquilar";
    });
}

form.addEventListener("submit", saveMovie);
loginForm.addEventListener("submit", login);
cancelButton.addEventListener("click", resetForm);
logoutButton.addEventListener("click", logout);

resetApplicationState();
