import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

class UserProfile extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		const token = localStorage.getItem('token');
		axios
			.get(`/users/${this.props.uid}`, {
				headers: { 'x-auth': token },
				withCredentials: true
			})
			.then(response => {
				console.log(response);
			})
			.catch(error => {
				console.log(error.response);
			});
	}

	render() {
		return (
			<div>
				<h1>Mon profil </h1>
				<a href="/auth/google">Link my Google Account</a>
				<ul>
					<li>Username: {this.props.username}</li>
				</ul>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	username: state.auth.username,
	uid: state.auth.uid
});

export default connect(mapStateToProps)(UserProfile);
