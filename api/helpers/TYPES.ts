import type { UserType } from '../../database/models/User';

export type CreateUserPayload = Pick<UserType, 'firstName' | 'lastName' | 'email' | 'password'>;
