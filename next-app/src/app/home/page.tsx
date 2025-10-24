import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Vangogh - Home",
};

export default function HomePage() {
  return (
    <>
      <div id="support-close">x</div>
      <a
        target="_blank"
        href="https://www.buymeacoffee.com/pbsh"
        id="support-link"
      >
        <img src="/static/img/support.png" id="support" alt="Support Vangogh" />
      </a>
      <img src="/static/img/index-bg.png" id="main-bg" alt="" />
      <div id="main-title">VANGOGH</div>
      <div id="main-sub-title">search engine for color palettes</div>
      <input
        id="main-search"
        type="text"
        name="search"
        placeholder="Search for palettes.."
      />
      <img
        src="/static/img/icons/search.png"
        id="main-search-icon"
        alt="search icon"
      />
      <div id="main-desc">
        Try searching for <i>Sunset, Love, Cherry Blossom, La La land</i>..
      </div>
      <div id="main-image">
        <a href="/image">Upload an Image</a>
      </div>
      <span id="main-bull">&bull;</span>
      <div id="main-working">
        <a href="/how">How Vangogh works</a>
      </div>
      <Script
        src="/static/plotly-gl3d-latest.min.js"
        strategy="beforeInteractive"
      />
      <Script id="home-loader" strategy="afterInteractive">
        {`
          (function () {
            var head = document.getElementsByTagName('head')[0];
            var mainjs = document.createElement('script');
            var mobile = false;
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Opera Mobile|Kindle|Windows Phone|PSP|AvantGo|Atomic Web Browser|Blazer|Chrome Mobile|Dolphin|Dolfin|Doris|GO Browser|Jasmine|MicroB|Mobile Firefox|Mobile Safari|Mobile Silk|Motorola Internet Browser|NetFront|NineSky|Nokia Web Browser|Obigo|Openwave Mobile Browser|Palm Pre web browser|Polaris|PS Vita browser|Puffin|QQbrowser|SEMC Browser|Skyfire|Tear|TeaShark|UC Browser|uZard Web|wOSBrowser|Yandex.Browser mobile/i.test(navigator.userAgent)) {
              mobile = true;
            }
            mainjs.src = mobile ? '/static/mobile.js' : '/static/main.js';
            head.appendChild(mainjs);
          })();
        `}
      </Script>
    </>
  );
}
