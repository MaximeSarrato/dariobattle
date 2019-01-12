import Dashboard from '../components/Dashboard';
import { connect } from 'react-redux';
import { joinChat } from '../actions/chat';
import { AuthState } from '../reducers/auth';

const mapStateToProps = ({ auth }: { auth: AuthState }) => ({
  username: auth.username
});

export default connect(
  mapStateToProps,
  { joinChat }
)(Dashboard);
