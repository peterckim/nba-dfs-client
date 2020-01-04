class Player {
  static all = [];
  constructor(args) {
    this.id = args.id;
    this.name = args.name;
    this.position = args.position;
    this.games = args.games;
    Player.all.push(this);
  }

  getName = () => {
    return this.name;
  };

  getGames = () => {
    return this.games.reverse();
  };

  addGame = game => {
    this.games.push(game);
  };

  static getAll = () => {
    return Player.all;
  };

  static getPosition = position => {
    return Player.all.filter(el => {
      return el.position === position;
    });
  };

  getGamesAgainst = team => {
    return this.games.filter(el => {
      return el.opponent === team;
    });
  };
}
