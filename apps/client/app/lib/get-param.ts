import { cleanParams, type ObjectT } from "./remove-nulls.ts";

export const getQueryParams = <FilterT>(
  props: FetchMultipleDataInputParams<FilterT>,
) => {
  const filters: ObjectT = props.filters ?? {};
  const query = cleanParams(filters);

  const updatedFilter: Record<string, Nullable<string>> = { ...query };

  return cleanParams({
    pageSize: props.pagination ? props.pagination.per : undefined,
    page: props.pagination ? props.pagination.page : undefined,
    search: props.search?.query,
    searchFields: props.search?.fields
      ? props.search.fields.join(",")
      : undefined,
    ...(props.sorter ?? {}),
    populate: props.populate ? props.populate.join(",") : undefined,
    ...updatedFilter,
  });
};
