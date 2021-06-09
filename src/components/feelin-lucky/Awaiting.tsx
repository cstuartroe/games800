import React, { Component } from "react";
import { User } from "../types";

type Props = {
  awaiting: User[],
  update: () => void,
}

type State = {
  loop?: NodeJS.Timeout,
}

export class WaitingList extends Component<Props, State> {
  componentDidMount() {
    this.props.update();
    this.setState({ loop: setInterval(this.props.update, 5000)});
  }

  componentWillUnmount() {
    // @ts-ignore
    clearTimeout(this.state.loop);
  }

  render() {
    return <p>
      {'Waiting for '}
      {this.props.awaiting
        .map(p => p.screen_name)
        .join(", ")
      }
      {'...'}
    </p>
  }
}

class Awaiting extends Component<Props, {}> {
  render() {
    return <div className="row">
      <div className = "col-12">
        <img src="/static/img/loading.gif"/>
        <WaitingList {...this.props}/>
      </div>
    </div>;
  }
}

export default Awaiting;