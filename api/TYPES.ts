import type { UserType } from "../database/models/User";

export type CreateUserPayload = Pick<UserType, "name" | "email" | "password">