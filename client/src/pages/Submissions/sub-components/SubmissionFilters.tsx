import React, { useRef, useState } from 'react'
import { TextField, MenuItem, Select, InputAdornment, IconButton, styled } from '@mui/material'
import { debounce } from '@mui/material/utils'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import { PageFilters } from '@/components/layouts/PageLayout'
import type { SubmissionsFilter } from '@/types/submission'

const StatusSelect = styled(Select<string>)(({ theme }) => ({
	width: '100%',
	[theme.breakpoints.up('sm')]: {
		width: 180,
	},
}))

interface SubmissionFiltersProps {
	readonly filters: SubmissionsFilter
	readonly onFilterChange: (filters: SubmissionsFilter) => void
}

export const ALL_STATUSES = 'all'

export const SubmissionFilters: React.FC<SubmissionFiltersProps> = ({ filters, onFilterChange }) => {
	const [searchValue, setSearchValue] = useState(filters.search)
	const latestPropsRef = useRef({ filters, onFilterChange })
	latestPropsRef.current = { filters, onFilterChange }

	const previousExternalSearch = useRef(filters.search)
	if (previousExternalSearch.current !== filters.search) {
		previousExternalSearch.current = filters.search
		setSearchValue(filters.search)
	}

	const debouncedSearch = useRef(
		debounce((value: string) => {
			const { filters: currentFilters, onFilterChange: currentOnFilterChange } = latestPropsRef.current
			currentOnFilterChange({ ...currentFilters, search: value, page: 1 })
		}, 500),
	).current

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const { value } = e.target
		setSearchValue(value)
		debouncedSearch(value)
	}

	const handleStatusChange = (status: string): void => {
		onFilterChange({ ...filters, status, page: 1 })
	}

	const clearSearch = (): void => {
		setSearchValue('')
		debouncedSearch.clear()
		onFilterChange({ ...filters, search: '', page: 1 })
	}

	return (
		<PageFilters>
			<StatusSelect
				value={filters.status}
				onChange={(e) => handleStatusChange(e.target.value)}
				size='small'
			>
				<MenuItem value={ALL_STATUSES}>All statuses</MenuItem>
				<MenuItem value='new'>New</MenuItem>
				<MenuItem value='bound'>Bound</MenuItem>
				<MenuItem value='bind_failed'>Failed</MenuItem>
			</StatusSelect>

			<TextField
				placeholder='Search by name…'
				value={searchValue}
				onChange={handleSearchChange}
				size='small'
				fullWidth
				slotProps={{
					input: {
						startAdornment: (
							<InputAdornment position='start'>
								<SearchIcon fontSize='small' />
							</InputAdornment>
						),
						endAdornment: searchValue ? (
							<InputAdornment position='end'>
								<IconButton size='small' onClick={clearSearch} edge='end'>
									<CloseIcon fontSize='small' />
								</IconButton>
							</InputAdornment>
						) : null,
					},
				}}
			/>
		</PageFilters>
	)
}

