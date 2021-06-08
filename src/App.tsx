import React, { Component } from "react";

import "../static/scss/main.scss";

import TopMenu from "./components/TopMenu";
import UserLogin from "./components/UserLogin";
import GamePicker from "./components/GamePicker";
import GameRoomPicker from "./components/GameRoomPicker";

import FeelinLucky from "./components/feelin-lucky/FeelinLucky"

import { User, GameInstance } from "./components/types";

type State = {
  user?: User,
  game?: string | GameInstance,
}

export default class App extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      user: undefined,
      game: undefined,
    };
  }

  bodyElem() {
    const { user, game } = this.state;

    if (user === undefined) {
      return <UserLogin setUser={user => this.setState({user})} />;

    } else if (game === undefined) {
      return <GamePicker setGame={(game: string) => this.setState({game})} />;

    } else if (typeof game === "string") {
      return <GameRoomPicker
        {...{ user, game }}
        setGameInstance={(game: GameInstance) => this.setState({game})}
      />;

    } else if (game.game === "Feelin' Lucky") {
      return <FeelinLucky {...{ user, gameInstance: game }}/>;

    } else {
      return <p>Unknown game.</p>;
    }
  }

  render() {
    return (
      <div className="container">
        <TopMenu user={this.state.user} game={this.state.game}/>
        { this.bodyElem() }
      </div>
    );
  }
}
