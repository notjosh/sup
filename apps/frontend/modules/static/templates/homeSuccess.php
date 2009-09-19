<noscript>you ain't gonna believe this. this script requires Javascript.</noscript>

<script type="text/javascript" charset="utf-8">
$(function() {
	$.getJSON('<?php echo url_for('block/index') ?>', function(data) {
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

			sup.addBlock(b);

		});
	});
});
</script>