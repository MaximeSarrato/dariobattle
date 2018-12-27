import React from 'react';

const ChatSidebarListItem = props => (
	<li
		onClick={e => props.handleOpenNewDiscussion(e.target.textContent)}
		className="chat__item"
	>
		{props.item}
	</li>
);

export default ChatSidebarListItem;
