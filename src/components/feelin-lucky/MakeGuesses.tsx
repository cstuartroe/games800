import React, { Component } from "react";

import Awaiting from "./Awaiting";
import { User, GameInstance } from "../types";
import { Submission, Guess } from "./types";

type Props = {
  user: User,
  gameInstance: GameInstance,
  submissions: Submission[],
  fetchGuesses: () => void,
  participants: User[],
  guesses: Guess[],
}

type State = {
  message?: string,
  searchSubmission?: Submission,
  author?: User,
}

class MakeGuesses extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      message: undefined,
      searchSubmission: undefined,
      author: undefined,
    };
  }

  index() {
    let out = 0;
    this.props.guesses.map((guess) => {
      if (guess.guesser.username == this.props.user.username) {
        out++;
      }
    });

    return out;
  }

  setStateAndSubmit(o: {author?: User, searchSubmission?: Submission}) {
    this.setState(o, () => {
      if (this.state.author != undefined && this.state.searchSubmission != undefined) {
        this.submitGuess();
      }
    });
  }

  submitGuess() {
    const imageSubmission = this.props.submissions[this.index()];
    const { author, searchSubmission } = this.state;

    if (typeof author == "undefined" || typeof searchSubmission == "undefined") {
      return;
    }

    fetch("feelin_lucky/guess", {
      method: "POST",
      body: JSON.stringify({
        guesser: this.props.user.username,
        author: author.username,
        imageSubmission: imageSubmission.id,
        searchSubmission: searchSubmission.id,
      }),
      headers: { "Content-Type": "application/json" }
    }).then(response => {
      if (response.status !== 200) {
        this.setState({ message: "Network error" });
      } else {
        this.setState({
          author: undefined,
          searchSubmission: undefined,
        });
        this.props.fetchGuesses();
      }
    });
  }

  render() {
    const {
      submissions,
      participants,
      guesses,
      fetchGuesses,
    } = this.props;

    if (submissions.length == 0) {
      return <p>Loading...</p>;
    }

    const index = this.index();

    if (index > 0) {
      const prevImageSubmission = submissions[index-1];

      const prevGuesses = guesses.filter(guess => guess.imageSubmission.id == prevImageSubmission.id);

      if (prevGuesses.length != participants.length) {
        const awaiting = participants.filter(p => !prevGuesses.some(guess => (
          guess.guesser.username == p.username
        )))
        return <Awaiting
          update={fetchGuesses}
          awaiting={awaiting}
        />;
      }
    }

    const imageSubmission = submissions[index];

    const my_guesses = this.props.guesses.filter(guess => guess.guesser.username == this.props.user.username);
    const authors_already_guessed = my_guesses.map(guess => guess.author.username);
    const queries_already_guessed = my_guesses.map(guess => guess.searchSubmission.id);

    return <div className="row">
      <div className = "col-0 col-sm-1 col-md-2 col-lg-3"/>
      <div className = "col-12 col-sm-10 col-md-8 col-lg-6">
        <img
          src={imageSubmission.chosen?.filename}
          className="candidate"
          style={{margin: 0}}
        />
        <p>{this.state.message}</p>
      </div>
      <div className = "col-0 col-sm-1 col-md-2 col-lg-3"/>

      <div className = "col-6">
        {participants.filter(p => !authors_already_guessed.includes(p.username)).sort().map((p) =>
          <div key={p.username}>
            <input type="radio" name="author" onClick={() => this.setStateAndSubmit({author: p})} />
            <p>{p.screen_name}</p>
          </div>
        )}
      </div>

      <div className = "col-6">
        {submissions.filter(sub => !queries_already_guessed.includes(sub.id)).sort().map((sub) =>
          <div key={sub.id}>
            <input type="radio" name="search_query"  onClick={() => this.setStateAndSubmit({searchSubmission: sub})}/>
            <p>{sub.searchQuery}</p>
          </div>
        )}
      </div>
    </div>;
  }
}

export default MakeGuesses;
