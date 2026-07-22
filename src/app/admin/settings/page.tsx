"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Palette, Layout, Type, Image as ImageIcon, CheckCircle, Package, Lock } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "Bougie Hair & Beauty",
    primaryColor: "#E6127E",
    secondaryColor: "#FAF3E7",
    accentColor: "#D4AF37",
    textPrimaryColor: "#3E1D10",
    textSecondaryColor: "#6B5850",
    heroTitle: "Hair, Wigs, Lashes, Spa & Nails — All Under One Roof",
    heroSubtitle: "Braiding, wigs, lash extensions, a Japanese head spa & a full nail bar — book online in minutes.",
    heroImage: "/hero_model_2.jpg",
    heroVideoUrl: "",
    heroMediaType: "image",
    logoUrl: "",
    aboutHeading: "Our Story",
    aboutImage: "/service_hair.png",
    aboutIntro: "",
    aboutBody: "",
    aboutBadgeNumber: "5",
    aboutBadgeLabel: "Service Departments",
    stripePublishableKey: "",
    whatsappNumber: "",
    instagramUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    twitterUrl: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    currencySymbol: "£",
    enableOTP: true,
    enableEmailLink: true,
    requireDeposit: false,
    bankDetails: "",
    bankAccountName: "",
    bookingPolicy: "",
  });

  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings(data);
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaveStatus("saving");
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const [accountForm, setAccountForm] = useState({ currentPassword: "", newEmail: "", newPassword: "", confirmPassword: "" });
  const [accountStatus, setAccountStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [accountError, setAccountError] = useState("");

  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError("");

    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
      setAccountError("New password and confirmation don't match.");
      return;
    }

    setAccountStatus("saving");
    const res = await fetch("/api/admin/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: accountForm.currentPassword,
        newEmail: accountForm.newEmail || undefined,
        newPassword: accountForm.newPassword || undefined,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setAccountError(data.error || "Failed to update account.");
      setAccountStatus("idle");
      return;
    }

    setAccountStatus("saved");
    setAccountForm({ currentPassword: "", newEmail: "", newPassword: "", confirmPassword: "" });
    // The session's email/password are cached in the JWT at sign-in, so a
    // changed credential won't reflect until the next login.
    setTimeout(() => signOut({ callbackUrl: "/login" }), 1500);
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSettings({ ...settings, [field]: data.url });
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  if (loading && !settings.companyName) return <div className="flex items-center justify-center h-96">Loading Studio Engine...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Configuration Form */}
      <div className="flex-1 space-y-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-bougie-espresso/10 flex items-center justify-center text-bougie-espresso">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-serif">Brand Control Center</h3>
          </div>
          
          <div className="space-y-8">
            {/* Visual Identity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-bougie-espresso/60">Primary Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={settings.primaryColor || "#E8B8B0"}
                    onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                    className="w-10 h-10 rounded-lg border-none p-0 cursor-pointer overflow-hidden"
                  />
                  <input type="text" value={settings.primaryColor || ""} className="flex-1 text-xs border rounded-lg px-2" readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-bougie-espresso/60">Secondary Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={settings.secondaryColor || "#FFF9F6"}
                    onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                    className="w-10 h-10 rounded-lg border-none p-0 cursor-pointer"
                  />
                  <input type="text" value={settings.secondaryColor || ""} className="flex-1 text-xs border rounded-lg px-2" readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-bougie-espresso/60">Accent Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={settings.accentColor || "#D4AF37"}
                    onChange={(e) => setSettings({...settings, accentColor: e.target.value})}
                    className="w-10 h-10 rounded-lg border-none p-0 cursor-pointer"
                  />
                  <input type="text" value={settings.accentColor || ""} className="flex-1 text-xs border rounded-lg px-2" readOnly />
                </div>
              </div>
            </div>

            {/* Typography Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-dashed">
              <div className="space-y-2">
                <label className="text-sm font-medium text-bougie-espresso/60">Primary Font Color (Titles & Headers)</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={settings.textPrimaryColor || "#18181b"}
                    onChange={(e) => setSettings({...settings, textPrimaryColor: e.target.value})}
                    className="w-10 h-10 rounded-lg border-none p-0 cursor-pointer overflow-hidden"
                  />
                  <input type="text" value={settings.textPrimaryColor || ""} className="flex-1 text-xs border rounded-lg px-2" readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-bougie-espresso/60">Secondary Font Color (Body & Subtitles)</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={settings.textSecondaryColor || "#71717a"}
                    onChange={(e) => setSettings({...settings, textSecondaryColor: e.target.value})}
                    className="w-10 h-10 rounded-lg border-none p-0 cursor-pointer overflow-hidden"
                  />
                  <input type="text" value={settings.textSecondaryColor || ""} className="flex-1 text-xs border rounded-lg px-2" readOnly />
                </div>
              </div>
            </div>

            {/* Content Control */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-bougie-espresso/50 mb-2">
                <Type className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Content & Messaging</span>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Company Name</label>
                  <input 
                    type="text" 
                    value={settings.companyName || ""}
                    onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bougie-espresso outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Hero Title</label>
                  <input 
                    type="text" 
                    value={settings.heroTitle || ""}
                    onChange={(e) => setSettings({...settings, heroTitle: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Hero Subtitle</label>
                  <textarea 
                    value={settings.heroSubtitle || ""}
                    onChange={(e) => setSettings({...settings, heroSubtitle: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border h-24"
                  />
                </div>

                {/* Gateways & Integrations */}
                <div className="pt-8 border-t space-y-6">
                  <div className="flex items-center gap-2 text-bougie-espresso/50 mb-2">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Hero Media & Branding</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Hero Media Type</label>
                      <div className="flex bg-bougie-cream drop-shadow-sm p-1 rounded-xl">
                        <button 
                          onClick={() => setSettings({...settings, heroMediaType: 'image'})}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${settings.heroMediaType === 'image' ? 'bg-white shadow-sm text-bougie-espresso' : 'text-bougie-espresso/60'}`}
                        >
                          Image
                        </button>
                        <button 
                          onClick={() => setSettings({...settings, heroMediaType: 'video'})}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${settings.heroMediaType === 'video' ? 'bg-white shadow-sm text-bougie-espresso' : 'text-bougie-espresso/60'}`}
                        >
                          Video
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">
                        Upload Hero {settings.heroMediaType === 'image' ? 'Image' : 'Video'}
                      </label>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="file" 
                          accept={settings.heroMediaType === 'image' ? "image/*" : "video/*"}
                          onChange={(e) => uploadFile(e, settings.heroMediaType === 'image' ? 'heroImage' : 'heroVideoUrl')}
                          className="text-xs text-bougie-espresso/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-bougie-espresso/10 file:text-bougie-espresso hover:file:bg-bougie-espresso/20 cursor-pointer"
                        />
                        <p className="text-[10px] text-bougie-espresso/50 truncate">Current: {settings.heroMediaType === 'image' ? settings.heroImage : settings.heroVideoUrl}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Company Logo</label>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => uploadFile(e, 'logoUrl')}
                          className="text-xs text-bougie-espresso/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-bougie-espresso/10 file:text-bougie-espresso hover:file:bg-bougie-espresso/20 cursor-pointer"
                        />
                        <p className="text-[10px] text-bougie-espresso/50 truncate">Current Logo: {settings.logoUrl || "None"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About / Our Story */}
                <div className="pt-8 border-t space-y-6">
                  <div className="flex items-center gap-2 text-bougie-espresso/50 mb-2">
                    <Type className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">About / Our Story</span>
                  </div>
                  <p className="text-xs text-bougie-espresso/60 -mt-4">Powers the homepage teaser and the full <code className="bg-bougie-cream drop-shadow-sm px-1 rounded">/about</code> page.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Section Heading</label>
                      <input
                        type="text"
                        value={settings.aboutHeading || ''}
                        onChange={(e) => setSettings({...settings, aboutHeading: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bougie-espresso outline-none"
                        placeholder="Our Story"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Upload About Image</label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => uploadFile(e, 'aboutImage')}
                          className="text-xs text-bougie-espresso/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-bougie-espresso/10 file:text-bougie-espresso hover:file:bg-bougie-espresso/20 cursor-pointer"
                        />
                        <p className="text-[10px] text-bougie-espresso/50 truncate">Current: {settings.aboutImage || "None"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Homepage Teaser (short)</label>
                    <textarea
                      value={settings.aboutIntro || ''}
                      onChange={(e) => setSettings({...settings, aboutIntro: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border h-20"
                      placeholder="A one or two sentence excerpt shown on the homepage."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Full Story (shown on /about — blank line = new paragraph)</label>
                    <textarea
                      value={settings.aboutBody || ''}
                      onChange={(e) => setSettings({...settings, aboutBody: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border h-48 font-serif"
                      placeholder="The full, elaborated version of your story..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Badge Number</label>
                      <input
                        type="text"
                        value={settings.aboutBadgeNumber || ''}
                        onChange={(e) => setSettings({...settings, aboutBadgeNumber: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bougie-espresso outline-none"
                        placeholder="10+"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Badge Label</label>
                      <input
                        type="text"
                        value={settings.aboutBadgeLabel || ''}
                        onChange={(e) => setSettings({...settings, aboutBadgeLabel: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bougie-espresso outline-none"
                        placeholder="Years of Luxury Experience"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Instagram URL</label>
                      <input 
                        type="text" 
                        value={settings.instagramUrl || ''}
                        onChange={(e) => setSettings({...settings, instagramUrl: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Facebook URL</label>
                      <input 
                        type="text" 
                        value={settings.facebookUrl || ''}
                        onChange={(e) => setSettings({...settings, facebookUrl: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">WhatsApp Link</label>
                      <input 
                        type="text" 
                        value={settings.whatsappNumber || ''}
                        onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border"
                        placeholder="e.g. 447700900000"
                      />
                    </div>
                  </div>

                  {/* Social Media & Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">YouTube URL</label>
                      <input 
                        type="text" 
                        value={settings.youtubeUrl || ''}
                        onChange={(e) => setSettings({...settings, youtubeUrl: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border"
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Twitter URL</label>
                      <input 
                        type="text" 
                        value={settings.twitterUrl || ''}
                        onChange={(e) => setSettings({...settings, twitterUrl: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border"
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Studio Email</label>
                      <input 
                        type="email" 
                        value={settings.contactEmail || ''}
                        onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border"
                        placeholder="studio@..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Studio Phone</label>
                      <input 
                        type="text" 
                        value={settings.contactPhone || ''}
                        onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border"
                        placeholder="+44..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <label className="text-sm font-medium text-zinc-700">Studio Physical Address</label>
                    <input 
                      type="text" 
                      value={settings.address || ''}
                      onChange={(e) => setSettings({...settings, address: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border"
                      placeholder="Street, City, Country"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Stripe Publishable Key</label>
                      <input
                        type="text"
                        value={settings.stripePublishableKey || ''}
                        onChange={(e) => setSettings({...settings, stripePublishableKey: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border"
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Currency Symbol</label>
                      <input
                        type="text"
                        value={settings.currencySymbol || '£'}
                        onChange={(e) => setSettings({...settings, currencySymbol: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bougie-espresso outline-none"
                        placeholder="£ or $"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-bougie-cream rounded-2xl border border-dashed border-bougie-espresso/15">
                    <div>
                      <p className="text-sm font-bold">Enable SMS/OTP Authentication</p>
                      <p className="text-xs text-bougie-espresso/60">Requires an active SMS provider balance (e.g. Twilio).</p>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, enableOTP: !settings.enableOTP})}
                      className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableOTP ? 'bg-bougie-espresso' : 'bg-zinc-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enableOTP ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-bougie-cream rounded-2xl border border-dashed border-bougie-espresso/15">
                    <div>
                      <p className="text-sm font-bold">Enable Email Link Sign-In</p>
                      <p className="text-xs text-bougie-espresso/60">Lets clients access their portal via a one-click emailed link instead of SMS — same Firebase-verified login, no password or code to type. Requires Brevo to be configured.</p>
                    </div>
                    <button
                      onClick={() => setSettings({...settings, enableEmailLink: !settings.enableEmailLink})}
                      className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableEmailLink ? 'bg-bougie-espresso' : 'bg-zinc-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enableEmailLink ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-bougie-cream rounded-2xl border border-dashed border-bougie-espresso/15">
                    <div>
                      <p className="text-sm font-bold">Require Booking Deposit</p>
                      <p className="text-xs text-bougie-espresso/60">Off: clients confirm booking and pay by cash/bank transfer in person. On: shows your booking policy and bank transfer details, and requires agreement before confirming (no online charge — Stripe Checkout isn't connected yet).</p>
                    </div>
                    <button
                      onClick={() => setSettings({...settings, requireDeposit: !settings.requireDeposit})}
                      className={`w-12 h-6 rounded-full transition-colors relative ${settings.requireDeposit ? 'bg-bougie-espresso' : 'bg-zinc-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.requireDeposit ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  {settings.requireDeposit && (
                    <div className="space-y-4 p-4 bg-bougie-espresso/5 rounded-2xl border border-dashed border-bougie-espresso/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700">Bank Transfer Details</label>
                          <input
                            type="text"
                            value={settings.bankDetails || ''}
                            onChange={(e) => setSettings({...settings, bankDetails: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bougie-espresso outline-none"
                            placeholder="e.g. Sort code 12-34-56, Account 12345678"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700">Account Name</label>
                          <input
                            type="text"
                            value={settings.bankAccountName || ''}
                            onChange={(e) => setSettings({...settings, bankAccountName: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bougie-espresso outline-none"
                            placeholder="e.g. Bougie Hair & Beauty"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Booking Policy (shown to clients before they confirm)</label>
                        <textarea
                          value={settings.bookingPolicy || ''}
                          onChange={(e) => setSettings({...settings, bookingPolicy: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border h-40"
                          placeholder="Your deposit, cancellation, and rescheduling policy..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t flex justify-end">
              <Button size="lg" onClick={handleSave} disabled={saveStatus === "saving"}>
                {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Saved</span> : "Apply Brand Changes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-bougie-espresso/10 flex items-center justify-center text-bougie-espresso">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-serif">Account Security</h3>
          </div>

          <form onSubmit={handleAccountSave} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Current Password</label>
              <input
                type="password"
                value={accountForm.currentPassword}
                onChange={(e) => setAccountForm({ ...accountForm, currentPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bougie-espresso outline-none"
                placeholder="Required to make any change below"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">New Login Email</label>
              <input
                type="email"
                value={accountForm.newEmail}
                onChange={(e) => setAccountForm({ ...accountForm, newEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bougie-espresso outline-none"
                placeholder="Leave blank to keep current email"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">New Password</label>
                <input
                  type="password"
                  value={accountForm.newPassword}
                  onChange={(e) => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bougie-espresso outline-none"
                  placeholder="Leave blank to keep current"
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Confirm New Password</label>
                <input
                  type="password"
                  value={accountForm.confirmPassword}
                  onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bougie-espresso outline-none"
                  minLength={8}
                />
              </div>
            </div>

            {accountError && <p className="text-red-500 text-sm">{accountError}</p>}
            {accountStatus === "saved" && (
              <p className="text-emerald-600 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Saved — signing you out to log in with your new credentials...
              </p>
            )}

            <div className="pt-2">
              <Button type="submit" disabled={accountStatus === "saving"}>
                {accountStatus === "saving" ? "Saving..." : "Update Credentials"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Real-time Live Preview Sidebar */}
      <div className="w-full lg:w-[400px] space-y-4">
        <div className="bg-zinc-900 rounded-3xl p-4 text-white">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Layout className="w-4 h-4 text-bougie-cream" />
            <span className="text-xs font-bold uppercase tracking-widest">Live Preview</span>
          </div>
          
          {/* Miniature Website Mockup */}
          <div className="rounded-2xl overflow-hidden bg-white aspect-[9/16] border-4 border-zinc-800 relative scale-100">
            {/* Header */}
            <div className="h-10 px-4 flex items-center justify-between border-b" style={{ backgroundColor: 'white' }}>
              <div className="flex items-center gap-1.5 overflow-hidden">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} className="w-4 h-4 object-contain rounded-sm" alt="logo" />
                ) : (
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: settings.primaryColor }} />
                )}
                <span className="text-[8px] font-serif font-bold truncate max-w-[120px]" style={{ color: settings.textPrimaryColor || '#18181b' }}>
                  {settings.companyName}
                </span>
              </div>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: settings.primaryColor }} />
            </div>
            
            {/* Hero */}
            <div className="h-48 relative flex items-center justify-center p-6 text-center" style={{ backgroundColor: settings.primaryColor }}>
              <div className="absolute inset-0 opacity-20 bg-[url('/beauty_hero_bg.png')] bg-cover bg-center" />
              <div className="relative z-10">
                <h4 className="text-white text-xs font-serif mb-2" style={{ color: settings.secondaryColor }}>{settings.heroTitle}</h4>
                <p className="text-[6px] text-white/70 mb-4">{settings.heroSubtitle}</p>
                <div className="h-4 w-12 mx-auto rounded-full text-[6px] flex items-center justify-center" style={{ backgroundColor: settings.secondaryColor, color: settings.primaryColor }}>
                  Book Now
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="p-4 space-y-3" style={{ backgroundColor: settings.secondaryColor }}>
              <div className="h-1 w-8 mx-auto" style={{ backgroundColor: settings.accentColor }} />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-20 rounded-lg bg-white shadow-sm border p-2">
                   <div className="h-1 w-full rounded mb-1" style={{ backgroundColor: settings.textPrimaryColor || '#18181b' }} />
                   <div className="h-[2px] w-3/4 rounded" style={{ backgroundColor: settings.textSecondaryColor || '#71717a' }} />
                   <div className="mt-4 text-[8px] font-bold" style={{ color: settings.textPrimaryColor || '#18181b' }}>{settings.currencySymbol || '£'}0.00</div>
                </div>
                <div className="h-20 rounded-lg bg-white shadow-sm border p-2">
                   <div className="h-1 w-full rounded mb-1" style={{ backgroundColor: settings.textPrimaryColor || '#18181b' }} />
                   <div className="h-[2px] w-3/4 rounded" style={{ backgroundColor: settings.textSecondaryColor || '#71717a' }} />
                   <div className="mt-4 text-[8px] font-bold" style={{ color: settings.textPrimaryColor || '#18181b' }}>{settings.currencySymbol || '£'}0.00</div>
                </div>
              </div>
            </div>

            {/* Accent Elements */}
            <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full shadow-lg flex items-center justify-center" style={{ backgroundColor: settings.accentColor }}>
              <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
            </div>
          </div>
          
          <p className="text-[10px] text-center mt-4 text-bougie-espresso/60">This is a real-time reflection of your public landing page.</p>
        </div>
      </div>
    </div>
  );
}
