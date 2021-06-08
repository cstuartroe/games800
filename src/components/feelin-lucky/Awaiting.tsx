import React, { Component } from "react";
import { User } from "../types";

type Props = {
  awaiting: User[],
  update: () => void,
}

type State = {
  loop?: NodeJS.Timeout,
}

class Awaiting extends Component<Props, State> {
  componentDidMount() {
    this.props.update();
    this.setState({ loop: setInterval(this.props.update, 5000)});
  }

  componentWillUnmount() {
    // @ts-ignore
    clearTimeout(this.state.loop);
  }

  render() {
    return <div className="row">
      <div className = "col-12">
        <p>
          {'Waiting for '}
          {this.props.awaiting
            .map(p => p.screen_name)
            .join(", ")
          }
          {'...'}
        </p>
        <img src="/static/img/loading.gif"/>
      </div>
    </div>;
  }
}

export default Awaiting;