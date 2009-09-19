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
  this.form;

  this.templates = {
    blockContainer: '<div class="block-container"><p class="title" /><div class="actions"><div class="action-delete" /><div class="action-edit" /></div></div>',
    blockForm: '<div class="block-form"><div class="form-row"><label>Title</label><input type="text" name="title" id="block-form-title" /></div><div class="form-row"><label>Importance</label><div id="block-form-slider-importance"><div><img src="/images/gradient.png" /></div><div class="c" /></div></div><div class="form-row centre"><input type="submit" value="create" id="block-form-submit" /> <input type="button" value="cancel" id="block-form-cancel" /></div>',
    createButton: '<div id="block-create-button" />'
  };
}

Sup.Controller.prototype.initialise = function() {
  // create add button
  var cs = this;
  $(this.templates.createButton)
    .appendTo(this.container)
    .click(function() {
      console.log('add button');
      cs.showCreateForm();
    });

  // fetch blocks
  this.fetchBlocks();
}

Sup.Controller.prototype.fetchBlocks = function() {
  var cs = this;

	$.getJSON('/frontend_dev.php/block/index.json', function(data) {
		$.each(data, function(i, block) {
			var bd = new Sup.Model.BlockData({
				id:          block.BlockData.id,
				title:       block.BlockData.title,
				description: block.BlockData.description,
				importance:  block.BlockData.importance
			});

			var bp = new Sup.Model.BlockPosition({
				id:        block.BlockPosition.id,
				positionX: block.BlockPosition.position_x,
				positionY: block.BlockPosition.position_y,
				width:     block.BlockPosition.width,
				height:    block.BlockPosition.height
			});

			var b = new Sup.Model.Block({
				id:            block.id,
				blockData:     bd,
				blockPosition: bp
			});

			cs.addBlock(b);
		});
	});
}

Sup.Controller.prototype.onBlockPositionChanged = function(blockTemplate) {
  var block = blockTemplate.data('block');

  block.blockPosition.positionX = ((parseInt(blockTemplate.css('left')) / this.container.width()) * 100).toFixed(2);
  block.blockPosition.positionY = ((parseInt(blockTemplate.css('top')) / this.container.height()) * 100).toFixed(2);
  block.blockPosition.width = ((blockTemplate.width() / this.container.width()) * 100).toFixed(2);
  block.blockPosition.height = ((blockTemplate.height() / this.container.height()) * 100).toFixed(2);

  this.saveBlock(block);
}

Sup.Controller.prototype.saveBlock = function(block, callback) {
  callback = callback || function() {};

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
    $.param(dataObj),
    function(blockResult) {
      callback(block);
    }, 'json'
  );
}

Sup.Controller.prototype.createBlock = function(block, callback) {
  callback = callback || function() {};

  var dataObj = {
    'block[block_data][title]': block.blockData.title,
    'block[block_data][description]': block.blockData.description,
    'block[block_data][importance]': block.blockData.importance,
    'block[block_position][width]': block.blockPosition.width,
    'block[block_position][height]': block.blockPosition.height,
    'block[block_position][position_x]': block.blockPosition.positionX,
    'block[block_position][position_y]': block.blockPosition.positionY
  };

  // @todo: dynamic URL
  var updateUrl = '/frontend_dev.php/block/create.json';
  var cs = this;

  $.post(updateUrl, 
    $.param(dataObj),
    function(block) {
      var bd = new Sup.Model.BlockData({
       id:          block.BlockData.id,
       title:       block.BlockData.title,
       description: block.BlockData.description,
       importance:  block.BlockData.importance
      });
      
      var bp = new Sup.Model.BlockPosition({
       id:        block.BlockPosition.id,
       positionX: block.BlockPosition.position_x,
       positionY: block.BlockPosition.position_y,
       width:     block.BlockPosition.width,
       height:    block.BlockPosition.height
      });
      
      var b = new Sup.Model.Block({
       id:            block.id,
       blockData:     bd,
       blockPosition: bp
      });

      cs.addBlock(b);

      callback(b);
    }, 'json'
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
    position: 'absolute',
    display: 'none'
  });

  this.addBlockActions(template, block);

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
    minHeight: 25,
    minWidth: 60,
    stop: function(event, ui) {
      sc.onBlockPositionChanged(ui.helper);
    }
  });

  template.appendTo(this.container)
    .data('block', block)
    .addClass('block')
    .fadeIn('fast');

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

Sup.Controller.prototype.addBlockActions = function(blockTemplate, block) {
  var cs = this;

  $(blockTemplate).find('.actions .action-delete').click(function() {
    if (!confirm('oh for srs?'))
    {
      return;
    }

    // delete
    // @todo: dynamic URL
    var deleteUrl = '/frontend_dev.php/block/delete.json?id=' + block.id;
    var cs = this;

    $.post(deleteUrl,
      function() {
        blockTemplate.fadeOut('fast', function() { blockTemplate.remove(); });
      }, 'json'
    );
  });

  $(blockTemplate).find('.actions .action-edit').click(function() {
    // edit

    cs.showEditForm(blockTemplate);
  });
}  

Sup.Controller.prototype.clearBlockForm = function() {
  $('#block-form-title').val('');
}

Sup.Controller.prototype.getForm = function()
{
  if (!this.form)
  {
    var cs = this;

    this.form = $(this.templates.blockForm).appendTo(this.container);

    $('#block-form-slider-importance .c').slider({
      value:127,
      min: 0,
      max: 255
    });

    $('#block-form-cancel').click(function() {
      cs.form.fadeOut('fast', function() { cs.clearBlockForm(); });
      return false;
    });

  }

  return this.form;
}

Sup.Controller.prototype.showCreateForm = function()
{
  var form = this.getForm();
  var cs = this;
  
  $('#block-form-submit').val('create');

  $('#block-form-submit').unbind('click').click(function() {
		var bd = new Sup.Model.BlockData({
			title:       $('#block-form-title').val(),
			description: '',
			importance:  $('#block-form-slider-importance .c').slider('value')
		});

		var bp = new Sup.Model.BlockPosition({
			positionX: Math.floor(Math.random() * 25) + 25,
			positionY: Math.floor(Math.random() * 25) + 25,
			width:     Math.floor(Math.random() * 25) + 25,
			height:    Math.floor(Math.random() * 25) + 25
		});

		var b = new Sup.Model.Block({
			blockData:     bd,
			blockPosition: bp
		});

    cs.createBlock(b, function() {
      cs.form.fadeOut('fast', function() { cs.clearBlockForm(); });
    });

    return false;
  });

  form.fadeIn('fast');
}

Sup.Controller.prototype.showEditForm = function(blockTemplate)
{
  var form = this.getForm();
  var cs = this;

  var block = blockTemplate.data('block');

  $('#block-form-title').val(block.blockData.title);
  $('#block-form-slider-importance .c').slider('value', block.blockData.importance);
  $('#block-form-submit').val('update');


  $('#block-form-submit').unbind('click').click(function() {
    block.blockData.title = $('#block-form-title').val();
    block.blockData.importance = $('#block-form-slider-importance .c').slider('value');

    cs.saveBlock(block, function(block) {
      blockTemplate.find('.title').text(block.blockData.title);
      blockTemplate.css({
        backgroundColor: Sup.Util.hexColourFromImportance(block.blockData.importance)
      });
      cs.form.fadeOut('fast', function() { cs.clearBlockForm(); });
    });

    return false;
  });

  form.fadeIn('fast');
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
      width: $(document).width(),
      height: $(document).height()
//      border: '1px solid #aaa'
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
  window.sup.initialise();

});