import React, { Component } from "react";
import { User, GameInstance } from "../types";
import { Submission, Candidate } from "./types";

type Props = {
  user: User,
  gameInstance: GameInstance,
  submissions: Submission[],
  fetchSubmissions: () => void,
}

type State = {
  message: string | null,
}

class ImageSelect extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
       message: null,
    }
  }

  sendSelection(filename: string) {
    fetch('feelin_lucky/select', {
      method: "POST",
      body: JSON.stringify({
        username: this.props.user.username,
        gameInstance: this.props.gameInstance.id,
        selection: filename,
      }),
      headers: { "Content-Type": "application/json" }
    }).then(response => {
        if (response.status !== 200) {
          return this.setState({ message: "Network error" });
        } else {
          this.props.fetchSubmissions();
        }
      })
  }

  render() {
    let candidates: Candidate[] = [];

    this.props.submissions.map(sub => {
      if (sub.author.username == this.props.user.username) { candidates = sub.candidates; }
    });

    return <div className="row">
      <div className = "col-12">
        <h2>Please select an image:</h2>
        <p>{this.state.message}</p>
      </div>
      {candidates.map(cand =>

        <div className="col-12 col-md-6" key={cand.filename}>
          <img
            src={cand.filename}
            className="candidate"
            alt={cand.filename}
            onClick={() => this.sendSelection(cand.filename)}
          />
        </div>
      )}
    </div>;
  }
}

export default ImageSelect;