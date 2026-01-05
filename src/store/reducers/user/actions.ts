import { IUserState } from 'interfaces/IUser'

export const updateUser = (payload: Partial<IUserState>) => ({
  type: 'UPDATE_USER',
  payload,
})

