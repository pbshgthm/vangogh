import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Vangogh - About",
};

export default function WhatPage() {
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

      <div id="nav-pane-about">
        <div className="nav-links" id="nav-search-link">
          <a href="/home">Home</a>
        </div>
        <div className="nav-links" id="nav-image-link">
          <a href="/image">Upload image</a>
        </div>
        <div className="nav-links nav-links-sel" id="nav-blog-link">
          About
        </div>
      </div>

      <div id="about-pane" />
      <div id="about-list">
        <div className="about-list-name about-list-name-sel">What&apos;s it ?</div>
        <div className="about-list-name">
          <a href="/how">How does it work ?</a>
        </div>
        <div className="about-list-name">
          <a href="/sayhi">Say Hi !</a>
        </div>
      </div>
      <div id="about-title">What&apos;s it ?</div>
      <div id="about-about-content">
        Ever wanted the perfect color palette for <i>a winter evening, cherry blossom, sunset</i>?{" "}
        <br />
        <br />
        VANGOGH generates color palettes for any search term. It uses Machine learning to generate
        color palettes from millions of images that are contextually representative.
        <br />
        <br />
        It offers 4 themes that represent the palettes of the search term and 5 palettes in each
        theme. If you need a palette from a particular image, checkout{" "}
        <a href="/image">Vangogh Image</a>.
        <br />
        <br />
        Vangogh is an opensource project and contributions are welcome. Check it out at{" "}
        <a target="blank" href="https://github.com/wanderling/vangogh">
          https://github.com/wanderling/vangogh
        </a>
        .
      </div>

      <Script
        src="/static/plotly-gl3d-latest.min.js"
        strategy="beforeInteractive"
      />
      <Script id="what-loader" strategy="afterInteractive">
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
