var myGlobals = {
  charts: [],
  page: 0,
  size: 25
};
/* 
    REFACTOR
*/

window.onload = function() {
  /* Begin running the code */
  start();
};

/* Initial Method */
start = () => {
  handleInitialCharts();
  handleInitialPlayersList();

  lazyLoadRestOfPlayersList();
};

/* Fix this to only run again once data has been retrieved */

/* Fetch more players from api only when user has scrolled down the list */
lazyLoadRestOfPlayersList = () => {
  const list = document.querySelector(".players-list");

  list.addEventListener("scroll", function(event) {
    if (this.scrollTop >= this.scrollHeight - 650) {
      incrementPageNumber();
      fetchAllPlayers(myGlobals.page, myGlobals.size);
    }
  });
};

handleInitialCharts = () => {
  createAllCharts();
};

/* Create 3 Charts: 1 for Last 10 Games, 1 for Against Today's Opponent, 1 for Salary */
createAllCharts = () => {
  createChart("chartContainer");
  createChart("againstOpponentChartContainer");
  createChart("salaryChartContainer");
};

/* Create the empty charts */
createChart = element => {
  const { charts } = myGlobals;

  const chart = new CanvasJS.Chart(element, {
    title: {
      text: ""
    },
    data: [
      {
        type: "line",
        showInLegend: true
      }
    ]
  });

  /* Save chart objects to global charts */
  myGlobals.charts = [...charts, chart];

  renderChart(chart);
};

/* Render chart */
renderChart = chart => {
  chart.render();
};

handleInitialPlayersList = () => {
  const { page, size } = myGlobals;
  fetchAllPlayers(page, size);
};

incrementPageNumber = () => {
  myGlobals.page = myGlobals.page + 1;
};

/* async function: fetch players info from api then parse */
async function fetchAllPlayers(page, size) {
  const playersData = await fetch(
    `http://localhost:5000/players?page=${page}&size=${size}`
  );

  parseAllPlayerData(playersData);
}

/* async function: parse all player data to JSON then update list */
async function parseAllPlayerData(playersData) {
  const parsedPlayersData = await playersData.json();

  updatePlayerList(parsedPlayersData);
}

/* Create Player Instances from Fetched Data */
createAllPlayersObjects = players => {
  players.forEach(
    player =>
      new Player({
        id: player.id,
        name: player.name,
        position: player.position
      })
  );
};

updatePlayerList = ({ players }) => {
  createAllPlayersObjects(players);
  renderList();
};

/* Render player list to HTML */
renderList = () => {
  const list = document.querySelector(".players-list");

  Player.getLastNPlayers(25).forEach(el => {
    list.innerHTML += `<input type="radio" id="${el.getID()}" name="player">
    <label style="line-height: 50px;" for="${el.getID()}">${el.getName()}</label><br>`;
  });

  addRadioEvents();
};

/* Add eventlistener to player selections */
addRadioEvents = () => {
  radioButtons = document.querySelectorAll('input[type="radio"]');

  radioButtons.forEach(el => {
    el.addEventListener("change", function(e) {
      const target = e.target;
      const id = target.id;

      /* Find the local instance of the player with that id */
      const savedPlayer = Player.findByID(id);

      /* If games data has been received from the API before, pull from local data, else grab data from API */
      if (savedPlayer.getGames().length > 0) {
        gatherDataPoints(savedPlayer, "last10");
        gatherDataPoints(savedPlayer, "vsOpponent");
        gatherDataPoints(savedPlayer, "salary");
      } else {
        getDataByID(id);
      }
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
createPlayer = data => {
  const { id, games } = data;
  const player = Player.findByID(id);

  player ? player.setGames(games) : (player = new Player(data));

  gatherDataPoints(player, "last10");
  gatherDataPoints(player, "vsOpponent");
  gatherDataPoints(player, "salary");
};

addDataPoints = ({ games, manipulation, color }) => {
  return games.map(el => {
    return {
      label: parseDate(new Date(el.date.replace(/-/g, "/"))),
      y: manipulation(el),
      color: color,
      lineColor: color
    };
  });
};

/* Populate Data Points for Chart */
/* Refactor */
gatherDataPoints = (player, type) => {
  let object = {};

  if (type == "last10") {
    object = {
      games: player.getGames(),
      manipulation: calculateFanduelPoints,
      color: "#396AB1"
    };
  } else if (type == "vsOpponent") {
    object = {
      games: player.getGamesAgainst(player.getTodaysOpponent()),
      manipulation: calculateFanduelPoints,
      color: "#DA7C30"
    };
  } else {
    object = {
      games: player.getGames(),
      manipulation: calculatePrice,
      color: "#3E9651"
    };
  }

  const dataPoints = addDataPoints(object);

  populateChart(player, dataPoints, type);
};

/* Populate the Charts with Real Data*/
populateChart = (player, data, type) => {
  const { charts } = myGlobals;
  let chart = null;
  if (type == "last10") {
    chart = charts[0];
    chart.options.title.text = `${player.getName()} Past 10 Games`;
    chart.options.data = [
      {
        type: "line",
        name: "Fantasy Points",
        color: "#396AB1",
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
        name: "Fantasy Points",
        color: "#DA7C30",
        showInLegend: true,
        dataPoints: data
      }
    ];
  } else {
    chart = charts[2];
    chart.options.title.text = `${player.getName()} Salary`;
    chart.options.data = [
      {
        type: "line",
        name: "Salary",
        color: "#3E9651",
        showInLegend: true,
        dataPoints: data
      }
    ];
  }

  renderChart(chart);
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

/* Helper Method to Calculate Price of Player */
calculatePrice = el => {
  return el.price;
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
