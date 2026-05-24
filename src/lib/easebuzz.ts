import crypto from "crypto";

const EASEBUZZ_KEY = process.env.EASEBUZZ_KEY || "";
const EASEBUZZ_SALT = process.env.EASEBUZZ_SALT || "";
const EASEBUZZ_ENV = process.env.EASEBUZZ_ENV || "test"; // 'test' (sandbox) or 'prod' (production)

export const EASEBUZZ_BASE_URL =
  EASEBUZZ_ENV === "prod"
    ? "https://pay.easebuzz.in"
    : "https://testpay.easebuzz.in";

interface InitiatePaymentData {
  txnid: string;
  amount: number | string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  udf6?: string;
  udf7?: string;
  udf8?: string;
  udf9?: string;
  udf10?: string;
}

/**
 * Generates the hash required by Easebuzz to initiate a payment.
 * Sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
 */
export function generateInitiateHash(data: InitiatePaymentData): string {
  const amountStr = parseFloat(data.amount.toString()).toFixed(2);
  
  const hashSequence = [
    EASEBUZZ_KEY.trim(),
    data.txnid.toString().trim(),
    amountStr,
    data.productinfo.trim(),
    data.firstname.trim(),
    data.email.trim(),
    (data.udf1 || "").trim(),
    (data.udf2 || "").trim(),
    (data.udf3 || "").trim(),
    (data.udf4 || "").trim(),
    (data.udf5 || "").trim(),
    (data.udf6 || "").trim(),
    (data.udf7 || "").trim(),
    "", // udf8 is empty for standard checkout
    "", // udf9 is empty for standard checkout
    "", // udf10 is empty for standard checkout
    EASEBUZZ_SALT.trim(),
  ].join("|");

  return crypto.createHash("sha512").update(hashSequence).digest("hex");
}

/**
 * Verifies the callback response hash from Easebuzz.
 * Sequence: salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
 */
export function verifyCallbackHash(responseParams: Record<string, any>): boolean {
  const status = responseParams.status || "";
  const udf10 = responseParams.udf10 || "";
  const udf9 = responseParams.udf9 || "";
  const udf8 = responseParams.udf8 || "";
  const udf7 = responseParams.udf7 || "";
  const udf6 = responseParams.udf6 || "";
  const udf5 = responseParams.udf5 || "";
  const udf4 = responseParams.udf4 || "";
  const udf3 = responseParams.udf3 || "";
  const udf2 = responseParams.udf2 || "";
  const udf1 = responseParams.udf1 || "";
  const email = responseParams.email || "";
  const firstname = responseParams.firstname || "";
  const productinfo = responseParams.productinfo || "";
  const amount = responseParams.amount || "";
  const txnid = responseParams.txnid || "";
  const key = responseParams.key || "";
  const receivedHash = responseParams.hash || "";

  const hashSequence = [
    EASEBUZZ_SALT.trim(),
    status.toString().trim(),
    udf10.toString().trim(),
    udf9.toString().trim(),
    udf8.toString().trim(),
    udf7.toString().trim(),
    udf6.toString().trim(),
    udf5.toString().trim(),
    udf4.toString().trim(),
    udf3.toString().trim(),
    udf2.toString().trim(),
    udf1.toString().trim(),
    email.toString().trim(),
    firstname.toString().trim(),
    productinfo.toString().trim(),
    amount.toString().trim(), // Keep exactly the amount format received from Easebuzz
    txnid.toString().trim(),
    key.toString().trim(),
  ].join("|");

  const calculatedHash = crypto.createHash("sha512").update(hashSequence).digest("hex");

  return calculatedHash.toLowerCase() === receivedHash.toLowerCase();
}

/**
 * Returns configuration details for Easebuzz.
 */
export function getEasebuzzConfig() {
  return {
    key: EASEBUZZ_KEY,
    salt: EASEBUZZ_SALT,
    env: EASEBUZZ_ENV,
    baseUrl: EASEBUZZ_BASE_URL,
  };
}
