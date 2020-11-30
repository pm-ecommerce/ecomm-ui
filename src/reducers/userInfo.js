const userInfo = (state = {userInfo:{},isOnline:false}, action) => {
  switch (action.type) {
    case "SAVE_USER_INFO":
      return action.data;
    case "IS_USER_ONLINE":
      return state;
    case "LOG_OUT":
      return action.data;
    default:
      return state;
  }
};

export default userInfo;
