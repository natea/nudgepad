/**
 * MoveHandle changes the (x, y) coordinates of selected Scraps 
 */
nudgepad.MoveHandle = function () {
}

nudgepad.MoveHandle.create = function (scrap) {
  
  var element = scrap.element()
  
  
  var div = $('<div></div>')
  div.attr('value', scrap.getPath())
  div.addClass('handle ' + scrap.id + '_handle move_handle')
  div.attr('id', 'move_handle_' + scrap.id)
  div.attr('title', scrap.id)
  
  var position = element.css('position')
  if (position === 'fixed' || position === 'absolute') {
    div.on("mousedown", nudgepad.MoveHandle.mousedown)
    div.on("slide", nudgepad.MoveHandle.slide)
    div.on("slidestart", nudgepad.MoveHandle.slidestart)
    div.on("slideend", nudgepad.MoveHandle.slideend)
    div.css('cursor', 'move')
  }
  div.css({
    "position" : (position === 'fixed' ? 'fixed' : 'absolute'),
    "z-index" : "50"
  })
  element.parent().append(div)
  div.on("tap", nudgepad.MoveHandle.tap)
  div.on("update", nudgepad.MoveHandle.update)
  div.on("dblclick", function (event) {
    if (event.metaKey) {
      element.togglePosition()
      nudgepad.stage.commit()
      element.deselect().selectMe()
    } else
      scrap.edit(true)
  })
  
  div.trigger("update")
}

// We cache the start dimensions
nudgepad.MoveHandle.dimensions = {}

//If small block is on top of (higher z-index) a bigger block, selects small block
nudgepad.MoveHandle.mousedown = function () {
//  nudgepad.MoveHandle.selectTopScrap()
  nudgepad.MoveHandle.dimensions = $(this).owner().dimensions()
  nudgepad.grid.create()
  nudgepad.MoveHandle.last_x_change = 0
  nudgepad.MoveHandle.last_y_change = 0
  
  nudgepad.MoveHandle.scrollTop = nudgepad.stage.scrollTop()
  return true
}

/**
 * if the click is on another smaller div select that one instead of move.
 *
 * @param true. Allow propogation
 */
nudgepad.MoveHandle.selectTopScrap = function () {

  // get element at point
  var offsetLeft = $('#nudgepadStageBody').offset().left
  var offsetTop = $('#nudgepadStageBody').offset().top
  var element = $.topDiv('.scrap:visible', nudgepad.mouse.down.pageX - offsetLeft, nudgepad.mouse.down.pageY - offsetTop + nudgepad.stage.scrollTop())
  // if a narrow div and no element underneath, return
  if (!element)
    return true
  // Its the selection block
  if (element.hasClass("selection"))
    return true
  var scrap = element.scrap()
  // Dont select block if locked
  if (scrap.get('locked'))
    return true
  nudgepad.stage.selection.clear()
  element.selectMe()
  return true
}

/**
 * Changes top and/or left and/or bottom and/or right and/or margin
 */
nudgepad.MoveHandle.slide = function (event, mouseEvent) {

  var owner = $(this).owner()
  var scrap = owner.scrap()
  var dimensions = nudgepad.MoveHandle.dimensions
  
  var scrollChange = nudgepad.stage.scrollTop() - nudgepad.MoveHandle.scrollTop

  var grid_change = {y : 0, x : 0}

  if (!mouseEvent.shiftKey) {
    grid_change = nudgepad.grid.getDelta([
      {x : dimensions.left + nudgepad.mouse.xChange, y : dimensions.top + nudgepad.mouse.yChange + scrollChange},
      {x : dimensions.right + nudgepad.mouse.xChange, y : dimensions.bottom + nudgepad.mouse.yChange + scrollChange},
      {x :  dimensions.center + nudgepad.mouse.xChange, y : dimensions.middle + nudgepad.mouse.yChange + scrollChange}
    ])
  }
  var y_change = nudgepad.mouse.yChange + scrollChange + grid_change.y
  var x_change = nudgepad.mouse.xChange + grid_change.x
  

  $('.selection').each(function (){
    $(this).scrap().move(x_change - nudgepad.MoveHandle.last_x_change, y_change - nudgepad.MoveHandle.last_y_change)
  })
  
  var position = 'X ' + parseFloat(owner.css('left')) + '<br>Y ' + parseFloat(owner.css('top'))
  $('#nudgepadDimensions').css({
    left : 10 + owner.offset().left + owner.outerWidth(),
    top : -10 + owner.offset().top + Math.round(owner.outerHeight(true)/2)
    }).html(position)
  
  nudgepad.MoveHandle.last_x_change = x_change
  nudgepad.MoveHandle.last_y_change = y_change
  
  return false
  
}

nudgepad.MoveHandle.slideend = function () {
  
  $('.handle').trigger('update').show()
  nudgepad.grid.removeSnaplines()
  $('#nudgepadDimensions').hide()
  nudgepad.stage.commit()
}

nudgepad.MoveHandle.slidestart = function () {
  
  $('.handle').not(this).hide()
  var owner = $(this).owner()
  var position = 'X ' + parseFloat(owner.css('left')) + '<br>Y ' + parseFloat(owner.css('top'))
  $('#nudgepadDimensions').css({
    left : 10 + owner.offset().left + owner.outerWidth(),
    top : -10 + owner.offset().top + Math.round(owner.outerHeight(true)/2)
    }).html(position).show()
  return false
}

// Dont propogate tap events
nudgepad.MoveHandle.tap = function () {
  // If shift key is down, remove from selection
  if (nudgepad.mouse.down && nudgepad.mouse.down.shiftKey)
    $(this).owner().deselect()
  return false
}

nudgepad.MoveHandle.update = function () {
  var owner = $(this).owner()
  if (!owner.position())
    debugger
  // make it easy to move narrow divs
  var top_padding  = Math.min(10, owner.outerHeight(true) - 20)
  var left_padding = Math.min(10, owner.outerWidth() - 20)
  var style = {
    "left" : owner.position().left + left_padding  + 'px',
    "top" : (owner.position().top + top_padding) + 'px',
    "height" : (owner.outerHeight(true) - top_padding * 2) + 'px',
    "width" : (owner.outerWidth() - left_padding * 2)  + 'px'}
  $(this).css(style)
}
