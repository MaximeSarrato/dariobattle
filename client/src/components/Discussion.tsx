import React from 'react';
import DiscussionListItem from './DiscussionListItem';

const Discussion = props => (
	<div className="discussion">
		{props.items.map(item => <DiscussionListItem key={item} destName={item} />)}
	</div>
);

export default Discussion;
