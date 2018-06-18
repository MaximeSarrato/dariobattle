import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import ChatSidebar from './ChatSidebar';
import { connect } from 'react-redux';
import { joinChat } from '../actions/chat';

class Dashboard extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			open: false
		};
	}

	componentDidMount() {
		this.props.joinChat(this.props.username);
	}

	handleClick = () => {
		this.setState({ open: !this.state.open });
	};

	render() {
		console.log(this.state);
		console.log(this);
		return (
			<div>
				<h1>Dashboard</h1>
				<ChatSidebar />
			</div>
		);
	}
}

const mapStateToProps = state => ({
	username: state.auth.username
});

const mapDispatchToProps = dispatch => ({
	joinChat: username => dispatch(joinChat(username))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Dashboard);
