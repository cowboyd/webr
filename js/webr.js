(function() {
  var fs = require('fs')
  var sys = require("sys")

  var paths = process.webr.require_paths
  for (var i = 0, len = paths.length; i < len; i++) {
    require.paths.push(paths[i])
  }

  function alert(msg) {
    require('sys').puts("[ALERT]: " + msg)
  }

  function updateGlobal() {
    for (var prop in window) {
      if (!(prop in global) && prop != 'self') {
        global[prop] = window[prop]
      }
    }
  }

  function script(path) {
    var pre = path.match(/^\//) ? '' : process.webr.root + '/'
        data = fs.readFileSync(pre + path),
        Script = process.binding('evals').Script
    Script.runInThisContext(data, path)
    updateGlobal()
  }

  function script_eval(data) {
    var sys = require('sys'),
        Script = process.binding('evals').Script
    Script.runInThisContext(data, '')
    updateGlobal()
  }

  global.require = require
  global.script = script
  window = global.window = require('jsdom').jsdom(process.webr.html).createWindow()
  window.alert = alert
  window.document.location = window.location

  if ('search' in window.location) {
    // nothing
  } else {
    window.location.search = ""
  }

  updateGlobal()

  var scripts = process.webr.scripts
  for (var i = 0, len = scripts.length; i < len; i++) {
    script(scripts[i])
  }

  var list = global.window.document.getElementsByTagName("script")
  for (var i = 0; i < list.length; i++) {
    var item = list.item(i),
        src = item.getAttribute('src')
    if (src.length == 0) {
      // workaround for jsdom .innerHTML - it actually html encodes - bug?
      var decode = require('jsdom/browser/htmlencoding').HTMLDecode
      script_eval(decode(item.innerHTML)) // not relying on jsdom for triggering load here
      // item.text = decode(item.innerHTML)  // assign to trigger eval
    } else {
      if (!src.match(/^(http|https)\:\/\//)) {
        // src = 'file://' + process.webr.root + '/' + src
        script(src)
      } else {
        throw new Error("http support still needs to be implemented")
      }
      // item.src = src  // assign it to trigger load
    }
  }

  if (window.onload) {
    window.onload()
  }  

})()

