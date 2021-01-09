const colors = [
  'rgba(54, 162, 235, 0.6)',
  'rgba(255, 99, 132, 0.6)',
  'rgba(255, 206, 86, 0.6)',
  'rgba(75, 192, 192, 0.6)',  
  'rgba(153, 102, 255, 0.6)',
  'rgba(255, 159, 64, 0.6)',
  'rgba(255, 99, 132, 0.6)',
];

function drawUserAccessChart(dates, counts) {
  const context = document.getElementById('user-access-chart').getContext('2d');

  const userAccessChart = new Chart(context, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        data: counts,
        backgroundColor: colors
      }] 
    },
    options: {
      title: {
        display: true,
        text: 'Lượng Truy Cập 7 Ngày Qua',
        fontSize: 24
      },
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      }
    }
  });
}

function drawTopSearchQueryChart(keywords, counts) {
  const context = document.getElementById('top-search-query-chart').getContext('2d');

  const topSearchQueryChart = new Chart(context, {
    type: 'bar',
    data: {
      labels: keywords,
      datasets: [{
        data: counts,
        backgroundColor: colors
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Top Từ Khóa Tìm Kiếm',
        fontSize: 24
      },
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      },
      plugins: {
        labels: {
          render: () => {}
        }
      }
    }
  })
}

function drawUserLocationChart(locations, counts) {
  const context = document.getElementById('user-location-chart').getContext('2d');

  const userLocationChart = new Chart(context, {
    type: 'pie',
    data: {
      labels: locations,
      datasets: [{
        label: '',
        data: counts,
        backgroundColor: colors
      }] 
    },
    options: {
      title: {
        display: true,
        text: 'Vị Trí Các Điểm Truy Cập',
        fontSize: 24
      },
      legend: {
        display: true,
        position: 'right'
      },
      tooltips: {
        enabled: false
      }
    }
  });
}


function updateUserAccess() {
  axios.get('/api/analytics/getUserAccess')
    .then(function(response) {
      const {userAccess} = response.data;
      if (userAccess) {
        document.getElementById('user-access-loader').style.display = 'none';
        document.getElementById('user-access-chart').style.display = 'block';
        drawUserAccessChart(userAccess.dates, userAccess.counts);
      } else  setTimeout(updateUserAccess, 1000);
    });
}

function updateTopSearchQuery() {
  axios.get('/api/analytics/getTopSearchQuery')
    .then(function(response) {
      const {topSearchQuery} = response.data;
      if (topSearchQuery) {
        document.getElementById('top-search-query-loader').style.display = 'none';
        document.getElementById('top-search-query-chart').style.display = 'block';
        drawTopSearchQueryChart(topSearchQuery.keywords, topSearchQuery.counts);
      }
      else  setTimeout(updateTopSearchQuery, 1000);
    });
}

function updateUserLocation() {
  axios.get('/api/analytics/getUserLocation')
    .then(function(response) {
      const {userLocation} = response.data;
      if (userLocation) {
        document.getElementById('user-location-loader').style.display = 'none';
        document.getElementById('user-location-chart').style.display = 'block';
        drawUserLocationChart(userLocation.locations, userLocation.counts);
      }
      else  setTimeout(updateUserLocation, 1000);
    });
}

function updateOnlineUser() {
  window.addEventListener('DOMContentLoaded', function() {
    const tag = document.getElementById('online-user');
    const interval = setInterval(() => {
      axios.get('/api/analytics/getOnlineUser')
      .then(function(response) {
        if (response.data.onlineUser)
          tag.innerHTML = response.data.onlineUser;
      });
    }, 1000);
    
    document.getElementById('dashboard-link').onclick = () => clearInterval(interval);  
    document.getElementById('dashboard-btn').onclick = () => clearInterval(interval);
  });
}

updateOnlineUser();
updateUserAccess();
updateTopSearchQuery();
updateUserLocation();