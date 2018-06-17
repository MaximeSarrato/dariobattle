export default (state = {}, action) => {
  switch (action.type) {
    case 'POPULATE_USERS': {
      return {
        users: Object.keys(action.users)
      };
    }
    default: {
      return state;
    }
  }
};
