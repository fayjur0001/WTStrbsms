const nowPaymentsApiUrl =
  process.env.NODE_ENV === "production"
    ? "https://api.nowpayments.io/v1"
    : "https://api-sandbox.nowpayments.io/v1";

export default nowPaymentsApiUrl;
