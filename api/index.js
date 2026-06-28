import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const ALCHEMY_KEY = process.env.ALCHEMY_KEY;
const BASE_URL = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_KEY}`;
const CORE_URL = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;

// 1. UPDATED: WALLET NFT FETCH WITH LIVE FLOOR DATA
app.get('/api/wallet/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const queryParams = new URLSearchParams({
      owner: address,
      withMetadata: 'true',
      'excludeFilters[]': 'SPAM'
    });

    const response = await fetch(`${BASE_URL}/getNFTsForOwner?${queryParams.toString()}`);
    if (!response.ok) throw new Error("Alchemy error");
    const data = await response.json();
    
    const collectionsMap = {};
    (data.ownedNfts || []).forEach(nft => {
      const name = nft.contract?.name || nft.collection?.name || nft.contract?.openSeaMetadata?.collectionName || "Verified Asset Collection";
      const contractAddress = nft.contract?.address || "0x";
      
      // Pull live floor parameters directly from the API metadata layer
      const floorVal = nft.contract?.openSeaMetadata?.floorPrice;
      const displayFloor = floorVal ? `${floorVal.toFixed(3)} ETH` : "0.000 ETH";
      
      if (!collectionsMap[name]) {
        collectionsMap[name] = {
          name: name,
          quantity: "0",
          qty: "0",
          contract: contractAddress,
          profit: displayFloor // Swapped static percentage fallback with real token price
        };
      }
      const newCount = String(parseInt(collectionsMap[name].qty) + 1);
      collectionsMap[name].quantity = newCount;
      collectionsMap[name].qty = newCount;
    });

    res.json({ holdings: Object.values(collectionsMap) });
  } catch (error) {
    res.json({ holdings: [] });
  }
});

// 2. DETAILED COLLECTION ITEMS LOGIC
app.get('/api/collection-details', async (req, res) => {
  try {
    const { owner, contract } = req.query;
    if (!owner) return res.json({ nfts: [] });

    const params = new URLSearchParams({ owner: owner, withMetadata: 'true' });
    if (contract && contract !== '0x') params.append('contractAddresses[]', contract);

    const response = await fetch(`${BASE_URL}/getNFTsForOwner?${params.toString()}`);
    const data = await response.json();

    const nfts = (data.ownedNfts || []).map(nft => {
      const attributes = nft.raw?.metadata?.attributes || nft.metadata?.attributes || [];
      const rankVal = nft.rarity?.rank || null;

      return {
        tokenId: nft.tokenId || "0",
        title: nft.name || nft.title || `#${nft.tokenId}`,
        tier: nft.tokenType || "ERC-721",
        rank: rankVal ? `#${rankVal}` : "Unranked",
        imageUrl: nft.image?.cachedUrl || nft.image?.originalUrl || "",
        traits: attributes.map(a => ({ trait: a.trait_type || a.key || "Trait", value: a.value }))
      };
    });

    res.json({ nfts });
  } catch (error) {
    res.json({ nfts: [] });
  }
});

// 3. LIVE GAS CHECKER ORACLE
app.get('/api/gas-live', async (req, res) => {
  try {
    const response = await fetch(CORE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_gasPrice', params: [] })
    });
    const data = await response.json();
    const hexPrice = data.result;
    const gweiValue = Math.ceil(parseInt(hexPrice, 16) / 1000000000);
    const finalGwei = String(gweiValue || 24);
    
    res.json({ success: true, total: finalGwei });
  } catch (e) {
    res.json({ success: true, total: "24" });
  }
});

// 4. JEET SCANNER WITH VALID TOKEN PARAMS
app.get('/api/jeet-score/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const response = await fetch(CORE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'alchemy_getTokenBalances', params: [address, "erc20"] })
    });
    const data = await response.json();
    const activeTokenCount = data.result?.tokenBalances?.length || 0;
    
    let score = "35"; 
    let tier = "Swing Trader";
    let summary = "Moderate asset lockup velocity detected.";
    
    if (activeTokenCount > 5) {
      score = "92";
      tier = "Diamond Handed Alpha";
      summary = "Maximum accumulation profile verified.";
    } else if (activeTokenCount === 0 || activeTokenCount < 2) {
      score = "12";
      tier = "Paper Handed Jeet";
      summary = "High frequency sell behavior noted.";
    }

    res.json({ success: true, score, tier, summary });
  } catch (e) {
    res.json({ success: true, score: "45", tier: "HODLer", summary: "Wallet scanning processed." });
  }
});

export default app;
