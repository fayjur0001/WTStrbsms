import { roles } from "@/types/role.type";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
};

export const UserRoleEnum = pgEnum("role", roles);

export const UserModel = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username").notNull().unique(),
    email: varchar("email").notNull().unique(),
    jabber: varchar("jabber"),
    telegram: varchar("telegram"),
    pinCode: text("pin_code"),
    isOnline: boolean("is_online").notNull().default(false),
    role: UserRoleEnum("role").notNull().default("general"),
    password: text("password").notNull(),
    banned: boolean("banned").notNull().default(false),
    bannedTill: timestamp("banned_till"),
    ...timestamps,
  },
  (table) => [
    index("users_username_idx").on(table.username),
    index("users_email_idx").on(table.email),
    index("users_jabber_idx").on(table.jabber),
    index("users_telegram_idx").on(table.telegram),
  ],
);

export const UserDeviceModel = pgTable(
  "user_devices",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => UserModel.id),
    token: varchar("token").notNull().unique(),
    ...timestamps,
  },
  (table) => [
    index("user_devices_token_idx").on(table.token),
    index("user_devices_user_id_idx").on(table.userId),
  ],
);

export const SiteOptionModel = pgTable("site_options", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  value: text("value"),
  ...timestamps,
});

export const addedFundStatusEnum = pgEnum("status", [
  "pending",
  "approved",
  "rejected",
]);

export const addedFundCurrencyEnum = pgEnum("currency", ["BTC", "USDT"]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "blockonomics",
  "now_payments",
]);

export const AddedFundModel = pgTable("added_funds", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => UserModel.id),
  txid: varchar("txid"),
  amount: real("amount").notNull(),
  status: addedFundStatusEnum("status").notNull().default("pending"),
  walletAddress: varchar("wallet_address").notNull(),
  currency: varchar("currency").notNull().default("BTC"),
  method: paymentMethodEnum("method").notNull().default("blockonomics"),
  manualyUploaded: boolean("manualy_uploaded").notNull().default(false),
  ...timestamps,
});

export const ticketStatusEnum = pgEnum("ticket_status", ["opened", "closed"]);

export const TicketModel = pgTable("tickets", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => UserModel.id),
  agentId: integer("agent_id").references(() => UserModel.id),
  subject: varchar("subject").notNull(),
  status: ticketStatusEnum("status").notNull().default("opened"),
  ...timestamps,
});

export const TicketMessageModel = pgTable("ticket_messages", {
  id: serial("id").primaryKey().notNull(),
  ticketId: integer("ticket_id"),
  userId: integer("user_id")
    .notNull()
    .references(() => UserModel.id),
  message: varchar("message").notNull(),
  ...timestamps,
});

export const TicketMessageSeenByModel = pgTable("ticket_message_seen_bys", {
  id: serial("id").primaryKey().notNull(),
  messageId: integer("message_id")
    .notNull()
    .references(() => TicketMessageModel.id),
  userId: integer("user_id")
    .notNull()
    .references(() => UserModel.id),
  ...timestamps,
});

export const RentStatusEnum = pgEnum("rent_status", [
  "Reserved",
  "Awaiting MDN",
  "Active",
  "Expired",
  "Rejected",
  "Completed",
  "Timed Out",
]);

export const OneTimeRentModel = pgTable("one_time_rents", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => UserModel.id),
  requestId: text("request_id").notNull(),
  mdn: varchar("mdn").notNull(),
  service: varchar("service").notNull(),
  status: RentStatusEnum("status").notNull(),
  state: varchar("state").notNull(),
  price: real("price").notNull(),
  originalPrice: real("original_price").notNull(),
  carrier: varchar("carrier").notNull(),
  message: text("message"),
  pin: text("pin"),
  tillExpiration: integer("till_expiration").notNull(),
  ...timestamps,
});

export const OnlineStatusEnum = pgEnum("online_status", [
  "awaiting mdn",
  "online",
  "offline",
]);

export const longTermRentTypeEnum = pgEnum("rent_type", [
  "short",
  "regular",
  "unlimited",
]);

export const LongTermRentsModel = pgTable("long_term_rents", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => UserModel.id),
  requestId: text("request_id").notNull(),
  mdn: varchar("mdn").notNull(),
  service: varchar("service").notNull(),
  status: RentStatusEnum("status").notNull(),
  price: real("price").notNull(),
  message: text("message"),
  pin: text("pin"),
  expirationDate: timestamp("expiration_date", { mode: "date" }).notNull(),
  onlineStatus: OnlineStatusEnum().notNull(),
  rentType: longTermRentTypeEnum("rent_type").notNull(),
  ...timestamps,
});

export const MDNTypeEnum = pgEnum("mdn_type", ["one_time", "long_term"]);

export const MDNMessageModel = pgTable("mdn_messages", {
  id: serial("id").primaryKey().notNull(),
  requestId: varchar("request_id").notNull(),
  timestamp: timestamp("timestamp", { mode: "date" }).notNull(),
  from: varchar("from").notNull(),
  to: varchar("to").notNull(),
  reply: varchar("reply").notNull(),
  pin: varchar("pin"),
  type: MDNTypeEnum("type").notNull(),
  ...timestamps,
});

export const ProxyTypeEnum = pgEnum("proxy_type", ["shared", "exclusive"]);

export const RentedProxyModel = pgTable("rented_proxies", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => UserModel.id),
  requestId: varchar("request_id").notNull(),
  port: varchar("port").notNull(),
  proxyCarrier: varchar("proxy_carrier").notNull(),
  proxyUser: varchar("proxy_user").notNull(),
  proxyPass: varchar("proxy_pass").notNull(),
  proxyIp: varchar("proxy_ip").notNull(),
  proxySocksPort: integer("proxy_socks_port").notNull(),
  proxyHttpPort: integer("proxy_http_port").notNull(),
  price: real("price").notNull(),
  proxyType: ProxyTypeEnum("proxy_type").notNull(),
  expirationDate: timestamp("expiration_date", { mode: "date" }).notNull(),
  ...timestamps,
});

export const DeviceTransactionModel = pgTable("device_transactions", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => UserModel.id),
  line: varchar("line").notNull(),
  price: real("price").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  ...timestamps,
});
