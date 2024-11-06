import {cleanParams, ObjectT} from '@/lib'

export const getQueryParams = <FilterT>(
  props: FetchMultipleDataInputParams<FilterT>,
) => {
  const filters: ObjectT = props.filters ?? {}
  const query = cleanParams(filters)

  const updatedFilter: Record<string, NullableString> = {...query}

  Object.keys(filters).filter(key => {
    if (filters[key] === null) {
      updatedFilter[key] = null
    }
  })

  return cleanParams({
    pageSize: props?.pagination ? props.pagination.per : undefined,
    page: props?.pagination ? props.pagination.page : undefined,
    search: props?.search?.query,
    searchFields: props?.search?.fields
      ? props.search.fields.join(',')
      : undefined,
    query: Object.keys(updatedFilter).length
      ? JSON.stringify(updatedFilter)
      : undefined,
    ...(props?.sorter ?? {}),
    populate: props.populate ? props.populate.join(',') : undefined,
  })
}
