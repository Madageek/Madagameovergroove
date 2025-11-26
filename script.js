// ==============================
// LISTE DES VIDÉOS À AFFICHER
// ==============================

const videos = [
  {
    id: "dQS9KpTlyw8",
    title: "Le Trône Abyssal de Davy Jones",
    info: "Cette chanson puise son inspiration dans la tragédie mythique de Davy Jones, figure tourmentée de Pirates des Caraïbes. Elle explore son cœur arraché, son amour perdu et la malédiction qui l’a condamné aux abysses. L’océan devient un personnage vivant, reflet de sa rage, de sa solitude et de son pouvoir écrasant. L’atmosphère mêle tempêtes, cris des âmes damnées et créatures colossales comme le Kraken, sculptant une fresque sombre et épique. C’est l’histoire d’un capitaine déchu devenu légende, souverain impitoyable des mers et prisonnier éternel de sa peine."
  },
  {
    id: "kBAHBDiek8c",
    title: "Achète ma merde",
    info: "Cette chanson est une charge punk contre l’industrie du jeu vidéo moderne, où la passion s’efface derrière le profit. Elle dénonce avec sarcasme et fureur la dépendance aux abonnements, DLC et microtransactions absurdes. C’est un cri du joueur trahi, étranglé par les pratiques commerciales déguisées en innovations. Chaque rime est une gifle contre la consommation aveugle et la perte de sens du jeu. Une révolte brute, viscérale, où le plaisir d’autrefois se transforme en marchandise toxique."
  }
];

// ==============================
// AFFICHAGE SUR LE SITE
// ==============================

function renderVideos(videosList) {
  const grid = document.getElementById("video-grid");
  const status = document.getElementById("video-status");

  if (!grid) return;

  grid.innerHTML = "";

  if (status) {
    if (!videosList || videosList.length === 0) {
      status.textContent = "Aucune vidéo définie pour le moment.";
    } else {
      status.textContent = `Vidéos affichées (${videosList.length}) :`;
    }
  }

  videosList.forEach((video) => {
    const card = document.createElement("article");
    card.className = "video-card";

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${video.id}`;
    iframe.title = video.title;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";

    const body = document.createElement("div");
    body.className = "video-body";

    const h3 = document.createElement("h3");
    h3.className = "video-title";
    h3.textContent = video.title;

    const meta = document.createElement("p");
    meta.className = "video-meta";
    meta.textContent =
      video.info || "Mada Game Over Groove - Musique geek";

    body.appendChild(h3);
    body.appendChild(meta);

    card.appendChild(iframe);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

// ==============================
// ANNÉE DU FOOTER
// ==============================

function setYear() {
  const span = document.getElementById("year");
  if (span) {
    span.textContent = new Date().getFullYear();
  }
}

// ==============================
// LANCEMENT AU CHARGEMENT
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  renderVideos(videos);
});
