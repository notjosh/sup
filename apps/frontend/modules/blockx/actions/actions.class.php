<?php

/**
 * block actions.
 *
 * @package    sup
 * @subpackage block
 * @author     Joshua May <notjosh@gmail.com>
 * @version    SVN: $Id: actions.class.php 12479 2008-10-31 10:54:40Z fabien $
 */
class blockActions extends sfActions
{
	/**
	 * Executes index action
	 *
	 */
	public function executeIndex (sfWebRequest $request)
	{
		// get all blocks
		$blocks = Doctrine::getTable('Block')
			->createQuery('b')
			->innerJoin('b.BlockData bd')
			->innerJoin('b.BlockPosition bp')
			->execute();

		$this->blocks = $blocks;
	}
}
