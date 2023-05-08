// From https://github.com/kintone/js-sdk/tree/master/packages/rest-api-client

type ErrorResponse<T = any> = {
  data: T
  status: number
  statusText: string
  headers: any
}

type SingleErrorResponseData = {
  id: string
  code: string
  message: string
  errors?: any
}
type BulkRequestErrorResponseData = {
  // eslint-disable-next-line
  results: Array<SingleErrorResponseData | {}>
}
type KintoneErrorResponseData = SingleErrorResponseData | BulkRequestErrorResponseData
type KintoneErrorResponse = ErrorResponse<KintoneErrorResponseData>
declare class KintoneRestAPIError extends Error {
  id: string
  code: string
  status: number
  bulkRequestIndex?: number
  headers: any
  errors?: any
  private static findErrorResponseDataWithIndex
  private static buildErrorResponseDateWithIndex
  constructor(error: KintoneErrorResponse)
}

export declare class KintoneAllRecordsError extends Error {
  processedRecordsResult: any
  unprocessedRecords: any[]
  error: KintoneRestAPIError
  errorIndex?: number
  numOfProcessedRecords: number
  numOfAllRecords: number
  private static parseErrorIndex
  private static extractErrorIndex
  private static buildErrorMessage
  constructor(
    processedRecordsResult: any,
    unprocessedRecords: any[],
    numOfAllRecords: number,
    error: KintoneRestAPIError,
    chunkLength: number
  )
}
