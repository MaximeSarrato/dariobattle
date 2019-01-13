import React from 'react';

interface IProps {
  destName: string;
}

interface IState {
  readonly open: boolean;
}

class DiscussionListItem extends React.Component<IProps, IState> {
  readonly state: IState = {
    open: false
	};
	
  constructor(props: IProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({
      open: !this.state.open
    });
  }

  render() {
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
