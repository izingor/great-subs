import type { ReactNode } from 'react'
import { ThemeToggle } from './ThemeToggle'

type HeaderProps = {
	readonly children?: ReactNode
}

export const Header = ({ children }: HeaderProps): React.ReactElement => (
	<header className='sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm'>
		<div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
			<div className='flex items-center gap-3'>
				<img src='/logo.svg' alt='Sub Manager' className='h-9 w-9' />
				<span className='text-xl font-bold tracking-tight'>Sub Manager</span>
			</div>
			<div className='flex items-center gap-2'>
				{children}
				<ThemeToggle />
			</div>
		</div>
	</header>
)
