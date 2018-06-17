import React from 'react';

const ChatSidebarListItem = props => (
  <li onClick={e => console.log(e.target.textContent)} className="chat__item">
    {props.item}
  </li>
);

export default ChatSidebarListItem;
