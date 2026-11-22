/**
 * Public read-only demo account. Visitors sign in to it without a password
 * through /api/auth/demo; the session carries `demo: true`, and the middleware
 * rejects every data-changing API request made with such a session.
 */
export const DEMO_USER_ID = 'usr-demo-viewer';
export const DEMO_USER_EMAIL = 'demo.viewer@apexfitness.com';
export const DEMO_READ_ONLY_MESSAGE = 'This is a read-only demo. Changes are disabled.';
