"use client";

/**
 * CareerForge AI — Settings Page (3D Glass Overhaul).
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, Trash2, Save, Loader2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [name, setName] = useState("CareerForge User");
  const [email, setEmail] = useState("user@careerforge.ai");
  const [saving, setSaving] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="compact-container py-6 max-w-3xl space-y-6"
    >
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          System <span className="text-glow">Settings</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your AI preferences, local storage, and configuration.
        </p>
      </div>

      {/* Profile */}
      <Card className="glass-card card-3d rounded-2xl">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <User className="h-5 w-5 text-primary" />
            Profile Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Display Name</label>
            <Input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-background/50 backdrop-blur-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
            <Input
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" type="email"
              className="bg-background/50 backdrop-blur-sm"
            />
          </div>
          <Button className="glow-button rounded-xl gap-2 font-bold px-6" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Gemini AI Status */}
      <Card className="glass-card card-3d rounded-2xl border border-cyan-500/30">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Key className="h-5 w-5 text-cyan-400" />
            Gemini AI Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/5">
            <div>
              <p className="text-xs font-bold">Gemini 2.0 Flash API</p>
              <p className="text-[11px] text-muted-foreground">Configured server-side in .env.local</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
              Active & Protected
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="glass-card rounded-2xl border-destructive/40 bg-destructive/5">
        <CardHeader className="border-b border-destructive/20 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-destructive">
            <Trash2 className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Clear all cached resume data, matches, and temporary stored sessions from local memory.
          </p>
          <Button variant="destructive" className="mt-4 gap-2 rounded-xl text-xs font-bold">
            <Trash2 className="h-4 w-4" />
            Reset Local Workspace
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
