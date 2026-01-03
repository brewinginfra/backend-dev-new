import express from 'express';
import { createProfile,login, createAssets, getProfile, getAssets, getAssetsById, getAssetsByIdCreator, getAssetsWithPayment, verifyAssetsPayment } from '../controller/user_controller.js';

const router = express.Router();
router.post('/creator/register', createProfile);
router.get('/creator/register/:id', getProfile);
router.post('/creator/login', login);
router.post('/creator/assets', createAssets);
router.get('/creator/assets', getAssets);
router.get('/creator/assets/:id', getAssetsById);
router.get('/creator/assets-creator/:idCreator', getAssetsByIdCreator)

// payment x402
router.get('/creator/assets/:id/purchase', getAssetsWithPayment);
router.post('/creator/assets/:id/verify', verifyAssetsPayment);
export default router;