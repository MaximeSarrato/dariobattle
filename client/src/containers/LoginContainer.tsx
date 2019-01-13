import { connect } from 'react-redux';
import Login from '../components/Login';
import { startLogin } from '../actions/auth';

export default connect(
  null,
  { startLogin }
)(Login);
