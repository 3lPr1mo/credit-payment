module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  modulePaths: ['.'],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  collectCoverageFrom: [
    "domain/**/*.ts",
    "application/**/*.ts",
    "src/infrastructure/**/*.ts",
    "!**/*.spec.ts",
    "!**/*.interface.ts",
    "!**/app/**",
    "!**/*entity*.ts",
    "!**/*dto*.ts",
    "!**/*decorator*.ts",
    "!**/*model*.ts",
    "!**/*response*.ts",
    "!**/*request*.ts"
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/test/',
    '/app/',
    '.*entity.*',
    '.*dto.*',
    '.*decorator.*',
    '.*model.*',
    '.*response.*',
    '.*request.*'
  ],
  roots: ["<rootDir>"],
  testMatch: [
    "**/domain/**/?(*.)+(spec).[jt]s?(x)",
    "**/application/**/?(*.)+(spec).[jt]s?(x)",
    "**/infrastructure/**/?(*.)+(spec).[jt]s?(x)"
  ],
  testEnvironment: "node",
  coverageDirectory: "coverage",
  coverageReporters: [
    "text",
    "lcov",
    "html",
    "cobertura"
  ],
  coverageIgnoreConstructors: true
};