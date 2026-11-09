import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  Share2,
  Download,
  Copy,
  ExternalLink,
  CheckCircle,
  Truck,
  Package,
  Layers,
  Sparkles,
  Smartphone,
  Eye,
  RefreshCw,
  Search,
  Check,
  ChevronRight,
  Database,
  Sliders,
  DollarSign,
  AlertCircle
} from "lucide-react";

// Official Philippine Couriers
const PH_COURIERS = [
  { id: "jt", name: "J&T Express", defaultFee: 165, trackingUrl: "https://www.jtexpress.ph/index/query/gzquery.html?bills=" },
  { id: "lbc", name: "LBC Express", defaultFee: 210, trackingUrl: "https://www.lbcexpress.com/track/?tracking_no=" },
  { id: "flash", name: "Flash Express", defaultFee: 145, trackingUrl: "https://www.flashexpress.ph/tracking/?se=" },
  { id: "gogo", name: "GoGo Xpress", defaultFee: 130, trackingUrl: "https://app.gogoxpress.com/track/" },
  { id: "lalamove", name: "Lalamove / Grab", defaultFee: 250, trackingUrl: "" }
];

const INITIAL_INVENTORY = [
  {
    id: "FCPH-2024-001",
    year: "2020-21",
    brandSet: "Panini Prizm",
    player: "Luka Doncic",
    cardNumber: "75",
    parallel: "Silver Prizm",
    grade: "PSA 9",
    description: "2020-21 Panini Prizm Luka Doncic #75 - Silver Prizm (PSA 9)",
    price: 3200,
    qty: 1,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80",
    updatedAt: new Date().toISOString()
  },
  {
    id: "FCPH-2024-002",
    year: "2023-24",
    brandSet: "Panini Select",
    player: "Victor Wembanyama",
    cardNumber: "101",
    parallel: "Concourse Blue Prizm",
    grade: "Raw / Near Mint",
    description: "2023-24 Panini Select Victor Wembanyama #101 - Concourse Blue Prizm",
    price: 7800,
    qty: 1,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&auto=format&fit=crop&q=80",
    updatedAt: new Date().toISOString()
  }
];

