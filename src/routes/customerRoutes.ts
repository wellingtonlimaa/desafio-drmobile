import { Router } from 'express';
import * as customerController from '../controllers/customerController';

const router = Router();

router.post('/', customerController.createCustomer);
router.get('/', customerController.listCustomer);
router.get('/:id', customerController.getCustomer);
router.put('/:id', customerController.updateCustomer);
router.patch('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;