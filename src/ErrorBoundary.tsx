import React from "react";
import Heading from "./Heading";
import Layout from "./Layout";

interface ErrorBoundaryState {
  has_error: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { has_error: false };

  componentDidCatch(): void {
    this.setState({ has_error: true });
  }

  render(): React.ReactNode {
    if (this.state.has_error) {
      return (
        <Layout>
          <Heading text="Sad times :(" href="/" />
          <div className="columns">
            <img
              className="column col-6"
              style={{ height: "100%" }}
              src="/sad_panda.gif"
              alt="sad_panda"
            />
            <pre
              className="code column col-6"
              style={{ wordWrap: "break-word" }}
            />
          </div>
        </Layout>
      );
    }
    return this.props.children;
  }
}
