import { BrandProvider, useBrand } from './context/BrandContext'
import OpeningScreen from './screens/OpeningScreen'
import CompleteBrand from './screens/CompleteBrand'
import StudioWizard from './screens/StudioWizard'
import GenerateScreen from './screens/GenerateScreen'

function Router() {
  const { screen } = useBrand()

  switch (screen) {
    case 'opening':
      return <OpeningScreen />
    case 'complete-brand':
      return <CompleteBrand />
    case 'studio':
      return <StudioWizard />
    case 'generate':
      return <GenerateScreen />
    default:
      return <OpeningScreen />
  }
}

export default function App() {
  return (
    <BrandProvider>
      <Router />
    </BrandProvider>
  )
}
