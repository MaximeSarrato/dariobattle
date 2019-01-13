import React from 'react';

interface IProps {
  username: string;
  handleOpenNewDiscussion: (username: string) => void;
}

const ChatSidebarListItem: React.FunctionComponent<IProps> = ({
  handleOpenNewDiscussion,
  username
}) => (
  <li
    onClick={(event: any) => handleOpenNewDiscussion(event.target.textContent)}
    className="chat__item"
  >
    {username}
  </li>
);

export default ChatSidebarListItem;
