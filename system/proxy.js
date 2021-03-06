/**
 * Allows hosting of multiple sites on one server.
 */
var httpProxy = require('http-proxy'),
    exec = require('child_process').exec,
    fs = require('fs')

process.title = 'nudgepadProxy'
var errorPage = fs.readFileSync(__dirname + '/error.html', 'utf8')
var starting = {}
var dataPath = '/nudgepad/'
var logsPath = dataPath + 'logs/'
var sitesPath = dataPath + 'sites/'
var activePath = dataPath + 'active/'
var portsPath = dataPath + 'ports/'
var port = process.argv[2] || 80

var startSite = function (domain) {
  starting[domain] = true
  console.log('starting sleeping site: %s', domain)
  exec(__dirname + '/nudgepad.sh start ' + domain, function (err){
    if (err)
      console.log('Start site error %s', err)
  })
}

var notFoundHandler = function (req, res) {
  var domain = req.headers.host.split(/\:/)[0]
  // todo: this could cause some bad edge cases
  if (domain.match(/^www\./)) {
    res.writeHead(302, { 'Location': 'http://' + domain.substr(4) + req.url })
    console.log('www_redirect: %s', domain)
    res.end()
  } else {
    // todo: this may cause some bad edge cases.
    fs.exists(sitesPath + domain, function (exists) {
      if (!exists) {
        console.log('unknown_host: %s', domain)
        res.writeHead(404)
        return res.end()
      } else {
        // Only start a site once
        if (starting[domain]) {
          res.writeHead(500)
          return res.end(errorPage)
        }
        startSite(domain)
        res.writeHead(500)
        return res.end(errorPage)
        
        
      }
    })
    
    
    
    
    
  }
}

var errorHandler = function (err, req, res) {
//  console.log(err)
//  console.log('proxy error')
  if (req && req.headers)
    console.log('error: %s %s%s', req.method, req.headers.host, req.url)
  res.writeHead(500)
  res.end(errorPage)
}

var server = httpProxy.createServer({
  hostnameOnly: true,
  router: {}
})

server.proxy.on('notFound', notFoundHandler)
server.proxy.on('proxyError', errorHandler)

server.listen(port)


var updatePorts = function () {
  var sites = server.proxy.proxyTable.router
  var files = fs.readdirSync(activePath)
  for (var i in files) {
    var domain = files[i]
    if (domain.match(/^\./))
      continue
    var port = fs.readFileSync(activePath + domain, 'utf8')
    sites[domain] = '127.0.0.1:' + port
    console.log('%s on port %s', domain, port)
  }
}

updatePorts()

fs.watch(activePath, function (event, domain) {
  
  // Mac os x
  if (!domain)
    return updatePorts()
  
  var sites = server.proxy.proxyTable.router
  // Trigger public changed event
  console.log('event on %s', domain)
  var domain = domain.toLowerCase()
  if (domain.match(/^\./))
    return null
  if (fs.existsSync(activePath + domain)) {
    var port = fs.readFileSync(activePath + domain, 'utf8')
    sites[domain] = '127.0.0.1:' + port
    console.log('%s on port %s', domain, port)
  } else {
    console.log('deleting %s', sites[domain])
    delete sites[domain]
  }
})

