# 🚀 Deployment Guide - Confidential NFT Marketplace

## Quick Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "Add New Project"**
4. **Import your `zNFT` repository**
5. **Configure Project:**
   - Framework Preset: **Next.js**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. **Click "Deploy"**

That's it! Your app will be live in ~2 minutes at a Vercel URL.

---

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy (preview)
vercel

# Deploy to production
vercel --prod
```

---

## 📱 Current Status

**✅ UI Demo Mode Active**
- Beautiful violet/cyan modern design
- All pages fully functional (visual demo)
- Mock FHEVM encryption for demo purposes

**⚠️ Not Connected to Blockchain Yet**
- Smart contracts not deployed
- No real Web3 transactions
- Perfect for UI/UX showcase!

---

## 🔧 Environment Variables (For Production Later)

When you're ready to connect to real smart contracts, set these in Vercel:

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_id
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia testnet
```

**To add in Vercel:**
1. Go to your project dashboard
2. Settings → Environment Variables
3. Add each variable
4. Redeploy

---

## 📦 What Gets Deployed

Your Vercel deployment includes:
- ✅ Homepage with live auctions grid
- ✅ Mint NFT page
- ✅ Create Auction page
- ✅ My NFTs page
- ✅ Marketplace page
- ✅ Auction detail pages
- ✅ Modern violet/cyan theme
- ✅ Glass-morphism design
- ✅ Responsive mobile design

---

## 🎯 After Deployment

You'll get a URL like:
```
https://znft-[random-string].vercel.app
```

Share this to showcase:
- 💜 Beautiful modern UI
- 🔐 Encrypted auction concept
- 🎨 NFT marketplace design
- ⚡ Smooth user experience

---

## 🚀 Next Steps for Production

To make it fully functional:

1. **Deploy Smart Contracts** (see `contracts/` folder)
2. **Install Zama SDK** (see `MIGRATION_TO_OFFICIAL_SDK.md`)
3. **Update contract addresses** in environment variables
4. **Test on Sepolia testnet**
5. **Redeploy to Vercel**

---

## 💡 Tips

- **Custom Domain:** Add your own domain in Vercel settings
- **Auto Deploys:** Vercel auto-deploys on git push
- **Preview URLs:** Every PR gets its own preview URL
- **Analytics:** Enable Vercel Analytics for insights

---

## 🆘 Troubleshooting

**Build fails?**
- Check Node version (should be 18+)
- Ensure all dependencies installed
- Check build logs in Vercel dashboard

**Page not found?**
- Vercel auto-detects Next.js App Router
- Make sure `frontend` is set as root directory

**Slow builds?**
- First build takes longer (~2-3 min)
- Subsequent builds are cached (~30 sec)

---

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Zama Docs: https://docs.zama.ai/fhevm

Enjoy your deployment! 🎉
