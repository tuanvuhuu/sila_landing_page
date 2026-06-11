"use client";

import { useEffect } from "react";
import { initUtmTracker } from "@/lib/utm";

export default function UtmTracker() {
  useEffect(() => {
    initUtmTracker();
  }, []);

  return null;
}
