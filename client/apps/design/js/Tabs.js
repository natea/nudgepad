nudgepad.pages.updateTabs = function () {
  $('#nudgepadTabs').html('')
  var keys = site.get('pages').keys
  _.each(keys, function (name) {
    var div = $('<span>' + name + '</span>')
    
    // Make active page white
    if (name === nudgepad.stage.activePage)
      div.css('color', 'white')
      
    var title = ''
    
    site.values.collage.each(function (key, value) {
      if (value.get('page') !== name)
        return true
      title += value.get('name') + '(' + value.get('device') + ')' + ' '
      if (key != nudgepad.id)
        div.addClass('openPage')
    })
    
    div.attr('title', title)
    
    div.on('click', function () {
      mixpanel.track('I clicked a page tab')
      nudgepad.stage.open($(this).text())
      return true
    })
    div.attr('value', name)
    $('#nudgepadTabs').append(div)
    
  })
  
}

nudgepad.on('collage.update', nudgepad.pages.updateTabs)


