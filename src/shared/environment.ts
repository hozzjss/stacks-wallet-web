export const BITCOIN_ENABLED = process.env.BITCOIN_ENABLED;
export const BRANCH = process.env.GITHUB_REF;
export const BRANCH_NAME = process.env.GITHUB_HEAD_REF;
export const COINBASE_APP_ID = process.env.COINBASE_APP_ID ?? '';
export const COMMIT_SHA = process.env.GITHUB_SHA;
export const IS_DEV_ENV = process.env.WALLET_ENVIRONMENT === 'development';
export const MOONPAY_API_KEY = process.env.MOONPAY_API_KEY ?? '';
export const IS_TEST_ENV = process.env.TEST_ENV === 'true';
export const SEGMENT_WRITE_KEY = process.env.SEGMENT_WRITE_KEY ?? '';
export const TRANSAK_API_KEY = process.env.TRANSAK_API_KEY ?? '';