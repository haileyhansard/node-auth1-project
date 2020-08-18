const router = require('express').Router();
const bcrypt = require('bcryptjs');


const Users = require('../users/users-model');

// use endpoint to test localhost:6000/api/auth/register
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    //validate the user credentials first, then let it produce a response
    // look at https://www.npmjs.com/package/joi for validation, also look at https://www.npmjs.com/package/express-validator
    const rounds = process.env.HASH_ROUNDS || 8;
    
    const hash = bcrypt.hashSync(password, rounds)
    
    Users.add({ username, password: hash })
        .then(user => {
            res.status(201).json({ data: user })
        })
        .catch(error => res.json({ error: error.message }));
});

// now instead of hashing the pw, we are validating it
// use endpoint localhost:6000/api/auth/login
router.post('/login', (req, res) => {
    let { username, password } = req.body;

    Users.findBy({ username })
        .then(users => {
            const user = users[0];

            if(user && bcrypt.compareSync(password, user.password)) {
                //if user exists and password is good/matches
                req.session.loggedIn = true;

                res.status(200).json({
                    hello: user.username,
                    session: req.session,
                });
            } else {
                res.status(401).json({ error: "Incorrect credentials, please check your username and password" });
            }
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
});

// use endpoint localhost:6000/api/auth/logout
router.get('/logout', (req, res) => {
    if(req.session) {
        req.session.destroy(error => {
            if(error) {
                res.status(500).json({
                    error: "Unable to log out, please try again",
                });
            } else {
                res.status(204).end();
            }
        });
    } else {
        res.status(200).json({message: 'You are already logged out' })
    }
});

module.exports = router;