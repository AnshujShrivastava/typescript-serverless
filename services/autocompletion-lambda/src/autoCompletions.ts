import * as R from 'ramda'
// eslint-disable-next-line import/no-extraneous-dependencies
import * as AWS from 'aws-sdk'
import * as HttpAmazonESConnector from 'http-aws-es'
import * as elasticsearch from 'elasticsearch'
import { autoCompletionQuery, QueryParams } from './autocompletionQuery'

const host = process.env.ESDomain || 'http://localhost:8000'

const client = new elasticsearch.Client({
  connectionClass: HttpAmazonESConnector,
  hosts: [host],
  awsConfig: AWS.config,
})

const defaultParams: QueryParams = {
  placeOfBusinessId: '',
  query: '',
  from: 0,
  size: 50,
}

const mergeToDefault = (args: any): any => R.merge(defaultParams, args.queryStringParameters)
const pickFields = (args: QueryParams): QueryParams => R.pickAll(Object.keys(defaultParams), args)

export const parseParams = (event): any => {
  return R.pipe(mergeToDefault, pickFields)(event)
}
export const getAutoCompletions = (event): any => {
  const params = parseParams(event)

  return client.search(autoCompletionQuery(params)).then((searchResult: any) => {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          result: {
            total: searchResult.hits.total,
            size: params.size,
            from: params.from,
            hits: R.map(
              (hit) => ({
                // eslint-disable-next-line no-underscore-dangle
                ...hit._source,
              }),
              searchResult.hits.hits,
            ),
          },
        },
        null,
        2,
      ),
    }
  })
}
