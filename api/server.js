const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
//this library stores the cookie

const usersRouter = require('../users/users-router');
const authRouter = require('../auth/auth-router');
const dbConfig = require('../database/db-config');
const protected = require('../auth/protected-mw');

const server = express();

const sessionConfiguration = {
    name: "martha",
    secret: "was a first lady",
    cookie: {
        maxAge: 1000 * 60 * 10, // cookie expires after 10  mins
        secure: process.env.COOKIE_SECURE || false,
        httpOnly: true,
    },
    resave: false,
    saveUninitialized: true, //only for development until we write something that asks for the clients permission to store cookies
    store: new KnexSessionStore({
        knex: dbConfig,
        tablename: 'sessions',
        sidfieldname: 'sid',
        createtable: true,
        clearInterval: 1000 * 60 * 60, //clear expired sessions every hour to keep the database smaller
    }),
};

server.use(express.json());
server.use(helmet());
server.use(session(sessionConfiguration));

server.use('/api/users', protected, usersRouter);
server.use('/api/auth', authRouter);

server.get('/', (req, res) => {
    res.json({ message: "API is up and running" });
});

server.get('/hash', (req, res) => {
    try {
        //read a password property from the headers
        const password = req.headers.password;
        //hash the password, return the password and the hash
        const rounds = process.env.HASH_ROUNDS || 8;
        const hash = bcrypt.hashSync(password, rounds);

        res.status(200).json({ password, hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//we want to use try/catch because it will "catch" in case it all fails and it wont crash the server

module.exports = server;