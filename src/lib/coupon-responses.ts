type CouponResponseBody = {
  status: "SUCCESS" | "FAIL";
  code: string;
  message: string;
  timestamp: string;
  retryable?: boolean;
  retryAfter?: number;
  data?: {
    countryCode?: string;
    supportedCountries?: string[];
  };
};

type FailureTemplate = {
  statusCode: number;
  body: Omit<CouponResponseBody, "timestamp">;
};

const successTemplate: Omit<CouponResponseBody, "timestamp"> = {
  status: "SUCCESS",
  code: "COUPON_ISSUED",
  message: "쿠폰이 발급되었습니다 <br> 삼성닷컴 쿠폰존에서 확인해보세요.",
};

const failureTemplates: FailureTemplate[] = [
  {
    statusCode: 409,
    body: {
      status: "FAIL",
      code: "COUPON_ALREADY_ISSUED",
      message: "이미 쿠폰을 받았어요. <br> 삼성닷컴 쿠폰존을 확인해주세요.",
      retryable: false,
    },
  },
  {
    statusCode: 403,
    body: {
      status: "FAIL",
      code: "NO_SAMSUNG_ACCOUNT",
      message: "삼성닷컴 회원으로 가입되어야 <br> 쿠폰을 받을 수 있습니다.",
      retryable: false,
    },
  },
  {
    statusCode: 410,
    body: {
      status: "FAIL",
      code: "COUPON_PERIOD_EXPIRED",
      message: "아쉽지만, 쿠폰 발급기간이 끝났어요.",
      retryable: false,
    },
  },
  {
    statusCode: 400,
    body: {
      status: "FAIL",
      code: "UNSURPPORTED_COUNTRY",
      message: "한국에서만 받을 수 있는 쿠폰입니다.",
      data: {
        countryCode: "KR",
        supportedCountries: ["KR"],
      },
      retryable: false,
    },
  },
  {
    statusCode: 500,
    body: {
      status: "FAIL",
      code: "INTERNAL_SERVER_ERROR",
      message: "쿠폰 발급 중 오류가 발생했습니다.",
      retryable: true,
      retryAfter: 5000,
    },
  },
  {
    statusCode: 504,
    body: {
      status: "FAIL",
      code: "NETWORK_TIMEOUT",
      message: "네트워크 연결 오류입니다. 잠시 후 다시 시도해주세요",
      retryable: true,
      retryAfter: 5000,
    },
  },
];

export function buildSuccessResponse() {
  return {
    statusCode: 200,
    body: {
      ...successTemplate,
      timestamp: new Date().toISOString(),
    } satisfies CouponResponseBody,
  };
}

export function buildFailureResponse(countryCode?: string) {
  const idx = Math.floor(Math.random() * failureTemplates.length);
  const picked = failureTemplates[idx];

  const payload: CouponResponseBody = {
    ...picked.body,
    timestamp: new Date().toISOString(),
  };

  if (payload.data?.countryCode && countryCode) {
    payload.data.countryCode = countryCode;
  }

  return { statusCode: picked.statusCode, body: payload };
}
