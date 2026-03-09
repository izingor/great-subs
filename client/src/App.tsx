import { ThemeProvider } from 'next-themes'
import { Provider } from 'react-redux'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/layout/Header'
import { SubmissionsPage } from '@/pages/Submissions/SubmissionsPage'
import { store } from '@/store/store'

const App = (): React.ReactElement => (
	<Provider store={store}>
		<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
			<div className='min-h-screen bg-background text-foreground transition-colors'>
				<Header />
				<main>
					<SubmissionsPage />
				</main>
			</div>
			<Toaster richColors closeButton position='bottom-right' />
		</ThemeProvider>
	</Provider>
)

export default App
