module.exports = {
  root: true,
  extends: [
    require.resolve('@vercel/style-guide/eslint/browser'),
    require.resolve('@vercel/style-guide/eslint/react'),
    require.resolve('@vercel/style-guide/eslint/next'),
    require.resolve('@vercel/style-guide/eslint/typescript'),
    require.resolve('@vercel/style-guide/eslint/jest'),
  ],
  env: {
    jest: true,
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  ignorePatterns: ['*.config.js', 'dist/'],
};
