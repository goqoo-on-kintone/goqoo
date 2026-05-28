// kintone 接続先（upload ツール等が参照）。plugin は参照しません。
export default {
  environments: [
    {
      env: 'development',
      host: 'https://example.cybozu.com',
      appId: { sample: 1 },
      auth: { type: 'password' },
    },
  ],
}
