/* Player Object */
class Player {
  /* Array of ALL Players */
  static all = [];

  /* Constructor Method */
  constructor(args) {
    this.id = args.id;
    this.name = args.name;
    this.position = args.position;
    this.games = args.games;
    Player.all.push(this);
  }

  /* Getter Method for Player Name */
  getName = () => {
    return this.name;
  };

  /* Getter Method for Player Games */
  getGames = () => {
    return this.games.reverse();
  };

  /* Static Method to Get ALL Players Instances */
  static getAll = () => {
    return Player.all;
  };

  /* Static Method to Get ALL Players with a Certain Position */
  static getPosition = position => {
    return Player.all.filter(el => {
      return el.position === position;
    });
  };

  /* Getter Method to Retrieve ALL Games Against a Certain Team */
  getGamesAgainst = team => {
    return this.games.filter(el => {
      return el.opponent === team;
    });
  };
}
