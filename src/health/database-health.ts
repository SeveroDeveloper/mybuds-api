/**
 * Port: "can the app reach its database right now?"
 * The controller depends on this abstraction, never on Prisma.
 * An abstract class (not an interface) because Nest needs a runtime token to inject.
 */
export abstract class DatabaseHealth {
  /** Resolves false instead of throwing when the database is unreachable. */
  abstract isUp(): Promise<boolean>;
}
