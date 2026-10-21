import { PgEngage } from "./pg-engage.ts";

/**
 * The PostgreSQL store: the single source of truth for every user-owned record and every amount of money.
 * Layers (one file each): base -> users/sessions/security -> contacts/labels/backups -> sync -> money/referrals/audit -> engagement/community/ops.
 */
export class PgStore extends PgEngage {}
export type Store = PgStore;
