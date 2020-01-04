window.onload = function() {
  fetch("http://localhost:5000/players/337")
    .then(res => res.json())
    .then(data => {
      var trae = new Player({
        id: data.id,
        name: data.name,
        position: data.position,
        games: data.games
      });

      var dataPts = trae.getGames().map(el => {
        console.log(new Date(el.date.replace(/-/g, "/")));
        return {
          label: parseDate(new Date(el.date.replace(/-/g, "/"))),
          y: calculateFanduelPoints(el)
        };
      });

      var dataPts2 = trae.getGamesAgainst("NO").map(el => {
        return {
          label: parseDate(new Date(el.date)),
          y: calculateFanduelPoints(el)
        };
      });

      var dataPts3 = trae.getGames().map(el => {
        return {
          label: parseDate(new Date(el.date)),
          y: calculateValue(el)
        };
      });

      var chart1 = new CanvasJS.Chart("chartContainer", {
        title: {
          text: `${trae.getName()} Past 10 Games`
        },
        data: [
          {
            type: "line",
            name: "actual",
            showInLegend: true,
            dataPoints: dataPts
          }
        ]
      });
      var chart2 = new CanvasJS.Chart("chartContainer1", {
        title: {
          text: `${trae.getName()} vs Los Angeles Lakers`
        },
        data: [
          {
            // Change type to "doughnut", "line", "splineArea", etc.
            type: "line",
            dataPoints: dataPts2
          }
        ]
      });

      var chart3 = new CanvasJS.Chart("chartContainer2", {
        title: {
          text: `${trae.getName()} Value`
        },
        data: [
          {
            // Change type to "doughnut", "line", "splineArea", etc.
            type: "line",
            dataPoints: dataPts3
          }
        ]
      });

      chart1.render();
      chart2.render();
      chart3.render();
    });

  calculateFanduelPoints = game => {
    let ffps = 0;

    ffps += game.points;
    ffps += game.rebounds * 1.2;
    ffps += game.assists * 1.5;
    ffps += game.steals * 3;
    ffps += game.blocks * 3;
    ffps -= game.turnovers;

    return ffps;
  };

  calculateValue = game => {
    let points = calculateFanduelPoints(game);

    return (points / game.price) * 1000;
  };

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

  fetch("http://localhost:5000/players")
    .then(res => res.json())
    .then(data => {
      data.players.forEach(
        el =>
          new Player({
            id: el.id,
            name: el.name,
            position: el.position
          })
      );

      const HTMLel = document.querySelector(".players-list");
      Player.getAll().forEach(el => {
        HTMLel.innerHTML += `<li>${el.getName()}</li>`;
      });
    });
};
