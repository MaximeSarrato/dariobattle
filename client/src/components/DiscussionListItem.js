import React from 'react';

const DiscussionListItem = props => (
	<div key={props.destName} className="discussion">
		<span>{props.destName}</span>
	</div>
);

export default DiscussionListItem;
