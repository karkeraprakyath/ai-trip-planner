"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to send message");
      setStatus({ ok: true, msg: "Thanks! Your message has been sent." });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setStatus({ ok: false, msg: err?.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">Questions, feedback, or partnership ideas? We’d love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Your Name"
                  className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your Email"
                  className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="How can we help?"
                className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="min-h-32"
                required
              />
            </div>
            {status && (
              <div className={`text-sm ${status.ok ? "text-green-600" : "text-red-600"}`}>{status.msg}</div>
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send message"}
              </Button>
            </div>
          </form>
        </div>

        <aside className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold">Support</h3>
            <p className="text-sm text-muted-foreground">We usually reply within 1–2 business days.</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm"><span className="font-medium">Email:</span> support@ai-trip-planner.app</p>
            <p className="text-sm"><span className="font-medium">Twitter/X:</span> @aitripplanner</p>
          </div>
          <div className="text-xs text-muted-foreground">This form is rate limited to prevent spam.</div>
        </aside>
      </div>
    </div>
  );
}


