const colors = [
  'rgba(255, 99, 132, 0.6)',
  'rgba(54, 162, 235, 0.6)',
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