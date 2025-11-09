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
    "!**/migrations/**",
    "!**/config/**",
    "!**/*entity*.ts",
    "!**/*dto*.ts",
    "!**/*decorator*.ts",
    "!**/*model*.ts",
    "!**/*response*.ts",
    "!**/*request*.ts",
    "!**/*module.ts",
    "!**/*port.ts"
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/test/',
    '.*entity.*',
    '.*dto.*',
    '.*decorator.*',
    '.*model.*',
    '.*response.*',
    '.*request.*',
    ".*module.*",
    ".port.*"
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
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageProvider: "v8",
  // Para ignorar constructores en la cobertura, agrega /* istanbul ignore next */ antes de cada constructor
  // Ejemplo: /* istanbul ignore next */ constructor(...) { ... }
};