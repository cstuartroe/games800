import React, { Component } from "react";

import ImageSearch from "./ImageSearch";
import ImageSelect from "./ImageSelect";
import Awaiting from "./Awaiting";
import MakeGuesses from "./MakeGuesses";
import Scoreboard from "./Scoreboard";
import { User, GameInstance } from "../types";
import { Submission, Guess } from "./types";

type Props = {
  user: User,
  gameInstance: GameInstance,
}

type State = {
  participants: User[],
  all_submissions: boolean,
  submissions: Submission[],
  guesses: Guess[],
  message: null | string,
}


class FeelinLucky extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      participants: [],
      all_submissions: false,
      submissions: [],
      guesses: [],
      message: null,
    };
  }

  generalizedFetch(uri: string): any {
    return fetch(uri).then(response => {
      if (response.status !== 200) {
        this.setState({
          message: "Network error",
        });

        return {};
      } else {
        return response.json()
      }
    })
  }

  fetchSubmissions() {
    this.generalizedFetch('feelin_lucky/submissions?gameInstance=' + this.props.gameInstance.id)
      .then((data: any) => {
        this.setState({
          all_submissions: data.all_submissions,
          submissions: data.submissions.sort(),
        });
      });

    this.fetchParticipants();
  }

  fetchParticipants() {
    this.generalizedFetch("participants?gameInstance=" + this.props.gameInstance.id)
      .then((data: User[]) => {
        this.setState({
          participants: data
        });
    });
  }

  fetchGuesses() {
    this.generalizedFetch("feelin_lucky/guess?gameInstance=" + this.props.gameInstance.id)
      .then((guesses: Guess[]) => this.setState({ guesses: guesses.sort() }));
  }

  componentDidMount() {
    this.fetchSubmissions();
    this.fetchGuesses();
  }

  render() {
    if (!this.state.all_submissions) {
      const already_searched = this.state.submissions.some(sub => (
        sub.author.username == this.props.user.username
      ));
      const already_chosen = this.state.submissions.some(sub => (
        sub.author.username == this.props.user.username && sub.chosen !== null
      ));

      if (!already_searched) {
        return <ImageSearch
          user={this.props.user}
          gameInstance={this.props.gameInstance}
          fetchSubmissions={this.fetchSubmissions.bind(this)}
        />;

      } else if (!already_chosen) {
        return <ImageSelect
          user={this.props.user}
          gameInstance={this.props.gameInstance}
          submissions={this.state.submissions}
          fetchSubmissions={this.fetchSubmissions.bind(this)}
        />;

      } else {
        const awaiting = this.state.participants.filter(p => (
          !this.state.submissions.some(sub => (
            sub.author.username == p.username && sub.chosen !== null
          ))
        ))
        return <Awaiting
          update={this.fetchSubmissions.bind(this)}
          awaiting={awaiting}
        />;
      }

    } else {
      if (this.state.guesses.length != Math.pow(this.state.submissions.length, 2)) {
        return <MakeGuesses
          user={this.props.user}
          gameInstance={this.props.gameInstance}
          submissions={this.state.submissions}
          fetchGuesses={this.fetchGuesses.bind(this)}
          participants={this.state.participants}
          guesses={this.state.guesses}
        />;

      } else {
        return <Scoreboard
          submissions={this.state.submissions}
          gameInstance={this.props.gameInstance}
          guesses={this.state.guesses}
        />;
      }
    }
  }
}

export default FeelinLucky;