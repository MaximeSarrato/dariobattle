import Signup from '../components/Signup';
import { connect } from 'react-redux';
import { startLogin } from '../actions/auth';

export default connect(
  undefined,
  { startLogin }
)(Signup);
