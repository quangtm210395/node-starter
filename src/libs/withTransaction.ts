import { mongoose } from '@typegoose/typegoose';

/**
 * Start a session and use withTransaction.
 */
export const withTransaction = async function withTransaction(
  fn: (session: mongoose.ClientSession) => Promise<any>,
  existingSession?: mongoose.ClientSession,
): Promise<void> {
  if (existingSession) {
    if (existingSession.inTransaction()) return fn(existingSession);

    return existingSession.withTransaction(fn);
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(fn);
  } catch (error) {
    throw error;
  } finally { session.endSession(); }
};
