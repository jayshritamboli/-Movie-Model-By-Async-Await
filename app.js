
const cl = console.log;


const showModalBtn = document.getElementById("showModalBtn");
const movieModal = document.getElementById("movieModal");
const backdrop = document.getElementById("backdrop");
const movieContainer = document.getElementById("movieContainer");
const closeModal = [...document.querySelectorAll(".closeModal")];

const movieForm = document.getElementById("movieForm");
const movieNameControl = document.getElementById("movieName");
const movieImgUrlControl = document.getElementById("movieImgUrl");
const movieDescriptionControl = document.getElementById("movieDescription");
const movieRatingControl = document.getElementById("movieRating");
const addMovieBtn = document.getElementById("addMovieBtn");
const updateMovieBtn = document.getElementById("updateMovieBtn");
const loader = document.getElementById("loader");


const Setbadge = (rating) => {
  if (rating >= 4) return "badge-success";
  if (rating >= 3) return "badge-warning";
  return "badge-danger";
};


const onModelToggle = () => {
  backdrop.classList.toggle("active");
  movieModal.classList.toggle("active");
  movieForm.reset();
  addMovieBtn.classList.remove("d-none");
  updateMovieBtn.classList.add("d-none");
};


const toggleSpinner = (flag) => {
  loader.classList.toggle("d-none", !flag);
};


function snackbar(title, icon) {
  Swal.fire({ title, icon, timer: 1500 });
}


let BASE_URL = "https://movie-model-b5809-default-rtdb.firebaseio.com";
let MOVIE_URL = `${BASE_URL}/movies.json`;


const moviesObjToArr = (obj) => {
  let moviesArr = [];
  for (const key in obj) {
    obj[key].id = key;
    moviesArr.push(obj[key]);
  }
  return moviesArr;
};


async function makeApiCall(URL, method, body) {
  try {
    toggleSpinner(true);

    const config = {
      method,
      headers: {
        auth: "Token From LS",
        "content-type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    };

    const res = await fetch(URL, config);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong!");
    }

    return data;
  } finally {
    toggleSpinner(false);
  }
}




async function fetchAllMovie() {
  try {
    const data = await makeApiCall(MOVIE_URL, "GET", null);
    const moviesArr = moviesObjToArr(data);
    createMovieCard(moviesArr);
  } catch (err) {
    snackbar(err.message, "error");
  }
}
fetchAllMovie();




const createMovieCard = (arr) => {
  movieContainer.innerHTML = arr
    .map(
      (movie) => `
      <div class="col-md-3 col-sm-6">
        <div class="card movieCard text-white mb-4" id="${movie.id}">
          <div class="card-header">
            <div class="row">
              <div class="col-10"><h2>${movie.title}</h2></div>
              <div class="col-2">
                <span class="badge ${Setbadge(movie.rating)}">${movie.rating}</span>
              </div>
            </div>
          </div>
          <div class="card-body py-0">
            <figure>
              <img src="${movie.image}" class="img-fluid mb-3">
              <figcaption>
                <h5>${movie.title}</h5>
                <p>${movie.desc}</p>
              </figcaption>
            </figure>
          </div>
          <div class="card-footer d-flex justify-content-between">
            <button class="btn btn-sm nfx-sec-btn" onclick="onEdit(this)">Edit</button>
            <button class="btn btn-sm nfx-pri-btn" onclick="onRemove(this)">Remove</button>
          </div>
        </div>
      </div>`
    )
    .join("");
};



//create Movie
async function onSubmitBtn(event) {
  event.preventDefault();

  let movieObj = {
    title: movieNameControl.value,
    desc: movieDescriptionControl.value,
    image: movieImgUrlControl.value,
    rating: movieRatingControl.value,
  };

  try {
    const res = await makeApiCall(MOVIE_URL, "POST", movieObj);

    const card = document.createElement("div");
    card.className = "col-md-3 col-sm-6";
    card.innerHTML = `
      <div class="card movieCard text-white mb-4" id="${res.name}">
        <div class="card-header">
          <div class="row">
            <div class="col-10"><h2>${movieObj.title}</h2></div>
            <div class="col-2">
              <span class="badge ${Setbadge(movieObj.rating)}">${movieObj.rating}</span>
            </div>
          </div>
        </div>
        <div class="card-body py-0">
          <figure>
            <img src="${movieObj.image}" class="img-fluid mb-3">
            <figcaption>
              <h5>${movieObj.title}</h5>
              <p>${movieObj.desc}</p>
            </figcaption>
          </figure>
        </div>
        <div class="card-footer d-flex justify-content-between">
          <button class="btn btn-sm nfx-sec-btn" onclick="onEdit(this)">Edit</button>
          <button class="btn btn-sm nfx-pri-btn" onclick="onRemove(this)">Remove</button>
        </div>
      </div>
    `;

    movieContainer.prepend(card);
    onModelToggle();
    snackbar("Movie Created Successfully!", "success");
  } catch (err) {
    snackbar(err.message, "error");
  }
}



// REMOVE MOVIE
async function onRemove(ele) {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    showCancelButton: true,
    confirmButtonText: "Delete",
  });

  if (!confirm.isConfirmed) return;

  const REMOVE_ID = ele.closest(".card").id;
  const REMOVE_URL = `${BASE_URL}/movies/${REMOVE_ID}.json`;

  try {
    await makeApiCall(REMOVE_URL, "DELETE", null);
    ele.closest(".card").remove();
    snackbar("Movie removed successfully!", "success");
  } catch (err) {
    snackbar(err.message, "error");
  }
}



