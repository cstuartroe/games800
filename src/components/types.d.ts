export type User = {
  username: string,
  screen_name: string,
}

export type Game = string

export type GameInstance = {
  id: number,
  game: Game,
  participants: User[],
  accepting_joins: boolean,
}

export type Score = {
  player: User,
  gameInstance: GameInstance,
  value: number,
}