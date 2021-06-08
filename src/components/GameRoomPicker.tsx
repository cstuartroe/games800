import React, { Component } from "react";

import { User, GameInstance } from "./types";

type Props = {
  user?: User,
  game?: string,
  setGameInstance: (gameInstance: GameInstance) => void
}

type State = {
  message?: string,
  currentInstanceId: string,
}

class GameRoomPicker extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentInstanceId: "",
    }
  }

  createNewGame() {
    fetch('new_game', {
      method: "POST",
      body: JSON.stringify({
        username: this.props.user?.username,
        game: this.props.game,
      }),
      headers: { "Content-Type": "application/json" }
    }).then(response => {
      if (response.status !== 200) {
        return this.setState({ message: "Network error" });
      }
      return response.json();
    }).then(data => this.props.setGameInstance(data));
  }

  joinGame() {
    fetch('join_game', {
      method: "POST",
      body: JSON.stringify({
        username: this.props.user?.username,
        game: this.props.game,
        gameInstance: this.state.currentInstanceId,
      }),
      headers: { "Content-Type": "application/json" }
    }).then(response => {
      if (response.status !== 200) {
        return this.setState({ message: "Network error" });
      }
      return response.json();
    }).then(data => {
      if (data.accepted) {
        this.props.setGameInstance(data.gameInstance);
      } else {
        this.setState({ message: data.message });
      }
    });
  }

  setGameInstance() {
    if (this.state.currentInstanceId === "") {
      this.createNewGame()
    } else {
      this.joinGame()
    }
  }

  render() {
    return (
      <div className="row" id="game-picker">
        <div className="col-12">
          <h1>Enter your game room, or create a new one:</h1>
          <input type="text" style={{fontSize: "5vh", width: "20vh", fontVariant: "all-small-caps"}}
          onChange={event => {
            this.setState({currentInstanceId: event.target.value, message: ""})
          }}/>
          <p>{this.state.message}</p>
        </div>

        <div className="col-12">
          <button className="big-select" onClick={() => this.setGameInstance()}>
            {this.state.currentInstanceId == "" ? "Create a new game" : "Join"}
          </button>
        </div>
      </div>
    );
  }
}

export default GameRoomPicker;