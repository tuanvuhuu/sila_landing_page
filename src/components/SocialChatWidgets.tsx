"use client";

import Script from "next/script";
import { useEffect } from "react";

interface Props {
  fbPageId?: string;
  zaloOAId?: string;
}

export default function SocialChatWidgets({ fbPageId, zaloOAId }: Props) {
  useEffect(() => {
    // Facebook Messenger Customer Chat Plugin
    if (fbPageId) {
      if (!document.querySelector(".fb-customerchat")) {
        const chat = document.createElement("div");
        chat.className = "fb-customerchat";
        chat.setAttribute("attribution", "setup_tool");
        chat.setAttribute("page_id", fbPageId);
        chat.setAttribute("theme_color", "#F58220");
        chat.setAttribute(
          "logged_in_greeting",
          "Xin chào! ESL Academy có thể giúp gì cho bạn? 😊"
        );
        chat.setAttribute(
          "logged_out_greeting",
          "Xin chào! ESL Academy có thể giúp gì cho bạn? 😊"
        );
        document.body.appendChild(chat);
      }
    }

    // Zalo OA Chat Widget
    if (zaloOAId) {
      if (!document.querySelector(".zalo-chat-widget")) {
        const widget = document.createElement("div");
        widget.className = "zalo-chat-widget";
        widget.setAttribute("data-oaid", zaloOAId);
        widget.setAttribute(
          "data-welcome-message",
          "Xin chào! Bạn cần tư vấn về khóa học tiếng Anh cho bé? 👋"
        );
        widget.setAttribute("data-autopopup", "0");
        widget.setAttribute("data-width", "350");
        widget.setAttribute("data-height", "420");
        document.body.appendChild(widget);
      }
    }
  }, [fbPageId, zaloOAId]);

  return (
    <>
      {/* Facebook SDK */}
      {fbPageId && (
        <>
          <div id="fb-root" />
          <Script
            id="fb-customer-chat-sdk"
            strategy="lazyOnload"
            src="https://connect.facebook.net/vi_VN/sdk/xfbml.customerchat.js"
          />
        </>
      )}

      {/* Zalo OA SDK */}
      {zaloOAId && (
        <Script
          id="zalo-oa-sdk"
          strategy="lazyOnload"
          src="https://sp.zalo.me/plugins/sdk.js"
        />
      )}
    </>
  );
}
