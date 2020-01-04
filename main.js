var charts = [];

window.onload = function() {
  /* Begin running the code */
  start();
};

/* Initial Method */
start = () => {
  /* Handle Data + Render the Charts */
  renderEmptyCharts();

  /* Render Player List */
  renderList();
};

/* Initial Method to Render Player List */
renderList = () => {
  fetchAllPlayers();
};

/* Fetch All Players from API */
async function fetchAllPlayers() {
  const playersData = await fetch("http://localhost:5000/players");

  parseAllPlayerData(playersData);
}

/* Parse All Player Data to JSON */
async function parseAllPlayerData(playersData) {
  const parsedPlayersData = await playersData.json();

  createAllPlayersObjects(parsedPlayersData);
}

/* Create Player Instances from Fetched Data */
createAllPlayersObjects = data => {
  data.players.forEach(
    player =>
      new Player({
        id: player.id,
        name: player.name,
        position: player.position
      })
  );

  displayList();
};

/* Render List of Players to HTML */
displayList = () => {
  const list = document.querySelector(".players-list");

  Player.getAll().forEach(el => {
    list.innerHTML += `<input type="radio" id="${el.getID()}" name="player">
    <label for="${el.getID()}">${el.getName()}</label><br>`;
  });

  addRadioEvents();
};

addRadioEvents = () => {
  radioButtons = document.querySelectorAll('input[type="radio"]');

  radioButtons.forEach(el => {
    el.addEventListener("change", function(e) {
      const target = e.target;
      const id = target.id;

      getDataByID(id);
    });
  });
};

async function getDataByID(id) {
  const data = await fetch(`http://localhost:5000/players/${id}`);

  parseDataByID(data);
}

async function getDataByIDvsOpponent(id, opponent) {
  const data = await fetch(
    `http://localhost:5000/players/${id}?opponent=${opponent}`
  );

  parseDataByID(data);
}

async function parseDataByID(data) {
  const parsedData = await data.json();

  createPlayer(parsedData);
}

/* Create Player Instance off Fetched Data */
createPlayer = playerMeta => {
  const player = new Player(playerMeta);

  gatherDataPoints(player, "last10");
  gatherDataPoints(player, "vsOpponent");
  gatherDataPoints(player, "value");
};

/* Populate Data Points for Chart */
gatherDataPoints = (player, type) => {
  let dataPoints = null;
  if (type == "last10") {
    dataPoints = player.getGames().map(el => {
      return {
        label: parseDate(new Date(el.date.replace(/-/g, "/"))),
        y: calculateFanduelPoints(el)
      };
    });
  } else if (type == "vsOpponent") {
    dataPoints = player.getGamesAgainst(player.getTodaysOpponent()).map(el => {
      return {
        label: parseDate(new Date(el.date.replace(/-/g, "/"))),
        y: calculateFanduelPoints(el)
      };
    });
  } else {
    dataPoints = player.getGames().map(el => {
      return {
        label: parseDate(new Date(el.date.replace(/-/g, "/"))),
        y: calculateValue(el)
      };
    });
  }

  populateChart(player, dataPoints, type);
};

renderEmptyCharts = () => {
  chart = new CanvasJS.Chart("chartContainer", {
    title: {
      text: `Past 10 Games`
    },
    data: [
      {
        type: "line",
        name: "actual",
        showInLegend: true
      }
    ]
  });
  chart1 = new CanvasJS.Chart("chartContainer1", {
    title: {
      text: `vs Team`
    },
    data: [
      {
        type: "line",
        name: "actual",
        showInLegend: true
      }
    ]
  });
  chart2 = new CanvasJS.Chart("chartContainer2", {
    title: {
      text: `Value`
    },
    data: [
      {
        type: "line",
        name: "actual",
        showInLegend: true
      }
    ]
  });

  charts = [chart, chart1, chart2];

  renderChart(chart);
  renderChart(chart1);
  renderChart(chart2);
};

/* Create the Charts */
populateChart = (player, data, type) => {
  let chart = null;
  if (type == "last10") {
    chart = charts[0];
    chart.options.title.text = `${player.getName()} Past 10 Games`;
    chart.options.data = [
      {
        type: "line",
        name: "actual",
        showInLegend: true,
        dataPoints: data
      }
    ];
  } else if (type == "vsOpponent") {
    chart = charts[1];
    chart.options.title.text = `${player.getName()} vs ${player.getTodaysOpponent()}`;
    chart.options.data = [
      {
        type: "line",
        name: "actual",
        showInLegend: true,
        dataPoints: data
      }
    ];
  } else {
    chart = charts[2];
    chart.options.title.text = `${player.getName()} Value`;
    chart.options.data = [
      {
        type: "line",
        name: "actual",
        showInLegend: true,
        dataPoints: data
      }
    ];
  }

  renderChart(chart);
};

/* Render Canvas Chart to HTML */
renderChart = chart => {
  chart.render();
};

/* Helper Method to Calculate Fanduel Points */
calculateFanduelPoints = game => {
  let fantasyPoints = 0;

  fantasyPoints += game.points;
  fantasyPoints += game.rebounds * 1.2;
  fantasyPoints += game.assists * 1.5;
  fantasyPoints += game.steals * 3;
  fantasyPoints += game.blocks * 3;
  fantasyPoints -= game.turnovers;

  return fantasyPoints;
};

/* Helper Method to Calculate Value Returned of Player */
calculateValue = game => {
  let points = calculateFanduelPoints(game);

  return (points / game.price) * 1000;
};

/* Helper Method to Parse Date to more Friendly Format */
parseDate = date => {
  let month = date.getMonth();
  let monthWord = "";

  switch (month) {
    case 0:
      monthWord = "Jan";
      break;
    case 1:
      monthWord = "Feb";
      break;
    case 2:
      monthWord = "Mar";
      break;
    case 3:
      monthWord = "Apr";
      break;
    case 4:
      monthWord = "May";
      break;
    case 5:
      monthWord = "June";
      break;
    case 6:
      monthWord = "July";
      break;
    case 7:
      monthWord = "Aug";
      break;
    case 8:
      monthWord = "Sep";
      break;
    case 9:
      monthWord = "Oct";
      break;
    case 10:
      monthWord = "Nov";
      break;
    case 11:
      monthWord = "Dec";
      break;
    default:
      monthWord = "Jan";
  }
  return `${monthWord} ${date.getDate()}, ${date.getFullYear()}`;
};
