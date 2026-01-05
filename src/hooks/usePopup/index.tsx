import { FC, useContext, createContext, useState } from 'react'

import { IAlert } from 'interfaces/IAlert'

interface IPopupContext {
  addPopup: (alert: IAlert) => void
  popups: IAlert[]
  removePopup: (index: number) => void
}

const PopupContext = createContext<IPopupContext>({} as IPopupContext)

export const PopupProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [popups, setPopups] = useState<IAlert[]>([])

  const addPopup = (alert: IAlert) => {
    const newPopup = { ...alert }
    setPopups(prev => [...prev, newPopup])

    setTimeout(() => {
      setPopups(prev => prev.filter((_, index) => index !== prev.length - 1))
    }, 5000)
  }

  const removePopup = (index: number) => {
    setPopups(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <PopupContext.Provider value={{ addPopup, popups, removePopup }}>
      {children}
    </PopupContext.Provider>
  )
}

export const usePopup = () => {
  const context = useContext(PopupContext)
  if (!context) {
    throw new Error('usePopup must be used within PopupProvider')
  }
  return context
}

