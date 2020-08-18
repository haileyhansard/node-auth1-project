const router = require('express').Router();

const Users = require('./users-model');

// get or find list of Users
// test endpoint at localhost:6000/api/users/
router.get('/', (req, res) => {
    Users.find()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(error => 
            res.status(500).json({ error: error.message })
        );
});

module.exports = router;
