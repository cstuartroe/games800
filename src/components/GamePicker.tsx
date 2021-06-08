import React, { Component } from "react";

import { Game } from "./types";

type Props = {
  setGame: (game: Game) => void,
}

type State = {
  games: Game[],
  message: string,
}

class GamePicker extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      games: ["Feelin' Lucky"],
      message: ""
    };
  }

  render() {
    return (
      <div className="row" id="game-picker">
        <div className="col-12">
          <h1>Select a Game:</h1>
          <p>{this.state.message}</p>
        </div>

        {this.state.games.map((game) =>
          <div className="col-6 col-md-4" key={game}>
            <button className="big-select" onClick={() => this.props.setGame(game)}>{game}</button>
          </div>
        )}
      </div>
    );
  }
}

export default GamePicker;