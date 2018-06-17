export default (state = {}, action) => {
  switch (action.type) {
    case 'LOGIN': {
      return {
        uid: action.uid,
        username: action.username
      };
    }
    case 'LOGOUT': {
      return {};
    }
    case 'ADD_USERNAME': {
      console.log('ADD_USERNAME');
      return {
        ...state,
        username: action.username
      };
    }
    default: {
      return state;
    }
  }
};
