// model definition

var Sup = {
  Model: {},
  Util: {}
};

Sup.Model.BlockData = function(params) {
  // @todo check typeof params.*

  params = params || {};

  this.id          = 'undefined' != typeof params.id ? params.id : 'untitled';
  this.title       = 'undefined' != typeof params.title ? params.title : 'untitled';
  this.description = 'undefined' != typeof params.description ? params.description : 'description';
  this.importance  = 'undefined' != typeof params.importance ? params.importance : 'importance';
};

Sup.Model.BlockPosition = function(params) {
  // @todo check typeof params.*

  params = params || {};

  this.id        = 'undefined' != typeof params.id ? params.id : 0;
  this.positionX = 'undefined' != typeof params.positionX ? params.positionX : 0;
  this.positionY = 'undefined' != typeof params.positionY ? params.positionY : 0;
  this.width = 'undefined' != typeof params.width ? params.width : 100;
  this.height = 'undefined' != typeof params.height ? params.height : 100;
}

Sup.Model.Block = function(params) {
  // @todo check typeof params.*

  params = params || {};

  this.id        = 'undefined' != typeof params.id ? params.id : {};
  this.blockData = 'undefined' != typeof params.blockData ? params.blockData : {};
  this.blockPosition = 'undefined' != typeof params.blockPosition ? params.blockPosition : {};
}

Sup.Controller = function(container) {
  this.blocks = [];
  this.container = container;

  this.templates = {
    blockContainer: '<div><p class="title" /></div>'
  };

  $(this).bind('resize', function() { console.log('wow'); });
}

Sup.Controller.prototype.onBlockPositionChanged = function(blockTemplate) {
  var block = blockTemplate.data('block');

  block.blockPosition.positionX = ((parseInt(blockTemplate.css('left')) / this.container.width()) * 100).toFixed(2);
  block.blockPosition.positionY = ((parseInt(blockTemplate.css('top')) / this.container.height()) * 100).toFixed(2);
  block.blockPosition.width = ((blockTemplate.width() / this.container.width()) * 100).toFixed(2);
  block.blockPosition.height = ((blockTemplate.height() / this.container.height()) * 100).toFixed(2);

  this.saveBlock(block);
}

Sup.Controller.prototype.saveBlock = function(block) {
  var dataObj = {
    'block[id]': block.id,
    'block[block_data][id]': block.blockData.id,
    'block[block_data][title]': block.blockData.title,
    'block[block_data][description]': block.blockData.description,
    'block[block_data][importance]': block.blockData.importance,
    'block[block_position][id]': block.blockPosition.id,
    'block[block_position][width]': block.blockPosition.width,
    'block[block_position][height]': block.blockPosition.height,
    'block[block_position][position_x]': block.blockPosition.positionX,
    'block[block_position][position_y]': block.blockPosition.positionY
  };

  // @todo: dynamic URL
  var updateUrl = '/frontend_dev.php/block/update.json?id=' + block.id;
  $.post(updateUrl, 
    $.param(dataObj)
  );
}

Sup.Controller.prototype.addBlock = function(block) {
  // @todo check typeof block

  this.blocks[this.blocks.length] = block;
  this.drawBlock(block);
}

Sup.Controller.prototype.drawBlock = function(block) {
  // @todo check typeof block

  var template = $(this.templates.blockContainer).css({
    position: 'absolute'
  });

  var sc = this;

  $(template).draggable({
    containment: 'parent',
    opacity: 0.35,
    stack: { group: 'block', min: 50 },
    zIndex: 999,
    stop: function(event, ui) {
      sc.onBlockPositionChanged(ui.helper);
    }
  });

  $(template).resizable({
    containment: 'parent',
    handles: 'ne, se, sw, nw',
    stop: function(event, ui) {
      sc.onBlockPositionChanged(ui.helper);
    }
  });

  template.appendTo(this.container)
    .data('block', block)
    .addClass('block');

  template.find('.title').text(block.blockData.title);

  this.positionBlockTemplate(template);
}

Sup.Controller.prototype.positionBlocks = function() {
  var sc = this;

  $(this.container).find('.block').each(function() {
    sc.positionBlockTemplate($(this));
  });
}

Sup.Controller.prototype.positionBlockTemplate = function(blockTemplate) {
  // derived from block parameters
  blockTemplate.css({
    left: this.container.width() * (blockTemplate.data('block').blockPosition.positionX * .01),
    top: this.container.height() * (blockTemplate.data('block').blockPosition.positionY * .01),
    width: this.container.width() * (blockTemplate.data('block').blockPosition.width * .01),
    height: this.container.height() * (blockTemplate.data('block').blockPosition.height * .01),
    backgroundColor: Sup.Util.hexColourFromImportance(blockTemplate.data('block').blockData.importance)
  });
}

// Sup.Block.prototype.initialise = function() {
// };

// Sup.Block.prototype.initialiseDebugMenu = function() {
// }

Sup.Util.hexColourFromImportance = function(importance) {
  importance = parseInt(importance);
  
  iR = importance * 2;
  iG = 512 - importance * 2;

  return '#' +
    Sup.Util.decimalToHex(Math.min(iR, 255), true) + 
    Sup.Util.decimalToHex(Math.min(iG, 255), true) + 
    '00';
}

Sup.Util.decimalToHex = function(number, pack) {
  if ('undefined' == typeof pack) {
    pack = false;
  }

  var hex = number.toString(16);

  if (pack && 1 == hex.length) {
    hex = '0' + hex;
  }

  return hex;
}

$(function() {
  var c = $('<div class="sup-container" />')
    .appendTo($('body'))
    .css({
      width: $(document).width() - 2,
      height: $(document).height() - 2,
      border: '1px solid #aaa'
    });

  $(window).bind('resize', function() {
    // shrink first, so we clear the scrollbars and the resize to fit
    c.css({
      width: 0,
      height: 0
    })
    .css({
      width: $(window).width() - 2,
      height: $(window).height() - 2
    });

    window.sup.positionBlocks();
  });

  window.sup = new Sup.Controller(c);
});