// EDIT MOVIE
async function onEdit(ele) {
  const EDIT_ID = ele.closest(".card").id;
  localStorage.setItem("EDIT_ID", EDIT_ID);

  const EDIT_URL = `${BASE_URL}/movies/${EDIT_ID}.json`;

  try {
    const res = await makeApiCall(EDIT_URL, "GET", null);

    onModelToggle();
    movieNameControl.value = res.title;
    movieDescriptionControl.value = res.desc;
    movieImgUrlControl.value = res.image;
    movieRatingControl.value = res.rating;

    addMovieBtn.classList.add("d-none");
    updateMovieBtn.classList.remove("d-none");
  } catch (err) {
    snackbar(err.message, "error");
  }
}



// UPDATE MOVIE
async function onMovieUpdate() {
  const UPDATE_ID = localStorage.getItem("EDIT_ID");

  const updatedMovieObj = {
    title: movieNameControl.value,
    desc: movieDescriptionControl.value,
    image: movieImgUrlControl.value,
    rating: movieRatingControl.value,
  };

  const UPDATE_URL = `${BASE_URL}/movies/${UPDATE_ID}.json`;

  try {
    await makeApiCall(UPDATE_URL, "PATCH", updatedMovieObj);

    const card = document.getElementById(UPDATE_ID);
    card.innerHTML = `
      <div class="card-header">
        <div class="row">
          <div class="col-10"><h2>${updatedMovieObj.title}</h2></div>
          <div class="col-2">
            <span class="badge ${Setbadge(updatedMovieObj.rating)}">${updatedMovieObj.rating}</span>
          </div>
        </div>
      </div>
      <div class="card-body py-0">
        <figure>
          <img src="${updatedMovieObj.image}" class="img-fluid mb-3">
          <figcaption>
            <h5>${updatedMovieObj.title}</h5>
            <p>${updatedMovieObj.desc}</p>
          </figcaption>
        </figure>
      </div>
      <div class="card-footer d-flex justify-content-between">
        <button class="btn btn-sm nfx-sec-btn" onclick="onEdit(this)">Edit</button>
        <button class="btn btn-sm nfx-pri-btn" onclick="onRemove(this)">Remove</button>
      </div>
    `;

    onModelToggle();
    snackbar("Movie updated successfully!", "success");
  } catch (err) {
    snackbar(err.message, "error");
  }
}



closeModal.forEach((btn) => btn.addEventListener("click", onModelToggle));
showModalBtn.addEventListener("click", onModelToggle);
movieForm.addEventListener("submit", onSubmitBtn);
updateMovieBtn.addEventListener("click", onMovieUpdate);

