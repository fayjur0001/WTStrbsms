import db from "@/db";
import { SiteOptionModel } from "@/db/schema";

class HostUrl {
  static namea: string = "host-url";
  static async get(): Promise<string> {
    const r = await get(HostUrl.namea);
    return r || "";
  }
  static async set(value: string) {
    await set(HostUrl.namea, value);
  }
}

const TransactionCut = {
  OneTime: {
    name: "transaction-cut-one-time",
    get: async function (): Promise<number> {
      return Number(await get(this.name)) || 0;
    },
    set: async function (value: number) {
      await set(this.name, String(value));
    },
  },
  LongTerm: {
    short: {
      name: "transaction-cut-long-term-short",
      get: async function (): Promise<number> {
        return Number(await get(this.name)) || 0;
      },
      set: async function (value: number) {
        await set(this.name, String(value));
      },
    },
    regular: {
      name: "transaction-cut-long-term-regular",
      get: async function (): Promise<number> {
        return Number(await get(this.name)) || 0;
      },
      set: async function (value: number) {
        await set(this.name, String(value));
      },
    },
    unlimited: {
      name: "transaction-cut-long-term-unlimited",
      get: async function (): Promise<number> {
        return Number(await get(this.name)) || 0;
      },
      set: async function (value: number) {
        await set(this.name, String(value));
      },
    },
  },
  Proxy: {
    shared: {
      day: {
        name: "transaction-cut-proxy-shared-day",
        get: async function (): Promise<number> {
          return Number(await get(this.name)) || 0;
        },
        set: async function (value: number) {
          await set(this.name, String(value));
        },
      },
      week: {
        name: "transaction-cut-proxy-shared-week",
        get: async function (): Promise<number> {
          return Number(await get(this.name)) || 0;
        },
        set: async function (value: number) {
          await set(this.name, String(value));
        },
      },
      month: {
        name: "transaction-cut-proxy-shared-month",
        get: async function (): Promise<number> {
          return Number(await get(this.name)) || 0;
        },
        set: async function (value: number) {
          await set(this.name, String(value));
        },
      },
    },
    exclusive: {
      day: {
        name: "transaction-cut-proxy-exclusive-day",
        get: async function (): Promise<number> {
          return Number(await get(this.name)) || 0;
        },
        set: async function (value: number) {
          await set(this.name, String(value));
        },
      },
      week: {
        name: "transaction-cut-proxy-exclusive-week",
        get: async function (): Promise<number> {
          return Number(await get(this.name)) || 0;
        },
        set: async function (value: number) {
          await set(this.name, String(value));
        },
      },
      month: {
        name: "transaction-cut-proxy-exclusive-month",
        get: async function (): Promise<number> {
          return Number(await get(this.name)) || 0;
        },
        set: async function (value: number) {
          await set(this.name, String(value));
        },
      },
    },
  },
  Device: {
    day: {
      name: "transaction-cut-device-day",
      get: async function (): Promise<number> {
        return Number(await get(this.name)) || 0;
      },
      set: async function (value: number) {
        await set(this.name, String(value));
      },
    },
    week: {
      name: "transaction-cut-device-week",
      get: async function (): Promise<number> {
        return Number(await get(this.name)) || 0;
      },
      set: async function (value: number) {
        await set(this.name, String(value));
      },
    },
    month: {
      name: "transaction-cut-device-month",
      get: async function (): Promise<number> {
        return Number(await get(this.name)) || 0;
      },
      set: async function (value: number) {
        await set(this.name, String(value));
      },
    },
  },
};

class SiteName {
  static namea: string = "site-name";

  static async get(): Promise<string> {
    const r = await get(SiteName.namea);
    return r || "DrkSMS";
  }

  static async set(value: string) {
    await set(SiteName.namea, value);
  }
}

class ApiUser {
  static namea: string = "api-user";

  static async get(): Promise<string> {
    const r = await get(ApiUser.namea);
    return r || "";
  }

  static async set(value: string) {
    await set(ApiUser.namea, value);
  }
}

class ApiKey {
  static namea: string = "api-key";

  static async get(): Promise<string> {
    const r = await get(ApiKey.namea);
    return r || "";
  }

