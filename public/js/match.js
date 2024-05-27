function fetchMatchData() {
  // Tampilkan spinner loading sebelum memuat data
  $('#loadingSpinner').show();
  $('#datas').hide();
  
  $.ajax({
  url: 'https://bolasiar.vercel.app/api/scrape',
  type: 'GET',
  headers: {
  'Content-Type': 'application/x-www-form-urlencoded'
  },
  success: function(matchData) {
  const liveMatch = $('#daftarMatchLive');
  const nonLiveMatch = $('#daftarMatchnoLive');
  
  matchData.forEach(match => {
  const fullLink = match.fullLink;
  
  const linkElement = $('<a>', {
  href: fullLink.includes('javascript:void(0)') ? '#' : fullLink,
  click: function(event) {
  if (fullLink.includes('javascript:void(0)')) {
  event.preventDefault();
  alert('Maaf, match ini belum tayang.');
  
  } else {
  
  const id = getIDFromURL(match.url); // Ambil ID dari URL
  const title = `Live Streaming ${match.homeTeam.name} vs ${match.awayTeam.name}`;
  localStorage.setItem('matchtitleLive', title); // Simpan title ke localStorage
  window.location.href = `detail.html?id=${id}`;
  }
  },
  css: {
  textDecoration: 'none'
  }
  });
  
  const matchTimeClass = match.date === 'LIVE NOW' ? 'live-now' : '';
  
  const matchCard = $(`
  <div class="card bg border-card rounded-4 mx-3 my-3 text-white mb-5">
  <div class="card-body">
  <div class="row justify-content-evenly">
  <div class="col-4 col-md-4 col-lg-4">
  <div class="h-100">
  <div class="text-center">
  <img src="${match.homeTeam.img}" height="auto" width="50" />
  <div class="mt-3">
  <h5 class="text-truncate-2" style="font-size: 1.1em; margin: 0;">${match.homeTeam.name}</h5>
  </div>
  </div>
  </div>
  </div>
  <div class="col-4 col-md-4 col-lg-4">
  <div class="h-100 d-flex flex-column justify-content-center align-items-center text-center">
  <h3 class="${matchTimeClass}" style="font-size: 1em; margin: 0;">${match.time || 'LIVE NOW'}</h3>
  <p class="text-truncate-2 mt-2" style="font-size: 0.9em; margin: 0;">${match.league}</p>
  </div>
  </div>
  <div class="col-4 col-md-4 col-lg-4">
  <div class="h-100">
  <div class="text-center">
  <img src="${match.awayTeam.img}" height="auto" width="50" />
  <div class="mt-3">
  <h5 class="text-truncate-2" style="font-size: 1.1em; margin: 0;">${match.awayTeam.name}</h5>
  </div>
  </div>
  </div>
  </div>
  </div>
  </div>
  </div>
  `);
  
  linkElement.append(matchCard);
  
  if (match.date === 'LIVE NOW') {
  liveMatch.append(linkElement);
  } else {
  nonLiveMatch.append(linkElement);
  }
  });
  
  // Sembunyikan spinner loading setelah data dimuat
  $('#loadingSpinner').hide();
  $('#datas').show();
  localStorage.removeItem(matchtitleLive);
  },
  error: function(xhr, status, error) {
  console.error('Error fetching match data:', {
  readyState: xhr.readyState,
  status: xhr.status,
  statusText: xhr.statusText,
  responseText: xhr.responseText
  });
  // Sembunyikan spinner loading jika terjadi kesalahan
  $('#loadingSpinner').show();
  $('#datas').hide();
  }
  });
  }
  
  function getIDFromURL(url) {
  // Menghapus bagian awal URL "https://bolasiar.cc/" dari string URL
  const idStartIndex = url.indexOf('https://bolasiar.cc/') + 'https://bolasiar.cc/'.length;
  const id = url.substring(idStartIndex);
  return id;
  }
  
  $(document).ready(fetchMatchData);