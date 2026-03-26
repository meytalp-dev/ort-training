import { createContext, useContext, useState } from 'react'

const BrandContext = createContext()

export function BrandProvider({ children }) {
  const [brand, setBrand] = useState(null)
  const [logo, setLogo] = useState(null)
  const [screen, setScreen] = useState('opening')

  const navigate = (screenName) => {
    setScreen(screenName)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <BrandContext.Provider value={{ brand, setBrand, logo, setLogo, screen, navigate }}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand() {
  const context = useContext(BrandContext)
  if (!context) throw new Error('useBrand must be used within BrandProvider')
  return context
}
