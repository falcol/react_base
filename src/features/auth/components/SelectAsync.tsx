import { Select, Spin } from 'antd'
import debounce from 'lodash/debounce'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { axiosPrivate } from '@/libs/axios'

export interface OptionType {
  value: string | number
  label: string
}

interface SelectAsyncAntdProps {
  apiUrl: string
  value?: OptionType | null
  onChange?: (option: OptionType | null) => void
  placeholder?: string
  disabled?: boolean
  name?: string
  searchField?: string
  valueField?: string
  labelField?: string
  style?: React.CSSProperties
  className?: string
  allowClear?: boolean
}

interface ApiResponse {
  data: Array<Record<string, any>>
  pagination: {
    current_page: number
    per_page: number
    total_items: number
    total_pages: number
  }
}

const SelectAsyncAntd = ({
  apiUrl,
  value,
  onChange,
  placeholder = 'Select',
  disabled = false,
  name = 'select',
  searchField = 'search',
  valueField = 'value',
  labelField = 'label',
  style = { width: '100%' },
  className = '',
  allowClear = true,
}: SelectAsyncAntdProps) => {
  const [options, setOptions] = useState<OptionType[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const fetchedRef = useRef(false)
  const processedValueRef = useRef<Set<string | number>>(new Set())

  const fetchOptions = useCallback(
    async (searchTerm: string, pageNum: number, isLoadMore = false) => {
      try {
        setLoading(true)
        const params: Record<string, any> = {
          page: pageNum,
          page_size: import.meta.env.VITE_DEFAULT_SELECT_SIZE,
        }

        if (searchTerm) {
          params[searchField] = searchTerm
        }

        const response = await axiosPrivate.get<ApiResponse>(apiUrl, { params })
        const { data, pagination } = response.data

        const newOptions = data.map((item) => ({
          value: item[valueField],
          label: item[labelField] || item[valueField],
        }))

        if (isLoadMore) {
          setOptions((prev) => [...prev, ...newOptions])
        } else {
          setOptions(newOptions)
        }

        setHasMore(pagination.current_page < pagination.total_pages)
      } catch (error) {
        console.error('Error fetching options:', error)
      } finally {
        setLoading(false)
      }
    },
    [apiUrl, searchField, valueField, labelField],
  )

  // Fetch initial options
  useEffect(() => {
    // Only fetch once when component mounts
    if (!fetchedRef.current) {
      fetchOptions('', 1)
      fetchedRef.current = true
    }
  }, [fetchOptions])

  // Add this effect to fetch the label when only value is available
  useEffect(() => {
    const fetchOptionDetail = async () => {
      if (
        !value?.value ||
        options.some((opt) => opt.value === value.value) ||
        processedValueRef.current.has(value.value)
      ) {
        return
      }

      try {
        processedValueRef.current.add(value.value) // Mark as processed
        setLoading(true)
        const params: Record<string, any> = {
          page: 1,
          page_size: import.meta.env.VITE_DEFAULT_SELECT_SIZE,
          [valueField]: value.value, // Search directly by value field
        }

        const response = await axiosPrivate.get<ApiResponse>(apiUrl, { params })

        if (response.data.data.length > 0) {
          const newOptions = response.data.data.map((item) => ({
            value: item[valueField],
            label: item[labelField] || item[valueField],
          }))

          setOptions((prev) => {
            const uniqueOptions = [...prev]
            newOptions.forEach((newOpt) => {
              if (!uniqueOptions.some((opt) => opt.value === newOpt.value)) {
                uniqueOptions.push(newOpt)
              }
            })
            return uniqueOptions
          })
        }
      } catch (error) {
        console.error('Error fetching option detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOptionDetail()
  }, [value, apiUrl, valueField, labelField])

  // Handle search with debounce
  const debouncedFetch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        setPage(1)
        fetchOptions(searchTerm, 1)
      }, 300),
    [fetchOptions],
  )

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm)
    debouncedFetch(searchTerm)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    if (
      !loading &&
      hasMore &&
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 100
    ) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchOptions(search, nextPage, true)
    }
  }

  const handleChange = (selectedValue: string | null, option: any) => {
    if (onChange) {
      if (selectedValue) {
        onChange(option)
      } else {
        onChange(null)
      }
    }
  }

  return (
    <Select
      showSearch
      value={value?.value as string}
      onChange={handleChange}
      onSearch={handleSearch}
      placeholder={placeholder}
      disabled={disabled}
      filterOption={false}
      notFoundContent={loading ? <Spin size="large" /> : null}
      loading={loading}
      options={options}
      style={style}
      className={className}
      allowClear={allowClear}
      onPopupScroll={handleScroll}
      optionFilterProp="label"
    />
  )
}

export default SelectAsyncAntd
