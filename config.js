module.exports = {
    DATABASE: 'mongodb://localhost:27017/test',
    PORT: 3003,
    PICTURE: 'http://localhost:3002',
    SESSION: {
        PERSISTENCE: false,
        DATABASE: 'mongodb://localhost:27017/test',
        SECRET: 'abracadabra',
        COLLECTION: 'sessions'
    },
    AUTH: {
        CLIENT_ID: 'id',
        CLIENT_SECRET: 'secret',
        AUTHORIZATION_URL: 'http://localhost:3000/oauth/authorize',
        TOKEN_URL: 'http://localhost:3000/oauth/token',
        USER_PROFILE_URL: 'http://localhost:3000/user',
        CALLBACK_URL: 'http://127.0.0.1:3003/auth/oneuser/callback'
    }
};
