import * as React from 'react';
import ChatSidebar from '../../containers/ChatSidebarContainer';

interface IProps {
  username: string;
  dispatch?: (action: any) => void;
  joinChat(username: string): void;
}

export default class Dashboard extends React.Component<IProps, {}> {
  componentDidMount() {
    this.props.joinChat(this.props.username);
  }

  render() {
    return (
      <React.Fragment>
        <h1>Dashboard</h1>
        <ChatSidebar />
      </React.Fragment>
    );
  }
}
