import React, { Component } from "react";
import { GameInstance, Score } from "../types";
import { Submission, Guess } from "./types";

type Props = {
  submissions: Submission[],
  gameInstance: GameInstance,
  guesses: Guess[],

}

type State = {
  scores: Score[],
  message?: string,
}

class Scoreboard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      scores: []
    };
  }

  componentDidMount() {
    this.fetchScores();
  }

  fetchScores() {
    fetch("scores?gameInstance=" + this.props.gameInstance.id)
    .then(response => {
      if (response.status !== 200) {
        return this.setState({ message: "Network error" });
      }
      return response.json();
    })
    .then(scores => this.setState({scores: scores}));
  }

  render() {
    const boldStyle = {
      fontWeight: 900
    };

    return <div className="row">
      <div className="col-12">
        {this.state.message}
      </div>

      <div className="col-12">
        {this.state.scores.sort((score1, score2) => score2.value - score1.value).map(score =>
          <p key={score.player.username}>
            <span style={boldStyle}>{score.player.screen_name}</span> scored {score.value} points.
          </p>
        )}
      </div>

      {this.props.submissions.map(sub =>
        <div className="col-12" key={sub.id}>
          <img src={sub.chosen?.filename} className="candidate" />

          <p>This picture was submitted by <span style={boldStyle}>{sub.author.screen_name}</span> with
          the search term <span style={boldStyle}>{sub.searchQuery}</span>.</p>

          {this.props.guesses
            .filter(guess => (guess.imageSubmission.id == sub.id) && (guess.guesser.username != sub.author.username))
            .sort((a, b) => a.guesser.screen_name.localeCompare(b.guesser.screen_name))
            .map(guess => (
              <p key={guess.author.username}>
                <span style={boldStyle}>{guess.guesser.screen_name}</span>
                {' guessed that '}
                <span style={boldStyle}>{guess.author.screen_name}</span>
                {' submitted it with the search term '}
                <span style={boldStyle}>{guess.searchSubmission.searchQuery}</span>
                {'.'}
              </p>
            ))}
        </div>
      )}
    </div>;
  }
}

export default Scoreboard;