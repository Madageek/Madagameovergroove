// ==============================
// CONFIGURATION
// ==============================

// ID de ta playlist YouTube
const PLAYLIST_ID = "PLTyMOPElORjYiQVwjMeU51xS4PKb455VM";

// Ta clé API YouTube
// ⚠️ Mets ici la même clé API que tu utilises déjà et qui fonctionne
const API_KEY = "VOTRE_CLE_API_ICI";

// Nombre max d’éléments par page (max = 50)
const MAX_RESULTS = 50;

// Vidéos "pinnées" (mises en avant) en haut de la liste
// avec leurs titres + descriptions personnalisés
const PINNED_VIDEOS = {
  "dQS9KpTlyw8": {
    title: "Le Trône Abyssal de Davy Jones",
    info:
      "Cette chanson puise son inspiration dans la tragédie mythique de Davy Jones, figure tourmentée de Pirates des Caraïbes. Elle explore son cœur arraché, son amour perdu et la malédiction qui l’a condamnée aux abysses. L’océan devient un personnage vivant, reflet de sa rage, de sa solitude et de son pouvoir écrasant. L’atmosphère mêle tempêtes, cris des âmes damnées et créatures colossales comme le Kraken, sculptant une fresque sombre et épique. C’est l’histoire d’un capitaine déchu devenu légende, souverain impitoyable des mers et prisonnier éternel de sa peine."
  },
  "kBAHBDiek8c": {
    title: "Achète ma merde",
    info:
      "Cette chanson est une charge punk contre l’industrie du jeu vidéo moderne, où la passion s’efface derrière le profit. Elle dénonce avec sarcasme et fureur la dépendance aux abonnements, DLC et microtransactions absurdes. C’est un cri du joueur trahi, étranglé par les pratiques commerciales déguisées en innovations. Chaque rime est une gifle contre la consommation aveugle et la perte de sens du jeu. Une révolte brute, viscérale, où le plaisir d’autrefois se transforme en marchandise toxique."
  }
};

// ==============================
// APPELS API YOUTUBE
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

  const response = await fetch(url.toString());

  if (!response.ok) {
    let details = "";
    try {
      const data = await response.json();
      details = JSON.stringify(data);
    } catch (e) {
      // ignore
    }
    throw new Error(
      "Erreur API YouTube : " +
        response.status +
        " " +
        response.statusText +
        " " +
        details
    );
  }

  return response.json();
}

async function fetchAllPlaylistVideos() {
  const videos = [];
  let pageToken = "";
  let securityLoop = 0;

  while (securityLoop < 20) {
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
// REORDONNANCEMENT : VIDEOS PINNÉES D’ABORD
// ==============================

function mergePinnedVideos(videos) {
  // index rapide par id
  const byId = new Map(videos.map((v) => [v.id, v]));
  const result = [];

  // 1) Ajouter d'abord les vidéos "pinnées"
  Object.entries(PINNED_VIDEOS).forEach(([id, meta]) => {
    let existing = byId.get(id);
    if (!existing) {
      // La vidéo n’est pas dans la playlist -> on la crée quand même
      existing = {
        id,
        title: meta.title,
        info: meta.info
      };
    } else {
      // Elle est dans la playlist -> on écrase titre + info par ceux qu’on veut
      existing = {
        ...existing,
        title: meta.title,
        info: meta.info
      };
      // On la retire du map pour ne pas la remettre plus bas
      byId.delete(id);
    }
    result.push(existing);
  });

  // 2) Ajouter ensuite le reste des vidéos de la playlist dans l’ordre original
  videos.forEach((v) => {
    if (byId.has(v.id)) {
      result.push(v);
      byId.delete(v.id);
    }
  });

  return result;
}

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
      status.textContent = "Aucune vidéo trouvée dans la playlist.";
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

document.addEventListener("DOMContentLoaded", async () => {
  setYear();

  const status = document.getElementById("video-status");
  if (status) {
    status.textContent = "Chargement des vidéos de la playlist...";
  }

  try {
    const playlistVideos = await fetchAllPlaylistVideos();
    const allVideos = mergePinnedVideos(playlistVideos);
    renderVideos(allVideos);
  } catch (error) {
    console.error("Erreur globale:", error);
    if (status) {
      status.textContent =
        "Erreur lors du chargement des vidéos : " + error.message;
    }
  }
});
