var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var User = mongoose.model('User')
var Character = mongoose.model('Character')

// router.use(ensureAuthentication)

router.get('/', function(req, res) {
  if (req.session && req.session.passport) {
    User.findById(req.session.passport.user, function(err, user) {
      res.redirect('/profile/' + user._id)
    })
  } else {
    res.redirect('/')
  }
})

.get('/:id', function(req, res) {
  User.findById(req.params.id, function(err, user) {
    if (user) {
      Character.find({user: user._id}, function(err, characters) {
        res.render('profile', {
          user: user,
          isLoggedIn: req.isAuthenticated(),
          isAdmin: req.user.group == 'admins',
          message: req.flash('newChar'),
          characters: characters
        })
      })
    }
  })
})

.get('/:id/newchar', function(req, res) {
  res.render('newchar', {
    isLoggedIn: req.isAuthenticated(),
    isAdmin: req.user.group == 'admins'
  })
})

.post('/newchar', function(req, res, next) {
  if (!req.body.charGender || !req.body.charRace || !req.body.charClass || !req.body.charName) {
    res.json({error: true, message: 'Error creating character. Missing parameter.'})
  } else {
    if (req.session && req.session.passport) {
      var newChar = new Character()
      newChar.charClass = req.body.charClass
      newChar.gender = req.body.charGender
      newChar.race = req.body.charRace
      newChar.name = req.body.charName
      newChar.user = req.session.passport.user

      newChar.save(function(err, data) {
        if (err) {
          res.json({error: true, message: 'Error creating character.'})
        } else {
          req.flash('newChar', '' + data.name + ' created!')
          res.json({error: false, message: 'Character created successfully.'})
        }
      })
    } else {
      res.json({error: false, message: 'Error reading user.'})
    }
  }
})

function ensureAuthentication (req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.render('login')
  }
}

module.exports = router
