import React, { Component } from "react";

import { User } from "./types";

type Props = {
  setUser: (user: User) => void
}

type State = {
  users: User[],
  message: string,
}

class GamePicker extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      users: [],
      message: ""
    };
  }

  componentDidMount() {
    fetch('users')
      .then(response => {
        if (response.status !== 200) {
          return this.setState({ users: [], message: "Network error" });
        }
        return response.json();
      })
      .then(data => this.setState({ users: data, message: "" }));
  }

  render() {
    return (
      <div className="row" id="game-picker">
        <div className="col-12">
          <h1>Select your User:</h1>
          <p>{this.state.message}</p>
        </div>

        {this.state.users.map((user) =>
          <div className="col-4 col-md-3" key={user.username}>
            <button className="big-select" onClick={() => this.props.setUser(user)}>{user.screen_name}</button>
          </div>
        )}
      </div>
    );
  }
}

export default GamePicker;