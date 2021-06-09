import React, { Component } from "react";

import { WaitingList } from "./Awaiting";
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

  haventGuessedOn(imageSubmission: Submission) {
    const { participants, guesses } = this.props;

    const prevGuesses = guesses.filter(guess => guess.imageSubmission.id == imageSubmission.id);

    return participants.filter(p => !(
      prevGuesses.some(guess => (guess.guesser.username == p.username))
      || imageSubmission.author.username == p.username
    ))
  }

  index() {
    let out = 0;
    this.props.submissions.map((sub) => {
      if (this.haventGuessedOn(sub).length == 0) {
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
      user,
      submissions,
      participants,
      fetchGuesses,
    } = this.props;

    if (submissions.length == 0) {
      return <p>Loading...</p>;
    }

    const index = this.index();

    const imageSubmission = submissions[index];
    const isOwnImage = this.props.user.username == imageSubmission.author.username;

    const my_guesses = this.props.guesses.filter(guess => guess.guesser.username == this.props.user.username);
    const alreadyGuessed = my_guesses.some(guess =>
      guess.imageSubmission.id == imageSubmission.id
    )

    const shouldGuess = !(isOwnImage || alreadyGuessed);

    const authorsNotAlreadyGuessed = participants
      .filter(p => !my_guesses.some(guess =>
        guess.author.username == p.username
      ))
      .filter(p => p.username != user.username)
      .sort()

    const searchSubmissionsNotAlreadyGuessed = submissions
      .filter(sub => !my_guesses.some(guess =>
        guess.searchSubmission.id == sub.id
      ))
      .filter(sub => sub.author.username != user.username)
      .sort()

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

      {shouldGuess &&
      <div className="col-6">
        {authorsNotAlreadyGuessed.map((author) =>
          <div key={author.username}>
            <input type="radio" name="author" onClick={() => this.setStateAndSubmit({author})}/>
            <p>{author.screen_name}</p>
          </div>
        )}
      </div>
      }

      {shouldGuess &&
      <div className="col-6">
        {searchSubmissionsNotAlreadyGuessed.map((sub) =>
          <div key={sub.id}>
            <input type="radio" name="search_query" onClick={() => this.setStateAndSubmit({searchSubmission: sub})}/>
            <p>{sub.searchQuery}</p>
          </div>
        )}
      </div>
      }

      {!shouldGuess &&
      <div className="col-12">
        {isOwnImage && <p>You submitted this! Don't tell!</p>}
        <WaitingList
          update={fetchGuesses}
          awaiting={this.haventGuessedOn(imageSubmission)}
        />
      </div>
      }
    </div>;
  }
}

export default MakeGuesses;
