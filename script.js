// ==============================
// CONFIGURATION
// ==============================

// ID de ta playlist YouTube
const PLAYLIST_ID = "PLTyMOPElORjYiQVwjMeU51xS4PKb455VM";

// Ta clé API YouTube (pense à bien la restreindre aux referrers HTTP de ton site)
const API_KEY = "AIzaSyD-qNMO9FIvEpjPdG6BV7uxrgzdA4YbA2s";

// Nombre max d’éléments par page (50 = max autorisé par YouTube)
const MAX_RESULTS = 50;

// ==============================
// RÉCUPÉRATION DES VIDÉOS
// ==============================

async function fetchPlaylistPage(pageToken = "") {
  const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("maxResults", MAX_RESULTS.toString());
  url.searchParams.set("playlistId", PLAYLIST_ID);
  url.searchParams.set("key", API_KEY);
  if (pageToken) {
    url.searchParams.set("pageToken", pageToken);
  }

  console.log("Appel API YouTube:", url.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    // On journalise l’erreur pour la console
    console.error("Réponse API non OK:", response.status, response.statusText);
    // On essaye de lire le corps pour plus de détails
    let details = "";
    try {
      const data = await response.json();
      details = JSON.stringify(data);
    } catch (e) {
      // ignore
    }
    throw new Error("Erreur API YouTube : " + response.status + " " + response.statusText + " " + details);
  }

  return response.json();
}

async function fetchAllPlaylistVideos() {
  const videos = [];
  let pageToken = "";
  let securityLoop = 0;

  while (securityLoop < 20) { // sécurité au cas où
    const data = await fetchPlaylistPage(pageToken);

    if (Array.isArray(data.items)) {
      data.items.forEach((item) => {
        const snippet = item.snippet;
        if (
          !snippet ||
          !snippet.resourceId ||
          snippet.resourceId.kind !== "youtube#video"
        ) {
          return;
        }

        const videoId = snippet.resourceId.videoId;
        const title = snippet.title;
        const channelTitle =
          snippet.videoOwnerChannelTitle ||
          snippet.channelTitle ||
          "Mada Game Over Groove";

        videos.push({
          id: videoId,
          title: title,
          info: channelTitle
        });
      });
    }

    if (data.nextPageToken) {
      pageToken = data.nextPageToken;
      securityLoop++;
    } else {
      break;
    }
  }

  return videos;
}

// ==============================
// AFFICHAGE SUR LE SITE
// ==============================

function renderVideos(videos) {
  const grid = document.getElementById("video-grid");
  const status = document.getElementById("video-status");

  if (!grid) return;

  grid.innerHTML = "";

  if (status) {
    if (videos.length === 0) {
      status.textContent = "Aucune vidéo trouvée dans la playlist.";
    } else {
      status.textContent = `Vidéos de la playlist (${videos.length}) :`;
    }
  }

  videos.forEach((video) => {
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

document.addEventListener("DOMContentLoaded", async () => {
  setYear();

  const status = document.getElementById("video-status");
  if (status) {
    status.textContent = "Chargement des vidéos de la playlist...";
  }

  try {
    const videos = await fetchAllPlaylistVideos();
    console.log("Vidéos récupérées:", videos);
    renderVideos(videos);
  } catch (error) {
    console.error("Erreur globale:", error);
    if (status) {
      status.textContent =
        "Erreur lors du chargement des vidéos : " + error.message;
    }
  }
});
