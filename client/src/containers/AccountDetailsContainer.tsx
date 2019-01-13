import AccountDetails from '../components/AccountDetails';
import { connect } from 'react-redux';
import { IAuthState } from '../reducers/auth';

const mapStateToProps = ({ auth }: { auth: IAuthState }) => ({
  username: auth.username,
  uid: auth.uid
});

export default connect(
  mapStateToProps,
  null
)(AccountDetails);
