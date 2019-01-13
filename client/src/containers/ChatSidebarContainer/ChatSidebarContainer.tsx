import { ChatSidebar } from '../../components/Chat';
import { connect } from 'react-redux';
import { IChatState } from '../../reducers/chat';

const mapStateToProps = ({ chat }: { chat: IChatState }) => ({
  users: chat.users
});

export default connect(
  mapStateToProps,
  null
)(ChatSidebar);
