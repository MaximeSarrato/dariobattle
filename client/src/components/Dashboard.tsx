import * as React from 'react';
import ChatSidebar from './ChatSidebar';

interface Props {
	joinChat(username: string): void,
	username: string
}

export default class Dashboard extends React.PureComponent<Props, null> {
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

