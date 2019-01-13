import React from 'react';
import { ChatSidebarListItem } from '../';

interface IProps {
	items: string[];
	handleOpenNewDiscussion: (username: string) => void;
}

const ChatSidebarList: React.SFC<IProps> = (props) => (
  <div className="chat__users">
    <ul>
      {props.items.map((item) => (
        <ChatSidebarListItem
          handleOpenNewDiscussion={props.handleOpenNewDiscussion}
          username={item}
          key={item}
        />
      ))}
    </ul>
  </div>
);

export default ChatSidebarList;
