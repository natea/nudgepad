var Logout = function (app) {

  app.get('/nudgepad.logout', function(req, res, next) {
    res.clearCookie('email')
    res.clearCookie('key')
    return res.redirect('/nudgepad/public/login.html')
  })
  
}

module.exports = Logout
