import { combineReducers } from 'redux'

import user from './reducers/user/reducer'

export default combineReducers({
  user,
})

export interface IState {
  user: {
    isAuthenticated: boolean
    userPermissions: string[]
    isLoading: boolean
    userId: number
  }
}

