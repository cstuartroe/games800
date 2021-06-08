import React, { Component } from "react";

import { User, GameInstance } from "./types";

type Props = {
  user?: User,
  game?: string | GameInstance,
}

class TopMenu extends Component<Props> {
  gameName() {
    let { game } = this.props;

    if (game === undefined) {
      return "-";
    } else if (typeof game === "string") {
      return game;
    } else {
      return game.game;
    }
  }

  gameId () {
    let { game } = this.props;

    if (game === undefined) {
      return "-";
    } else if (typeof game === "string") {
      return "-";
    } else {
      return game.id;
    }
  }

  render() {
    return (
      <div className="row" id="top-menu">
        <div className="col-4">
          <h2>{this.props.user?.screen_name || "-"}</h2>
        </div>
        <div className="col-4">
          <h2>{this.gameName()}</h2>
        </div>
        <div className="col-4">
          <h2>{this.gameId()}</h2>
        </div>
      </div>
    );
  }
}

export default TopMenu;