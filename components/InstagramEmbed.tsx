"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

const EMBED_SCRIPT_SRC = "https://www.instagram.com/embed.js";

function loadInstagramEmbedScript(callback: () => void) {
  if (typeof window === "undefined") return;

  if (window.instgrm) {
    callback();
    return;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[src="${EMBED_SCRIPT_SRC}"]`,
  );

  if (existingScript) {
    existingScript.addEventListener("load", callback);
    return;
  }

  const script = document.createElement("script");
  script.src = EMBED_SCRIPT_SRC;
  script.async = true;
  script.onload = callback;
  document.body.appendChild(script);
}

interface InstagramEmbedProps {
  html: string;
}

export default function InstagramEmbed({ html }: InstagramEmbedProps) {
  useEffect(() => {
    loadInstagramEmbedScript(() => {
      window.instgrm?.Embeds.process();
    });
  }, [html]);

  return (
    <div
      className="instagram-embed-item w-full flex justify-center [&_iframe]:!w-full [&_.instagram-media]:!min-w-0 [&_.instagram-media]:!max-w-full"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
