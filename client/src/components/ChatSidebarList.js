import React from 'react';
import ChatSidebarListItem from './ChatSidebarListItem';

const ChatSidebarList = props => (
  <div className="chat__users">
    <ul>
      {props.items.map(item => <ChatSidebarListItem item={item} key={item} />)}
    </ul>
  </div>
);

export default ChatSidebarList;
