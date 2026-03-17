/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  ignorePatterns: [".eslintrc.cjs"],
  extends: ["@gc/eslint-config/index.js"],
  parserOptions: {
    project: true,
  },
};
