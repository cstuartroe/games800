import React, { Component } from "react";
import {User, GameInstance} from "../types";

type Props = {
  user: User,
  gameInstance: GameInstance,
  fetchSubmissions: () => void,
}

type State = {
  currentQuery: string,
  loading: boolean,
  message: string,
}

class ImageSearch extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentQuery: "",
      loading: false,
      message: ""
    };
  }

  sendSearch(query: string) {
    this.setState({loading: true});

    fetch('feelin_lucky/search', {
      method: "POST",
      body: JSON.stringify({
        username: this.props.user.username,
        gameInstance: this.props.gameInstance.id,
        query: query,
      }),
      headers: { "Content-Type": "application/json" }
    }).then(response => {
      if (response.status !== 200) {
        return this.setState({ message: "Network error", loading: false });
      }
    }).then(e => {
      this.props.fetchSubmissions();
      this.setState({loading: false});
    });
  }

  render() {
    return <div className="row">
      <div className = "col-12">
        <h2>Please enter a search term:</h2>
        <input type="text" onChange={event => {this.setState({currentQuery: event.target.value})}}/>
        <button onClick={() => this.sendSearch(this.state.currentQuery)}>Search!</button>
        <p>{this.state.message}</p>
        <img src="/static/img/loading.gif" style={{display: this.state.loading ? "inline-block" : "none"}}/>
      </div>
    </div>;
  }
}

export default ImageSearch;