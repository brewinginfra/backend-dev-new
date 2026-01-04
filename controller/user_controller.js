import { prisma } from "../util/prisma_config.js"
import { ethers } from "ethers";

const RPC_URL = process.env.RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
const USDT_ADDRESS = "0x83BDe9dF64af5e475DB44ba21C1dF25e19A0cf9a";
const USDT_DECIMALS = 6;

// Initialize Blockchain Connection
const provider = new ethers.JsonRpcProvider(RPC_URL);


export const createProfile = async (req, res) => {
    const { name, walletAddress } = req.body;

    if (!walletAddress || !name) {
        return res.status(400).json({ error: 'Data walletAddress dan name harus diisi.' });
    }

    try {
        const newUser = await prisma.creator.create({
            data: {
                name: name.toLowerCase(),
                walletAddress: walletAddress,
            },
        });

        // Format response 
        const responseData = {
            id: newUser.id,
            name: newUser.name,
        };

        return res.status(200).json(responseData);

    } catch (error) {
        // Penanganan error Unique Constraint
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Profile sudah terdaftar (Wallet Address, Username,).' });
        }

        console.error('Error saat membuat creator', error);
        return res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
};


export const createAssets = async (req, res) => {
    try {
        const { creatorId, url, price, description } = req.body;

        if (
            !creatorId ||
            !url ||
            price === undefined ||
            price === null ||
            !description
        ) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }

        // Simpan ke database
        const asset = await prisma.assetMetadata.create({
            data: {
                creatorId:creatorId,
                Url:url,
                price:price,
                description:description,
                unlockableContent: false, // default
            },
        });

        return res.status(201).json({
            message: "success",
            data: asset,
        });
    } catch (error) {
        console.error("Error creating asset:", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const getAssets = async (req, res) => {
    try {
        const assets = await prisma.assetMetadata.findMany({
            orderBy: { id: "desc" },
        });

        return res.status(200).json(assets);
    } catch (error) {
        console.error("Error fetching assets:", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const getAssetsById = async (req, res) => {
    const { id } = req.params;
    try {
        const assets = await prisma.assetMetadata.findFirst({
            where: { id: parseInt(req.params.id) },
        });

        return res.status(200).json(assets);
    } catch (error) {
        console.error("Error fetching assets:", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const getProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const assets = await prisma.creator.findFirst({
            where: { id: parseInt(id) },
        });

        return res.status(200).json(assets);
    } catch (error) {
        console.error("Error fetching id:", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const getAssetsByIdCreator = async (req, res) => {
    const { idCreator } = req.params;
    try {
        const assets = await prisma.assetMetadata.findMany({
            where: { creatorId: parseInt(req.params.idCreator) },
        });

        return res.status(200).json(assets);
    } catch (error) {
        console.error("Error fetching assets:", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const login = async (req, res) => {
    const { username, walletAddress } = req.body;


    if (!username || !walletAddress) {
        return res.status(400).json({
            message: "Username and walletAddress are required for login."
        });
    }

    try {
        const user = await prisma.creator.findFirst({
            where: {
                name: username,
                walletAddress: walletAddress,
            },
            select: {
                id: true,
        
            }
        });

        if (user) {

            return res.status(200).json({
            creatorId: user.id,
            });
        } else {
            return res.status(401).json({
                message: "Invalid credentials (Username or Wallet Address not found)."
            });
        }

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            message: "Internal Server Error during login process.",
        });
    }
};

export const updateProfile = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const updated = await prisma.creator.update({
            where: { id: parseInt(id) },
            data: { name },
        });
        return res.status(200).json(updated);
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAssetsWithPayment = async (req, res) => {
    try {
        const { id } = req.params;

        const assets = await prisma.assetMetadata.findFirst({
            where: { id: parseInt(id) },
        });

        const assetWithCreator = await prisma.assetMetadata.findFirst({
            where: { id: parseInt(id) },
            include: {
                creator: true,
            },
        });

        return res.status(402).json({
            error: "Payment Required",
            message: "Access to this asset requires payment.",
            paymentDetails: {
                receiver: assetWithCreator.creator.walletAddress,
                amount: assets.price,
                currency: "mUSDT",
                tokenAddress: USDT_ADDRESS,
                decimals: USDT_DECIMALS,
                chainId: 421614, // Arbitrum Sepolia
                network: "arbitrum-sepolia",
                instruction: `Send ${assets.price} USDT (${USDT_ADDRESS}) to ${assetWithCreator.creator.walletAddress} on Arbitrum Sepolia.`,
            }
        });
    } catch (error) {
        console.error("Error fetching assets:", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const verifyAssetsPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { REQUIRED_AMOUNT_USDT, RECEIVER_ADDRESS, txHash } = req.body;

        if (!txHash) {
            return res.status(400).json({ error: "Missing txHash in request body" });
        }

        console.log(`Verifying transaction: ${txHash}`);

        // 1. Fetch transaction
        const tx = await provider.getTransaction(txHash);

        if (!tx) {
            return res
                .status(404)
                .json({ error: "Transaction not found on Arbitrum Sepolia" });
        }

        // 2. Verify confirmation
        // If confirmations is 0, it's pending. We require at least 1 confirmation.
        // We can optionally wait for it, but for a simple verify endpoint, we might just check status.
        // If we want to be nice, we could wait a bit, but usually REST APIs return status immediately.
        // Let's check status.

        // Note: In ethers v6, tx.confirmations can be null or 0 if pending?
        // We also want to check the receipt to ensure it didn't revert.
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt) {
            return res
                .status(404)
                .json({ error: "Transaction pending or not mined yet. Please wait." });
        }

        if (receipt.status !== 1) {
            return res
                .status(400)
                .json({ error: "Transaction failed (reverted) on-chain." });
        }

        // 3. Verify USDT Transfer
        // Check for Transfer event: Transfer(address from, address to, uint256 value)
        const erc20Interface = new ethers.Interface([
            "event Transfer(address indexed from, address indexed to, uint256 value)",
        ]);

        let amountPaid = BigInt(0);

        for (const log of receipt.logs) {
            if (log.address.toLowerCase() === USDT_ADDRESS.toLowerCase()) {
                try {
                    const parsedLog = erc20Interface.parseLog(log);
                    if (parsedLog && parsedLog.name === "Transfer") {
                        const to = parsedLog.args[1];
                        const value = parsedLog.args[2];

                        if (to.toLowerCase() === RECEIVER_ADDRESS.toLowerCase()) {
                            amountPaid += value;
                        }
                    }
                } catch (e) {
                    // Ignore parsing errors for other events
                }
            }
        }

        const requiredUnits = ethers.parseUnits(REQUIRED_AMOUNT_USDT, USDT_DECIMALS);

        if (amountPaid < requiredUnits) {
            return res.status(400).json({
                error: "Insufficient Payment",
                message: `Payment not found or insufficient. Received ${ethers.formatUnits(
                    amountPaid,
                    USDT_DECIMALS
                )} USDT. Required: ${REQUIRED_AMOUNT_USDT} USDT.`,
            });
        }

        // 5. Success
        // In a real app, you would probably issue a JWT or session token here.
        // Since the objective is simple, we return the protected data directly.

        console.log(`Payment Verified! Access Granted for ${txHash}`);

        const assets = await prisma.assetMetadata.findFirst({
            where: { id: parseInt(id) },
        });

        return res.status(200).json(assets);
    } catch (error) {
        console.error("Error verifying assets payment:", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const getProfileByWalletAddress = async (req, res) => {
    const { walletAddress } = req.params;
    // Validate wallet address
    if (!walletAddress) {
        return res.status(400).json({
            error: 'Wallet address is required.'
        });
    }
    // Basic format validation
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
        return res.status(400).json({
            error: 'Invalid wallet address format.'
        });
    }
    try {
        const creator = await prisma.creator.findFirst({
            where: {
                walletAddress: walletAddress
            },
            select: {
                id: true,
                name: true,
                walletAddress: true,
            }
        });
        // If no creator found, return 404
        if (!creator) {
            return res.status(404).json({
                error: 'Creator not found.'
            });
        }
        return res.status(200).json(creator);
    } catch (error) {
        console.error("Error finding creator by wallet:", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};


export const getChatWithPayment = async (req, res) => {
    try {
        const { creatorId } = req.params;
        const {amount} = req.body

        const creator = await prisma.creator.findFirst({
            where: { id: parseInt(creatorId) },
        });

        return res.status(402).json({
            error: "Payment Required",
            message: "Access to this asset requires payment.",
            paymentDetails: {
                receiver: creator.walletAddress,
                amount: amount,
                currency: "mUSDT",
                tokenAddress: USDT_ADDRESS,
                decimals: USDT_DECIMALS,
                chainId: 421614, // Arbitrum Sepolia
                network: "arbitrum-sepolia",
                instruction: `Send  0.0001 USDT (${USDT_ADDRESS}) to ${creator.walletAddress} on Arbitrum Sepolia.`,
            }
        });
    } catch (error) {
        console.error("Error fetching creator:", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const verifyChatPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { REQUIRED_AMOUNT_USDT, RECEIVER_ADDRESS, txHash } = req.body;

        if (!txHash) {
            return res.status(400).json({ error: "Missing txHash in request body" });
        }

        console.log(`Verifying transaction: ${txHash}`);

        // 1. Fetch transaction
        const tx = await provider.getTransaction(txHash);

        if (!tx) {
            return res
                .status(404)
                .json({ error: "Transaction not found on Arbitrum Sepolia" });
        }

        // 2. Verify confirmation
        // If confirmations is 0, it's pending. We require at least 1 confirmation.
        // We can optionally wait for it, but for a simple verify endpoint, we might just check status.
        // If we want to be nice, we could wait a bit, but usually REST APIs return status immediately.
        // Let's check status.

        // Note: In ethers v6, tx.confirmations can be null or 0 if pending?
        // We also want to check the receipt to ensure it didn't revert.
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt) {
            return res
                .status(404)
                .json({ error: "Transaction pending or not mined yet. Please wait." });
        }

        if (receipt.status !== 1) {
            return res
                .status(400)
                .json({ error: "Transaction failed (reverted) on-chain." });
        }

        // 3. Verify USDT Transfer
        // Check for Transfer event: Transfer(address from, address to, uint256 value)
        const erc20Interface = new ethers.Interface([
            "event Transfer(address indexed from, address indexed to, uint256 value)",
        ]);

        let amountPaid = BigInt(0);

        for (const log of receipt.logs) {
            if (log.address.toLowerCase() === USDT_ADDRESS.toLowerCase()) {
                try {
                    const parsedLog = erc20Interface.parseLog(log);
                    if (parsedLog && parsedLog.name === "Transfer") {
                        const to = parsedLog.args[1];
                        const value = parsedLog.args[2];

                        if (to.toLowerCase() === RECEIVER_ADDRESS.toLowerCase()) {
                            amountPaid += value;
                        }
                    }
                } catch (e) {
                    // Ignore parsing errors for other events
                }
            }
        }

        const requiredUnits = ethers.parseUnits(REQUIRED_AMOUNT_USDT, USDT_DECIMALS);

        if (amountPaid < requiredUnits) {
            return res.status(400).json({
                error: "Insufficient Payment",
                message: `Payment not found or insufficient. Received ${ethers.formatUnits(
                    amountPaid,
                    USDT_DECIMALS
                )} USDT. Required: ${REQUIRED_AMOUNT_USDT} USDT.`,
            });
        }

        // 5. Success
        // In a real app, you would probably issue a JWT or session token here.
        // Since the objective is simple, we return the protected data directly.

        console.log(`Payment Verified! Access Granted for ${txHash}`);

        const creator = await prisma.creator.findFirst({
            where: { id: parseInt(id) },
        });

        return res.status(200).json(creator);
    } catch (error) {
        console.error("Error verifying chat payment:", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
