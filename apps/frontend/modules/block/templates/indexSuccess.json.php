<?php $a = array() ?>

<?php foreach ($block_list as $block): ?>
	<?php $a[] = $block->toArray()->getRawValue() ?>
<?php endforeach ?>

<?php echo json_encode($a) ?>