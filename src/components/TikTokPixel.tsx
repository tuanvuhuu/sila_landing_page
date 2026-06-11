"use client";

import Script from "next/script";

// Nhúng TikTok Pixel. Chỉ hiển thị khi đã đặt NEXT_PUBLIC_TIKTOK_PIXEL_ID trong .env.
export default function TikTokPixel() {
  const pixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  if (!pixelId) return null;

  return (
    <>
      <Script id="tiktok-pixel" strategy="afterInteractive">
        {`!function (w, d, t) {
          w.TiktokSdkTrackerObject = t;
          var ttq = w[t] = w[t] || [];
          ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "cleanqd"];
          ttq.setAndDefer = function (t, e) {
            t[e] = function () {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
            }
          };
          for (var i = 0; i < ttq.methods.length; i++) {
            ttq.setAndDefer(ttq, ttq.methods[i])
          }
          ttq.instance = function (t) {
            for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) {
              ttq.setAndDefer(e, ttq.methods[n])
            }
            return e
          };
          ttq._i = {};
          ttq._f = function (t) {
            return function () {
              var e = Array.prototype.slice.call(arguments, 0);
              e.unshift(t);
              ttq.push(e);
              return ttq
            }
          };
          ttq.load = function (e, t) {
            var n = "https://analytics.tiktok.com/i18n/pixel/events.js";
            ttq._i = ttq._i || {};
            ttq._i[e] = [];
            ttq._i[e]._u = n;
            ttq._t = ttq._t || +new Date;
            ttq._o = t || {};
            var o = d.createElement("script");
            o.type = "text/javascript";
            o.async = !0;
            o.src = n + "?sdkid=" + e + "&lib=" + t;
            var a = d.getElementsByTagName("script")[0];
            a.parentNode.insertBefore(o, a)
          };
          ttq.load('${pixelId}');
          ttq.page();
        }(window, document, 'ttq');`}
      </Script>
    </>
  );
}

// Hàm helper để bắn sự kiện chuyển đổi lên TikTok
export function fireTikTokEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined" && (window as any).ttq) {
    (window as any).ttq.track(eventName, properties);
  }
}
