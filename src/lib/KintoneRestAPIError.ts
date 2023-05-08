class KintoneRestAPIError extends Error {}

export class KintoneAllRecordsError extends Error {
  constructor(
    public processedRecordsResult: any,
    public unprocessedRecords: any[],
    public numOfAllRecords: number,
    public error: KintoneRestAPIError,
    public chunkLength: number
  ) {
    super()
  }
}
