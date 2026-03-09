import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type TypographyProps = HTMLAttributes<HTMLElement> & {
	readonly children: ReactNode
}

export const H1 = ({ className, children, ...props }: TypographyProps): React.ReactElement => (
	<h1 className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', className)} {...props}>
		{children}
	</h1>
)

export const H2 = ({ className, children, ...props }: TypographyProps): React.ReactElement => (
	<h2
		className={cn('scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0', className)}
		{...props}
	>
		{children}
	</h2>
)

export const H3 = ({ className, children, ...props }: TypographyProps): React.ReactElement => (
	<h3 className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)} {...props}>
		{children}
	</h3>
)

export const P = ({ className, children, ...props }: TypographyProps): React.ReactElement => (
	<p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)} {...props}>
		{children}
	</p>
)

export const Subtitle = ({ className, children, ...props }: TypographyProps): React.ReactElement => (
	<p className={cn('text-lg text-muted-foreground', className)} {...props}>
		{children}
	</p>
)
