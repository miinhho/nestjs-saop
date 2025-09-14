import micromatch from 'micromatch';

export default {
  '*.{ts,js}': stagedFiles => {
    const match = micromatch.not(stagedFiles, 'node_modules/**');
    return [`eslint --fix ${match.join(' ')}`, `prettier --write ${match.join(' ')}`];
  },
};
