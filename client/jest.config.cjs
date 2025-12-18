module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.ts$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
          },
          target: "es2020",
        },
      },
    ],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.stories.tsx",
    "!src/**/index.ts",
    "!src/**/*.test.ts",
  ],
};
