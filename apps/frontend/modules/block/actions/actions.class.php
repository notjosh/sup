<?php

/**
 * block actions.
 *
 * @package    sup
 * @subpackage block
 * @author     Joshua May <notjosh@gmail.com>
 * @version    SVN: $Id: actions.class.php 12474 2008-10-31 10:41:27Z fabien $
 */
class blockActions extends sfActions
{
  public function executeIndex(sfWebRequest $request)
  {
    $this->block_list = Doctrine::getTable('Block')
      ->createQuery('b')
			->innerJoin('b.BlockData bd')
			->innerJoin('b.BlockPosition bp')
      ->execute();
  }

  public function executeNew(sfWebRequest $request)
  {
    $this->form = new BlockForm();
  }

  public function executeCreate(sfWebRequest $request)
  {
    $this->forward404Unless($request->isMethod(sfRequest::POST));

		$bPost = $request->getParameter('block');

		$bData = new BlockData();
		$bData->fromArray($bPost['block_data']);

		$bPosition = new BlockPosition();
		$bPosition->fromArray($bPost['block_position']);

		$block = new Block();
		$block->set('BlockData', $bData);
		$block->set('BlockPosition', $bPosition);

		$block->save();

		$this->block = $block;

    $this->setTemplate('show');
  }

  public function executeEdit(sfWebRequest $request)
  {
    $this->forward404Unless($block = Doctrine::getTable('Block')->find($request->getParameter('id')), sprintf('Object block does not exist (%s).', $request->getParameter('id')));
    $this->form = new BlockForm($block);
  }

  public function executeUpdate(sfWebRequest $request)
  {
    $this->forward404Unless($request->isMethod(sfRequest::POST) || $request->isMethod(sfRequest::PUT));
    $this->forward404Unless($block = Doctrine::getTable('Block')->find($request->getParameter('id')), sprintf('Object block does not exist (%s).', $request->getParameter('id')));

		$bData     = $block->get('BlockData');
		$bPosition = $block->get('BlockPosition');

		$bPost = $request->getParameter('block');

    $this->forward404Unless($bData->get('id') === $bPost['block_data']['id'], sprintf('Object block_data (%s) does not exist for block.', $bData->get('id')));
    $this->forward404Unless($bPosition->get('id') === $bPost['block_position']['id'], sprintf('Object block_position (%s) does not exist for block.', $bPosition->get('id')));

		$bData->fromArray($bPost['block_data']);
		$bPosition->fromArray($bPost['block_position']);

		$block->save();

		$this->block = $block;

    $this->setTemplate('show');
  }

  public function executeDelete(sfWebRequest $request)
  {
		$this->forward404Unless($block = Doctrine::getTable('Block')->find($request->getParameter('id')), sprintf('Object block does not exist (%s).', $request->getParameter('id')));
    $block->delete();

		return sfView::NONE;
  }

  protected function processForm(sfWebRequest $request, sfForm $form)
  {
    $form->bind($request->getParameter($form->getName()));
    if ($form->isValid())
    {
      $block = $form->save();

      $this->redirect('block/edit?id='.$block->getId());
    }
  }
}
