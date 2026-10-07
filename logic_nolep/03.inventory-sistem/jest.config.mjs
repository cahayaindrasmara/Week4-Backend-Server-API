export default {
    testEnvironment: 'node',
    testEnvironmentOptions: {
        NODE_ENV: 'test'
    },
    restoreMocks: true,
    coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app.js', 'tests', 'generated'],
    coverageReporters: ['text', 'lcov', 'clover', 'html'],
    setupFilesAfterEnv: ['<rootDir>/tests/setupAfterEnv.js']
};