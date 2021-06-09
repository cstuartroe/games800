import React, { Component } from "react";

import Awaiting, { WaitingList } from "./Awaiting";
import { User, GameInstance } from "../types";
import { Submission, Guess } from "./types";

type Props = {
  user: User,
  gameInstance: GameInstance,
  submissions: Submission[],
  fetchGuesses: (callback?: () => void) => void,
  participants: User[],
  guesses: Guess[],
}

type State = {
  message?: string,
  searchSubmission?: Submission,
  author?: User,
  submitting: boolean,
}

class MakeGuesses extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      message: undefined,
      searchSubmission: undefined,
      author: undefined,
      submitting: true,
    };
  }

  componentDidMount() {
    this.props.fetchGuesses(() => this.setState({submitting: false}));
  }

  haventGuessedOn(imageSubmission: Submission) {
    const { participants, guesses } = this.props;

    const prevGuesses = guesses.filter(guess => guess.imageSubmission.id == imageSubmission.id);

    return participants.filter(p => !(
      prevGuesses.some(guess => (guess.guesser.username == p.username))
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

  currentImageSubmission() {
    return this.props.submissions[this.index()];
  }

  setStateAndSubmit(o: {author?: User, searchSubmission?: Submission}) {
    const currentImageSubmission = this.currentImageSubmission();
    const username = this.props.user.username;
    const isCurrentAuthor = currentImageSubmission.author.username == username;

    let data: typeof o = {}
    if ((o.author != undefined) && ((username == o.author.username) == isCurrentAuthor)) {
      data.author = o.author;
    }
    if ((o.searchSubmission != undefined) && ((username == o.searchSubmission.author.username) == isCurrentAuthor)) {
      data.searchSubmission = o.searchSubmission;
    }

    this.setState(data, this.maybeSubmitGuess.bind(this));
  }

  maybeSubmitGuess() {
    const imageSubmission = this.currentImageSubmission();
    const { author, searchSubmission } = this.state;

    if (author == undefined || searchSubmission == undefined) {
      return;
    }

    this.setState({submitting: true})

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
        this.props.fetchGuesses(() => this.setState({submitting: false}));
      }
    });
  }

  render() {
    const {
      user,
      submissions,
      participants,
      guesses,
      fetchGuesses,
    } = this.props;

    const { submitting } = this.state;

    if (submissions.length == 0) {
      return <p>Loading...</p>;
    }

    const imageSubmission = this.currentImageSubmission();

    const my_guesses = guesses.filter(guess => guess.guesser.username == user.username);
    const alreadyGuessed = my_guesses.some(guess =>
      guess.imageSubmission.id == imageSubmission.id
    )

    const authorsNotAlreadyGuessed = participants
      .filter(p => !my_guesses.some(guess =>
        guess.author.username == p.username
      ))
      .sort((u1, u2) => u1.screen_name.localeCompare(u2.screen_name))

    const searchSubmissionsNotAlreadyGuessed = submissions
      .filter(sub => !my_guesses.some(guess =>
        guess.searchSubmission.id == sub.id
      ))
      .sort((s1, s2) => s1.searchQuery.localeCompare(s2.searchQuery))

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

      {!(alreadyGuessed || submitting) &&
      <div className="col-6">
        {authorsNotAlreadyGuessed.map((author) =>
          <div key={author.username}>
            <input
              type="radio"
              name="author"
              checked={this.state.author?.username == author.username}
              readOnly={true}
              onClick={() => this.setStateAndSubmit({author})}
            />
            <p>{author.screen_name}</p>
          </div>
        )}
      </div>
      }

      {!(alreadyGuessed || submitting) &&
      <div className="col-6">
        {searchSubmissionsNotAlreadyGuessed.map((sub) =>
          <div key={sub.id}>
            <input
              type="radio"
              name="search_query"
              checked={this.state.searchSubmission?.id == sub.id}
              readOnly={true}
              onClick={() => this.setStateAndSubmit({searchSubmission: sub})}
            />
            <p>{sub.searchQuery}</p>
          </div>
        )}
      </div>
      }

      {submitting &&
        <div className="col-12">
          <Awaiting awaiting={[]} update={() => {}}/>
        </div>
      }

      {(alreadyGuessed && !submitting) &&
      <div className="col-12">
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
