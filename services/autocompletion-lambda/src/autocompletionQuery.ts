import { SearchParams } from 'elasticsearch'

export interface QueryParams {
  placeOfBusinessId: string
  query: string
  from?: number
  size?: number
}

export const autoCompletionQuery = (params: QueryParams): SearchParams => {
  const searchObj: SearchParams = {
    body: {
      query: {
        bool: {
          must: [
            {
              match: {
                placeOfBusinessId: params.placeOfBusinessId,
              },
            },
            {
              wildcard: {
                searchString: `${params.query}*`,
              },
            },
            {
              range: {
                hits: {
                  gte: 1,
                },
              },
            },
          ],
        },
      },
    },
  }
  return searchObj
}
export default autoCompletionQuery
