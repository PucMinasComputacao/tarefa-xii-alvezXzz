// =============================================
//  CineMais — Catálogo de Filmes com TMDB
//  Fetch API + Async/Await
// =============================================
 
const API_KEY  = "3e114f53e51d8d5997bb2d37d6274635";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
 
const ENDPOINTS = {
  popular:     "/movie/popular",
  top_rated:   "/movie/top_rated",
  now_playing: "/movie/now_playing",
  upcoming:    "/movie/upcoming",
  search:      "/search/movie",
};
 
const movieList   = document.getElementById("movie-list");
const messageEl   = document.getElementById("message");
const searchInput = document.getElementById("search");
const btnSearch   = document.getElementById("btnSearch");
const filterBtns  = document.querySelectorAll(".filter-btn");
 
let currentEndpoint = "popular";
 
// ─────────────────────────────────────────────
//  1. Busca filmes na API
// ─────────────────────────────────────────────
async function fetchMovies(query = "") {
  const isSearch = query.trim().length > 0;
  const endpoint = isSearch ? ENDPOINTS.search : ENDPOINTS[currentEndpoint];
 
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "pt-BR",
    page: 1,
  });
 
  if (isSearch) params.set("query", query.trim());
 
  const response = await fetch(`${BASE_URL}${endpoint}?${params}`);
 
  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }
 
  const data = await response.json();
  return data.results || [];
}
 
// ─────────────────────────────────────────────
//  2. Cria um card de filme
// ─────────────────────────────────────────────
function createMovieCard(movie) {
  const card = document.createElement("div");
  card.classList.add("movie-card");
 
  // ── Poster
  const posterWrap = document.createElement("div");
  posterWrap.classList.add("card-poster");
 
  if (movie.poster_path) {
    const img = document.createElement("img");
    img.src  = `${IMG_BASE}${movie.poster_path}`;
    img.alt  = movie.title;
    img.loading = "lazy";
    posterWrap.appendChild(img);
  } else {
    const noImg = document.createElement("div");
    noImg.classList.add("no-poster");
    noImg.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="2" width="20" height="20" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span>Sem pôster</span>`;
    posterWrap.appendChild(noImg);
  }
 
  // ── Nota
  if (movie.vote_average) {
    const rating = document.createElement("div");
    rating.classList.add("card-rating");
    rating.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>${movie.vote_average.toFixed(1)}`;
    posterWrap.appendChild(rating);
  }
 
  // ── Corpo
  const body = document.createElement("div");
  body.classList.add("card-body");
 
  const title = document.createElement("h3");
  title.classList.add("card-title");
  title.textContent = movie.title || "Sem título";
 
  const meta = document.createElement("div");
  meta.classList.add("card-meta");
 
  const year = document.createElement("span");
  year.classList.add("card-year");
  year.textContent = movie.release_date ? movie.release_date.split("-")[0] : "—";
 
  const overview = document.createElement("p");
  overview.classList.add("card-overview");
  overview.textContent = movie.overview || "Sinopse não disponível em português.";
 
  if (movie.original_language) {
    const dot = document.createElement("span");
    dot.classList.add("card-dot");
    const lang = document.createElement("span");
    lang.classList.add("card-year");
    lang.textContent = movie.original_language.toUpperCase();
    meta.appendChild(year);
    meta.appendChild(dot);
    meta.appendChild(lang);
  } else {
    meta.appendChild(year);
  }
 
  body.appendChild(title);
  body.appendChild(meta);
  body.appendChild(overview);
 
  card.appendChild(posterWrap);
  card.appendChild(body);
  return card;
}
 
// ─────────────────────────────────────────────
//  3. Renderiza a lista
// ─────────────────────────────────────────────
function renderMovies(movies) {
  movieList.innerHTML = "";
 
  if (!movies || movies.length === 0) {
    showMessage("Nenhum filme encontrado. Tente outra busca.");
    return;
  }
 
  showMessage("");
  movies.forEach(movie => movieList.appendChild(createMovieCard(movie)));
}
 
// ─────────────────────────────────────────────
//  4. Mensagens de status
// ─────────────────────────────────────────────
function showMessage(text) {
  messageEl.textContent = text;
}
 
// ─────────────────────────────────────────────
//  5. Skeletons de carregamento
// ─────────────────────────────────────────────
function renderSkeletons(count = 12) {
  movieList.innerHTML = "";
  for (let i = 0; i < count; i++) {
    movieList.insertAdjacentHTML("beforeend", `
      <div class="skeleton">
        <div class="skeleton-poster"></div>
        <div class="skeleton-body">
          <div class="skeleton-line w80"></div>
          <div class="skeleton-line w40"></div>
          <div class="skeleton-line w80"></div>
          <div class="skeleton-line w60"></div>
        </div>
      </div>`);
  }
}
 
// ─────────────────────────────────────────────
//  6. Fluxo principal
// ─────────────────────────────────────────────
async function loadMovies(query = "") {
  renderSkeletons();
  showMessage("Carregando...");
 
  try {
    const movies = await fetchMovies(query);
    renderMovies(movies);
  } catch (error) {
    console.error("Erro:", error);
    movieList.innerHTML = "";
    showMessage(`⚠️ ${error.message}`);
  }
}
 
// ─────────────────────────────────────────────
//  7. Eventos
// ─────────────────────────────────────────────
btnSearch.addEventListener("click", () => loadMovies(searchInput.value));
 
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") loadMovies(searchInput.value);
});
 
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentEndpoint = btn.dataset.endpoint;
    searchInput.value = "";
    loadMovies();
  });
});
 
// ─────────────────────────────────────────────
//  8. Inicialização
// ─────────────────────────────────────────────
loadMovies();