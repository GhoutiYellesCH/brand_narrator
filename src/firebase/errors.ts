
// This defines a custom error class for Firestore permission denied errors.
// It allows us to create rich, contextual errors that can be caught and
// displayed in a more user-friendly way, especially during development.

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(context, null, 2)}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is to make the error visible in the Next.js development overlay
    // by providing a digestible stack trace.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }

  toString() {
    return this.message;
  }
}
