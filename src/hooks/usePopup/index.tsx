import { FC, useCallback, useContext, createContext, useMemo, useState } from 'react'

import { IAlert } from 'interfaces/IAlert'

interface IPopupContext {
  addPopup: (alert: IAlert) => void
  popups: IAlert[]
  removePopup: (index: number) => void
}

const PopupContext = createContext<IPopupContext>({} as IPopupContext)

export const PopupProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [popups, setPopups] = useState<IAlert[]>([])

  // useCallback/useMemo nao sao cosmeticos aqui: sem eles addPopup muda de
  // identidade a cada render do provider, e todo consumidor com
  // useCallback([addPopup]) + useEffect refaz o fetch a cada popup exibido ou
  // auto-fechado — na tela do produtor isso apagava a quantidade digitada.
  const addPopup = useCallback((alert: IAlert) => {
    const newPopup = { ...alert }
    setPopups(prev => [...prev, newPopup])

    setTimeout(() => {
      // remove este popup, nao "o ultimo": com dois abertos o timer derrubava o errado
      setPopups(prev => prev.filter(p => p !== newPopup))
    }, 5000)
  }, [])

  const removePopup = useCallback((index: number) => {
    setPopups(prev => prev.filter((_, i) => i !== index))
  }, [])

  const value = useMemo(
    () => ({ addPopup, popups, removePopup }),
    [addPopup, popups, removePopup],
  )

  return <PopupContext.Provider value={value}>{children}</PopupContext.Provider>
}

export const usePopup = () => {
  const context = useContext(PopupContext)
  if (!context) {
    throw new Error('usePopup must be used within PopupProvider')
  }
  return context
}

