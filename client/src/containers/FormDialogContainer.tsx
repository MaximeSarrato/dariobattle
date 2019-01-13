import { FormDialog } from '../components/Forms';
import { IAuthState } from '../reducers/auth';
import { connect } from 'react-redux';

const mapStateToProps = ({ form, auth }: { form: any; auth: IAuthState }) => ({
  createUsernameForm: form.createUsernameForm,
  hasUsername: !!auth.username
});

export default connect(
  mapStateToProps,
  undefined
)(FormDialog);
