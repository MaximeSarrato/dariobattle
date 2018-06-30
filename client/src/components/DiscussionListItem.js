import React from 'react';

class DiscussionListItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			open: false
		};
	}

	handleClick = () => {
		this.setState({
			open: !this.state.open
		});
	};

	render() {
		console.log(this.state);
		return (
			<div className="discussion__item">
				{this.state.open && (
					<div style={{ height: '10rem' }}>
						Hello World!
						<input className="discussion__item__input" type="text" />
					</div>
				)}
				<div onClick={this.handleClick} className="discussion__label">
					<span>{this.props.destName}</span>
				</div>
			</div>
		);
	}
}

export default DiscussionListItem;
