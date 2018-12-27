import React from 'react';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import { subscribeToUsers } from '../sockets';
import ChatSidebarList from './ChatSidebarList';
import Discussion from './Discussion';

class ChatSidebar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			open: false,
			btnText: 'Loading...',
			discussions: []
		};

		subscribeToUsers(this.props.dispatch);
	}

	componentDidUpdate(prevProps) {
		if (this.props.users !== prevProps.users) {
			const nb = this.props.users.length;
			this.setState({
				btnText:
					nb.length > 1 ? `${nb} players connected` : `${nb} player connected`
			});
		}
	}

	handleClick = () => {
		this.setState({ open: !this.state.open });
	};

	handleOpenNewDiscussion = username => {
		console.log('Should open new discussion with ' + username);
		// if (this.state.discussions.indexOf(username) === -1) {
		this.setState({
			discussions: [...this.state.discussions, username]
		});
		// }
	};

	render() {
		console.log('this.state: ', this.state);
		// console.log(this.props);
		// console.log('this.props.users: ', this.props.users);
		return (
			<div>
				{this.state.discussions.length >= 1 && (
					<Discussion items={this.state.discussions} />
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

const mapStateToProps = state => ({
	users: state.chat.users
});

export default connect(
	mapStateToProps,
	null
)(ChatSidebar);