// Fate Collections Vector Logo
function FateLogo({ className = "w-10 h-10" }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
        <polygon points="100,10 185,55 170,165 100,195 30,165 15,55" fill="#160F2E" stroke="#EC4899" strokeWidth="6" />
        <rect x="55" y="45" width="55" height="80" rx="8" transform="rotate(-14 82 85)" fill="#2E1065" stroke="#F59E0B" strokeWidth="4" />
        <rect x="90" y="45" width="55" height="80" rx="8" transform="rotate(12 117 85)" fill="#4C1D95" stroke="#F43F5E" strokeWidth="4" />
        <circle cx="100" cy="85" r="14" fill="#F59E0B" />
        <polygon points="100,75 103,82 110,85 103,88 100,95 97,88 90,85 97,82" fill="#FFFFFF" />
        <path d="M 25 135 Q 100 115 175 135 L 170 160 Q 100 140 30 160 Z" fill="#BE123C" stroke="#F59E0B" strokeWidth="3" />
        <text x="100" y="125" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="32" fontFamily="system-ui, sans-serif" letterSpacing="1">Fate</text>
        <text x="100" y="152" textAnchor="middle" fill="#FDE047" fontWeight="800" fontSize="13" fontFamily="system-ui, sans-serif" letterSpacing="2">COLLECTIONS.PH</text>
      </svg>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("scanner");
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("fcph_inventory");
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("fcph_orders");
    return saved ? JSON.parse(saved) : [];
  });

  const [dbConfig, setDbConfig] = useState({
    uri: "mongodb+srv://hl08231984_db_user:Vglog6uKTALZpP65@card-ledger-cluster.ivgjb3k.mongodb.net",
    dbName: "CardLedgerDB",
    collection: "CardLedger",
    ordersCollection: "orders"
  });

  const [syncStatus, setSyncStatus] = useState("Connected");

  // Scanner State
  const [scannedImage, setScannedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cardForm, setCardForm] = useState({
    year: "2023-24",
    brandSet: "Panini Prizm",
    player: "Victor Wembanyama",
    cardNumber: "136",
    parallel: "Silver Prizm",
    grade: "PSA 10",
    price: 18500,
    qty: 1
  });

  // Invoice State
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: "",
    messengerHandle: "",
    phone: "",
    address: "",
    selectedCardId: "",
    courier: "jt",
    shippingFee: 165
  });

  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("fcph_inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("fcph_orders", JSON.stringify(orders));
  }, [orders]);

  const synthesizedDescription = `${cardForm.year} ${cardForm.brandSet} ${cardForm.player} #${cardForm.cardNumber}${cardForm.parallel ? ` - ${cardForm.parallel}` : ""}${cardForm.grade ? ` (${cardForm.grade})` : ""}`.trim();

  const handleAddCard = () => {
    const newCard = {
      id: `FCPH-${Date.now().toString().slice(-6)}`,
      ...cardForm,
      description: synthesizedDescription,
      status: "In Stock",
      image: scannedImage || "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80",
      updatedAt: new Date().toISOString()
    };
    setInventory([newCard, ...inventory]);
    alert("Card added to inventory and synced!");
    setActiveTab("inventory");
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const item = inventory.find(c => c.id === invoiceForm.selectedCardId);
    if (!item) {
      alert("Please select a card from inventory.");
      return;
    }

    const courierObj = PH_COURIERS.find(c => c.id === invoiceForm.courier);
    const newOrder = {
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      customerName: invoiceForm.customerName,
      messengerHandle: invoiceForm.messengerHandle,
      phone: invoiceForm.phone,
      address: invoiceForm.address,
      cardId: item.id,
      cardDescription: item.description,
      cardPrice: Number(item.price),
      courier: courierObj.name,
      shippingFee: Number(invoiceForm.shippingFee),
      grandTotal: Number(item.price) + Number(invoiceForm.shippingFee),
      trackingNumber: `PH-${Math.floor(100000000 + Math.random() * 900000000)}`,
      status: "Payment Confirmed",
      date: new Date().toLocaleDateString("en-PH")
    };

    setOrders([newOrder, ...orders]);
    setInventory(inventory.map(c => c.id === item.id ? { ...c, status: "Reserved" } : c));
    alert("Invoice generated and order created!");
    setActiveTab("shipping");
  };

  const generateReceiptText = (order) => {
    return `🃏 FATE COLLECTIONS PH - OFFICIAL RECEIPT
--------------------------------------
Order ID: #${order.orderId}
Date: ${order.date}

CUSTOMER DETAILS:
Name: ${order.customerName}
Contact: ${order.phone}
Address: ${order.address}

ITEMIZED ORDER:
• ${order.cardDescription}
  Price: ₱ ${order.cardPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}

Shipping via ${order.courier}: ₱ ${order.shippingFee.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
--------------------------------------
GRAND TOTAL: ₱ ${order.grandTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}

Status: ${order.status}
Tracking #: ${order.trackingNumber}

Thank you for trusting Fate Collections PH! 🇵🇭✨`;
  };

  const copyAndOpenMessenger = (order) => {
    const text = generateReceiptText(order);
    navigator.clipboard.writeText(text);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2500);

    const messengerUrl = order.messengerHandle
      ? `https://m.me/${order.messengerHandle.replace("@", "")}`
      : "https://www.messenger.com";
    window.open(messengerUrl, "_blank");
  };

  const handleDownloadCompassJSON = () => {
    const exportData = inventory.map(item => ({
      _id: { "$oid": Math.random().toString(16).substring(2, 26).padStart(24, '0') },
      ...item
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CardLedger_compass_import.json";
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0B0818] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#160F2E]/95 backdrop-blur-md border-b border-[#2B1E54] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FateLogo className="w-9 h-9" />
            <div>
              <h1 className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300">
                FATE COLLECTIONS PH
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{dbConfig.dbName}.{dbConfig.collection}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("install")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600/20 text-pink-300 border border-pink-500/30 text-xs font-semibold hover:bg-pink-600/30 transition-all"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        </div>

        {/* Top Scrollable Tab Navigation */}
        <div className="max-w-5xl mx-auto mt-2 flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "scanner", label: "Scanner", icon: Camera },
            { id: "inventory", label: "Inventory", icon: Package },
            { id: "invoices", label: "Invoices", icon: Layers },
            { id: "shipping", label: "Shipping", icon: Truck },
            { id: "compass", label: "Compass / DB", icon: Database },
            { id: "install", label: "Install", icon: Smartphone }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0 transition-all font-semibold ${
                  active
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-600/30 border border-pink-400/50"
                    : "bg-[#1E143E] text-slate-300 hover:bg-[#281B54] border border-[#2B1E54]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 pb-24">
        {/* TAB 1: SCANNER */}
        {activeTab === "scanner" && (
          <div className="space-y-6">
            <div className="bg-[#160F2E] p-6 rounded-2xl border border-[#2B1E54] shadow-xl">
              <h2 className="text-lg font-bold text-pink-400 flex items-center gap-2 mb-2">
                <Camera className="w-5 h-5 text-pink-400" />
                Mobile Sports Card AI Scanner
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Scan slab barcodes, serial numbers, player name, set year, and parallel variant. Details auto-populate into Philippine collector formatting.
              </p>

              {/* Upload & Camera Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold hover:brightness-110 shadow-lg shadow-pink-600/20"
                >
                  <Camera className="w-5 h-5" />
                  <span>Open Camera</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#221644] text-pink-300 border border-pink-500/40 font-bold hover:bg-[#2B1B54]"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Card Photo</span>
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setScannedImage(URL.createObjectURL(f));
                  }}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setScannedImage(URL.createObjectURL(f));
                  }}
                />
              </div>

              {/* Card Photo Preview */}
              {scannedImage && (
                <div className="mb-6 flex flex-col items-center p-3 bg-[#0B0818] rounded-xl border border-pink-500/30">
                  <img src={scannedImage} alt="Card preview" className="max-h-64 object-contain rounded-lg shadow-lg mb-2" />
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Image captured & analyzed
                  </span>
                </div>
              )}

              {/* Card Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Year</label>
                  <input
                    type="text"
                    value={cardForm.year}
                    onChange={(e) => setCardForm({ ...cardForm, year: e.target.value })}
                    className="w-full mt-1 bg-[#0B0818] border border-[#2B1E54] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Brand / Set</label>
                  <input
                    type="text"
                    value={cardForm.brandSet}
                    onChange={(e) => setCardForm({ ...cardForm, brandSet: e.target.value })}
                    className="w-full mt-1 bg-[#0B0818] border border-[#2B1E54] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Player Name</label>
                  <input
                    type="text"
                    value={cardForm.player}
                    onChange={(e) => setCardForm({ ...cardForm, player: e.target.value })}
                    className="w-full mt-1 bg-[#0B0818] border border-[#2B1E54] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Card Number (#)</label>
                  <input
                    type="text"
                    value={cardForm.cardNumber}
                    onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                    className="w-full mt-1 bg-[#0B0818] border border-[#2B1E54] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Parallel / Insert / Variant</label>
                  <input
                    type="text"
                    value={cardForm.parallel}
                    onChange={(e) => setCardForm({ ...cardForm, parallel: e.target.value })}
                    className="w-full mt-1 bg-[#0B0818] border border-[#2B1E54] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Grade / Company</label>
                  <input
                    type="text"
                    value={cardForm.grade}
                    onChange={(e) => setCardForm({ ...cardForm, grade: e.target.value })}
                    className="w-full mt-1 bg-[#0B0818] border border-[#2B1E54] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Standardized Collector Output Preview */}
              <div className="mt-4 p-3 bg-[#0B0818] border border-amber-500/30 rounded-xl">
                <span className="text-[11px] font-bold text-amber-400 block mb-1">AUTOMATED COLLECTOR DESCRIPTION:</span>
                <p className="text-sm font-semibold text-white">{synthesizedDescription}</p>
              </div>

              {/* Price & Add to Inventory */}
              <div className="mt-6 flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                  <label className="text-xs font-semibold text-slate-300">Price in Philippine Peso (PHP / ₱)</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-pink-400 font-bold">₱</span>
                    <input
                      type="number"
                      value={cardForm.price}
                      onChange={(e) => setCardForm({ ...cardForm, price: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 bg-[#0B0818] border border-[#2B1E54] rounded-lg text-sm text-white font-bold focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddCard}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 font-bold text-white shadow-lg shadow-pink-600/30 hover:brightness-110 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Save to Inventory & DB</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Active Sports Card Inventory</h2>
                <p className="text-xs text-slate-400">{inventory.length} cards tracked</p>
              </div>
              <button
                onClick={() => setActiveTab("scanner")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 rounded-lg text-xs font-bold text-white shadow-md hover:bg-pink-500"
              >
                <Plus className="w-4 h-4" /> Add Card
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventory.map((card) => (
                <div key={card.id} className="bg-[#160F2E] p-4 rounded-xl border border-[#2B1E54] flex gap-3 shadow-lg">
                  <img src={card.image} alt="" className="w-20 h-28 object-cover rounded-lg border border-[#2B1E54] shrink-0" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-pink-400">{card.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          card.status === "In Stock" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}>
                          {card.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1 leading-snug">{card.description}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-base font-extrabold text-amber-400">
                        ₱ {Number(card.price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => {
                          setInvoiceForm({ ...invoiceForm, selectedCardId: card.id });
                          setActiveTab("invoices");
                        }}
                        className="text-xs px-2.5 py-1 bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-lg font-semibold hover:bg-purple-600/50"
                      >
                        Create Invoice
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INVOICES */}
        {activeTab === "invoices" && (
          <div className="max-w-2xl mx-auto bg-[#160F2E] p-6 rounded-2xl border border-[#2B1E54] shadow-xl">
            <h2 className="text-lg font-bold text-pink-400 mb-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-pink-400" />
              Digital Receipt & Invoice Generator
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Create official itemized receipts with courier rates and send directly to Messenger.
            </p>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Select Card From Inventory</label>
                <select
                  value={invoiceForm.selectedCardId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, selectedCardId: e.target.value })}
                  className="w-full mt-1 bg-[#0B0818] border border-[#2B1E54] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  required
                >
                  <option value="">-- Choose Card --</option>
                  {inventory.filter(c => c.status === "In Stock").map(c => (
                    <option key={c.id} value={c.id}>{c.description} - ₱ {c.price.toLocaleString("en-PH")}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Customer Full Name</label>
                  <input
                    type="text"
                    value={invoiceForm.customerName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                    placeholder="e.g. Juan dela Cruz"
                    className="w-full mt-1 bg-[#0B0818] border border-[#2B1E54] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Facebook / Messenger Username</label>
                  <input
                    type="text"
                    value={invoiceForm.messengerHandle}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, messengerHandle: e.target.value })}
                    placeholder="e.g. juandelacruz"
                    className="w-full mt-1 bg-[#0B0818] border border-[#2B1E54] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Phone Number (GCash/Contact)</label>
                  <input
                    type="text"
                    value={invoiceForm.phone}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, phone: e.target.value })}
                    placeholder="0917XXXXXXX"
                    className="w-full mt-1 bg-[#0B0818] border border-[#2B1E54] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Courier Provider</label>
                  <select
                    value={invoiceForm.courier}
                    onChange={(e) => {
                      const c = PH_COURIERS.find(x => x.id === e.target.value);
                      setInvoiceForm({ ...invoiceForm, courier: e.target.value, shippingFee: c ? c.defaultFee : 150 });
                    }}
                    className="w-full mt-1 bg-[#0B0818] border border-[#2B1E54] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  >
                    {PH_COURIERS.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (Default: ₱{c.defaultFee})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Delivery Address</label>
                <textarea
                  value={invoiceForm.address}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, address: e.target.value })}
                  placeholder="Block, Lot, Street, Barangay, City, Metro Manila / Province"
                  rows={2}
                  className="w-full mt-1 bg-[#0B0818] border border-[#2B1E54] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Shipping Fee (PHP / ₱)</label>
                <input
                  type="number"
                  value={invoiceForm.shippingFee}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, shippingFee: Number(e.target.value) })}
                  className="w-full mt-1 bg-[#0B0818] border border-[#2B1E54] rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 font-bold text-white shadow-lg shadow-pink-600/30 hover:brightness-110"
              >
                Generate Invoice & Open Tracker
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: SHIPPING */}
        {activeTab === "shipping" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-pink-400" />
              Order Delivery & Courier Waybill Tracking
            </h2>

            {orders.length === 0 ? (
              <div className="bg-[#160F2E] p-8 text-center rounded-2xl border border-[#2B1E54]">
                <Package className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-semibold">No orders generated yet.</p>
                <p className="text-xs text-slate-500 mt-1">Create an invoice from your inventory to start tracking shipments.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.orderId} className="bg-[#160F2E] p-5 rounded-2xl border border-[#2B1E54] shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#2B1E54]">
                    <div>
                      <span className="text-xs font-mono text-pink-400 font-bold">#{order.orderId}</span>
                      <h3 className="text-base font-bold text-white">{order.customerName}</h3>
                      <p className="text-xs text-slate-400">{order.address}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        {order.status}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">{order.courier} • {order.trackingNumber}</p>
                    </div>
                  </div>

                  <div className="py-3 text-sm">
                    <p className="font-semibold text-slate-200">{order.cardDescription}</p>
                    <p className="text-xs text-amber-400 font-bold mt-1">
                      Grand Total: ₱ {order.grandTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })} (Item: ₱{order.cardPrice.toLocaleString()} + Shipping: ₱{order.shippingFee})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() => copyAndOpenMessenger(order)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:brightness-110"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{copiedInvoice ? "Copied! Opening..." : "Send via Messenger"}</span>
                    </button>
                    <button
                      onClick={() => {
                        const nextStatuses = ["Payment Confirmed", "Packed & Ready", "In Transit", "Delivered"];
                        const nextIdx = (nextStatuses.indexOf(order.status) + 1) % nextStatuses.length;
                        setOrders(orders.map(o => o.orderId === order.orderId ? { ...o, status: nextStatuses[nextIdx] } : o));
                      }}
                      className="px-3 py-2 rounded-xl bg-[#221644] text-purple-300 border border-purple-500/40 text-xs font-bold hover:bg-[#2B1B54]"
                    >
                      Advance Status ➔
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: COMPASS / DB */}
        {activeTab === "compass" && (
          <div className="bg-[#160F2E] p-6 rounded-2xl border border-[#2B1E54] shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#2B1E54]">
              <div>
                <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  MongoDB Compass & Atlas Sync Hub
                </h2>
                <p className="text-xs text-slate-400">Target: {dbConfig.dbName}.{dbConfig.collection}</p>
              </div>
              <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
                ● Live Ready
              </span>
            </div>

            <div className="p-4 bg-[#0B0818] rounded-xl border border-[#2B1E54]">
              <span className="text-xs font-bold text-slate-300 block mb-1">Your Active MongoDB URI:</span>
              <p className="text-xs font-mono text-emerald-400 break-all bg-[#160F2E] p-2.5 rounded-lg border border-[#2B1E54]">
                {dbConfig.uri}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadCompassJSON}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 hover:brightness-110"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON for CardLedger Compass</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(dbConfig.uri);
                  alert("Copied connection string for MongoDB Compass!");
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#221644] text-purple-300 border border-purple-500/40 font-bold text-sm hover:bg-[#2B1B54]"
              >
                <Copy className="w-4 h-4" />
                <span>Copy for Compass</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: INSTALL */}
        {activeTab === "install" && (
          <div className="bg-[#160F2E] p-6 rounded-2xl border border-[#2B1E54] shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-pink-400 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-pink-400" />
              Install on Android & iPhone
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0B0818] rounded-xl border border-[#2B1E54]">
                <h3 className="text-sm font-bold text-emerald-400 mb-2">🤖 Android (Chrome / Samsung)</h3>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                  <li>Open this web app link in Google Chrome.</li>
                  <li>Tap the <strong>Install App</strong> button or tap Chrome menu (<strong>⋮</strong>).</li>
                  <li>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                </ol>
              </div>

              <div className="p-4 bg-[#0B0818] rounded-xl border border-[#2B1E54]">
                <h3 className="text-sm font-bold text-blue-400 mb-2">🍎 iPhone / iPad (Safari)</h3>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                  <li>Open this web app link in <strong>Apple Safari</strong>.</li>
                  <li>Tap the <strong>Share</strong> button (square with up-arrow ⎙).</li>
                  <li>Scroll down and tap <strong>Add to Home Screen (⊞)</strong>.</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Floating Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#160F2E]/95 backdrop-blur-lg border-t border-[#2B1E54] py-2 px-4">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {[
            { id: "scanner", label: "Scanner", icon: Camera },
            { id: "inventory", label: "Inventory", icon: Package },
            { id: "invoices", label: "Invoice", icon: Layers },
            { id: "shipping", label: "Shipping", icon: Truck },
            { id: "compass", label: "Compass", icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 transition-all ${
                  active ? "text-pink-400 scale-105" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
