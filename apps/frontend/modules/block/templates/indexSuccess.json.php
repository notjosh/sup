<?php $a = array() ?>

<?php foreach ($blocks as $block): ?>
	<?php $a[] = $block->toArray()->getRawValue() ?>
<?php endforeach ?>

<?php echo json_encode($a) ?>