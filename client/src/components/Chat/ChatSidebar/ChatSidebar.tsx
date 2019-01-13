import React from 'react';
import Button from '@material-ui/core/Button';
import { subscribeToUsers } from '../../../sockets';
import { ChatSidebarList, DiscussionList } from '../';

interface IProps {
  users: string[];
  dispatch?: (action: any) => void;
}

interface IState {
  readonly open: boolean;
  readonly btnText: string;
  readonly discussions: string[];
}

export default class ChatSidebar extends React.Component<IProps, IState> {
  readonly state: IState = {
    open: false,
    btnText: 'Loading...',
    discussions: []
  };
  constructor(props: IProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleOpenNewDiscussion = this.handleOpenNewDiscussion.bind(this);
    subscribeToUsers(this.props.dispatch);
  }

  componentDidUpdate(prevProps: IProps) {
    if (this.props.users !== prevProps.users) {
      const nb = this.props.users.length;
      this.setState({
        btnText: nb > 1 ? `${nb} players connected` : `${nb} player connected`
      });
    }
  }

  handleClick() {
    this.setState({ open: !this.state.open });
  }

  handleOpenNewDiscussion(username: string) {
    this.setState({
      discussions: [...this.state.discussions, username]
    });
  }

  render() {
    return (
      <div>
        {this.state.discussions.length >= 1 && (
          <DiscussionList items={this.state.discussions} />
        )}
        <div className="chat">
          {this.state.open && (
            <div className="chat__users">
              <ChatSidebarList
                handleOpenNewDiscussion={this.handleOpenNewDiscussion}
                items={this.props.users}
              />
            </div>
          )}
          <div onClick={this.handleClick} className="chat__summary">
            <Button className="chat__summary__btn">{this.state.btnText}</Button>
          </div>
        </div>
      </div>
    );
  }
}
