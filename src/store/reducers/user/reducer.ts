import { IUserState } from 'interfaces/IUser'

const INITIAL_STATE: IUserState = {
  isAuthenticated: false,
  userPermissions: [],
  isLoading: true,
  userId: 0,
}

const user = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case 'UPDATE_USER':
      return {
        ...state,
        ...action.payload,
      }
    default:
      return state
  }
}

export default user