  static async set(value: string) {
    await set(ApiKey.namea, value);
  }
}

class TOS {
  static namea: string = "tos";

  static async get(): Promise<string> {
    const r = await get(TOS.namea);
    return r || "";
  }

  static async set(value: string) {
    await set(TOS.namea, value);
  }
}

class SiteMode {
  static namea: string = "site-mode";

  static async get(): Promise<string> {
    return (await get(SiteMode.namea)) || "production";
  }

  static async set(value: string) {
    await set(SiteMode.namea, value);
  }
}

class Notice {
  static namea: string = "notice";

  static async get(): Promise<string> {
    const r = await get(Notice.namea);
    return r || "";
  }

  static async set(value: string) {
    await set(Notice.namea, value);
  }
}

type ProxyPriceValue = {
  hour: number;
  day: number;
  week: number;
  month: number;
};

const proxyPrice = {
  set: async function (value: ProxyPriceValue, name: string) {
    await set(name, `${value.hour};${value.day};${value.week};${value.month}`);
  },
  get: async function (name: string): Promise<ProxyPriceValue> {
    const [hour, day, week, month] = await get(name).then((r) => {
      const data = r?.split(";");
      if (!data || data.length < 4) return [0, 0, 0, 0];
      return [
        Number(data[0]),
        Number(data[1]),
        Number(data[2]),
        Number(data[3]),
      ];
    });
    return {
      hour,
      day,
      week,
      month,
    };
  },
};

const exclusiveProxyPrice = {
  name: "exclusive-proxy-price",
  set: async function (value: ProxyPriceValue) {
    await proxyPrice.set(value, this.name);
  },
  get: async function (): Promise<ProxyPriceValue> {
    return proxyPrice.get(this.name);
  },
};

const sharedProxyPrice = {
  name: "shared-proxy-price",
  set: async function (value: ProxyPriceValue) {
    await proxyPrice.set(value, this.name);
  },
  get: async function (): Promise<ProxyPriceValue> {
    return proxyPrice.get(this.name);
  },
};

const Payment = {
  callbackSecret: {
    name: "nowpayments-callback-secret",
    get: async function (): Promise<string> {
      return await get(this.name).then((r) => r || "");
    },
    set: async function (value: string) {
      await set(this.name, value);
    },
  },
  apiKey: {
    name: "nowpayments-api-key",
    get: async function (): Promise<string> {
      return await get(this.name).then((r) => r || "");
    },
    set: async function (value: string) {
      await set(this.name, value);
    },
  },
};

const ProviderCallbackSecret = {
  name: "provider-callback-secret",
  get: async function (): Promise<string> {
    return await get(this.name).then((r) => r || "");
  },
  set: async function (value: string) {
    await set(this.name, value);
  },
};

const Devices = {
  login: {
    name: "devices-login",
    get: async function (): Promise<string> {
      return await get(this.name).then((r) => r || "");
    },
    set: async function (value: string) {
      await set(this.name, value);
    },
  },
  password: {
    name: "devices-password",
    get: async function (): Promise<string> {
      return await get(this.name).then((r) => r || "");
    },
    set: async function (value: string) {
      await set(this.name, value);
    },
  },
};

export default class SiteOptions {
  static hostUrl = HostUrl;
  static transactionCut = TransactionCut;
  static siteName = SiteName;
  static apiUser = ApiUser;
  static apiKey = ApiKey;
  static tos = TOS;
  static siteMode = SiteMode;
  static notice = Notice;
  static exclusiveProxyPrice = exclusiveProxyPrice;
  static sharedProxyPrice = sharedProxyPrice;
  static payment = Payment;
  static providerCallbackSecret = ProviderCallbackSecret;
  static devices = Devices;
}

async function get(name: string): Promise<string | null> {
  return await db.query.SiteOptionModel.findFirst({
    where: (model, { eq }) => eq(model.name, name),
  }).then((r) => (!!r ? r.value : null));
}

async function set(name: string, value: string) {
  await db.insert(SiteOptionModel).values({ value, name }).onConflictDoUpdate({
    set: { value },
    target: SiteOptionModel.name,
  });
}
