/* Player Object */
class Player {
  /* Array of ALL Players */
  /* LATER: One Idea to Optimize would be to use a Hash instead of an Array */
  static all = [];

  /* Constructor Method */
  constructor(args) {
    this.id = args.id;
    this.name = args.name;
    this.position = args.position;
    this.games = [];
    Player.all.push(this);
  }

  getID = () => {
    return this.id;
  };

  /* Getter Method for Player Name */
  getName = () => {
    return this.name;
  };

  getTodaysOpponent = () => {
    return this.getGames()[this.getGames().length - 1].opponent;
  };

  /* Getter Method for Player Games */
  getGames = () => {
    let gamesArray = [...this.games];
    gamesArray.reverse();
    return gamesArray;
  };

  setGames = games => {
    this.games = games;
  };

  /* Static Method to Get ALL Players Instances */
  static getAll = () => {
    return Player.all;
  };

  static getLastNPlayers = number => {
    return Player.getAll().slice(
      Player.getAll().length - number,
      Player.getAll().length
    );
  };

  /* Static Method to Get ALL Players with a Certain Position */
  static getPosition = position => {
    return Player.all.filter(el => {
      return el.position === position;
    });
  };

  /* Getter Method to Retrieve ALL Games Against a Certain Team */
  getGamesAgainst = team => {
    let gamesArray = [...this.games];
    gamesArray.reverse();

    return gamesArray.filter(el => {
      return el.opponent === team;
    });
  };

  static findByID = id => {
    return Player.getAll().find(function(element) {
      return element.id == id;
    });
  };
}
