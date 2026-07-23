// @ts-check

/** @typedef {{ sequence: number, scope: string }} RequestToken */

/**
 * Keeps asynchronous UI reads from committing results after a newer request
 * or a route/scope change has made them stale.
 */
export const createLatestRequestGuard = () => {
  let latestSequence = 0;

  return {
    /** @param {string} scope @returns {RequestToken} */
    begin(scope) {
      latestSequence += 1;
      return { sequence: latestSequence, scope };
    },

    /** @param {RequestToken} token @param {string} currentScope */
    isLatest(token, currentScope) {
      return token.sequence === latestSequence && token.scope === currentScope;
    },

    invalidate() {
      latestSequence += 1;
    },
  };
};
