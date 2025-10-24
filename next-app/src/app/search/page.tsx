import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Vangogh - Search",
};

export default function SearchPage() {
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
      <div id="loaded">
        <img
          src="/static/img/overlays/dash-overlay-1.png"
          className="dash-overlay"
          id="dash-overlay-0"
          alt=""
        />
        <img
          src="/static/img/overlays/dash-overlay-2.png"
          className="dash-overlay"
          id="dash-overlay-1"
          alt=""
        />
        <img
          src="/static/img/overlays/dash-overlay-3.png"
          className="dash-overlay"
          id="dash-overlay-2"
          alt=""
        />
        <img
          src="/static/img/overlays/dash-overlay-4.png"
          className="dash-overlay"
          id="dash-overlay-3"
          alt=""
        />
        <img
          src="/static/img/overlays/dash-overlay-5.png"
          className="dash-overlay"
          id="dash-overlay-4"
          alt=""
        />

        <img src="/static/img/icons/moon.png" id="dark-btn" alt="Enable dark" />
        <img src="/static/img/icons/sun.png" id="light-btn" alt="Enable light" />

        <div id="nav-pane">
          <div className="nav-links nav-links-sel" id="nav-search-link">
            <a href="/home">Home</a>
          </div>
          <div className="nav-links" id="nav-image-link">
            <a href="/image">Upload image</a>
          </div>
          <div className="nav-links" id="nav-blog-link">
            <a href="/what">About</a>
          </div>
          <div className="nav-links" id="nav-help-link">
            Help
          </div>
        </div>
        <img src="/static/img/loader.gif" id="dash-loader" alt="Loading" />

        <canvas
          id="palette-canvas"
          width="960"
          height="540"
          style={{ display: "none" }}
        />
        <div id="main-full-plot" />
        <img
          src="/static/img/icons/close.png"
          className="full-btn"
          id="full-close-btn"
          alt="Close full view"
        />
        <img
          src="/static/img/icons/pause.png"
          className="rot-stop-btn"
          id="full-rot-btn"
          alt="Toggle rotation"
        />

        <div id="dash-error-msg" />
        <div id="main-dash">
          <input
            id="dash-search"
            type="text"
            name="dash-search"
            placeholder="Search for palettes.."
          />
          <img
            src="/static/img/icons/search.png"
            id="dash-search-icon"
            alt="Search icon"
          />
          <div id="palette-size-text">palette size</div>
          <div id="palette-size-pane">
            <div className="palette-size-opt">3</div>
            <div className="palette-size-opt palette-size-opt-sel">4</div>
            <div className="palette-size-opt">5</div>
            <div className="palette-size-opt">6</div>
            <div className="palette-size-opt">7</div>
          </div>
          <div id="dash-load" />
          <div id="main-scatter-plot" />
          <img
            src="/static/img/icons/pause.png"
            className="rot-stop-btn"
            id="main-rot-btn"
            alt="Toggle rotation"
          />
          <img
            src="/static/img/icons/full.png"
            className="full-btn"
            id="main-full-btn"
            alt="Full screen"
          />

          <div id="palette-pane" />
          <div id="cluster-pane" />
          <a id="swatch-download" download="VANGOGH.png">
            <img
              src="/static/img/icons/download.png"
              id="dash-swatch"
              alt="Download palette"
            />
          </a>
          <div id="dash-color-code" />
          <div id="dash-color-space">
            <div
              id="dash-optn-hex"
              className="dash-color-space-opt dash-color-space-opt-sel"
            >
              HEX
            </div>
            <div id="dash-optn-rgb" className="dash-color-space-opt">
              RGB
            </div>
            <div id="dash-optn-hsl" className="dash-color-space-opt">
              HSL
            </div>
          </div>
          <img
            src="/static/img/icons/refresh.png"
            id="dash-refresh"
            alt="Refresh"
          />
        </div>
      </div>
      <Script
        src="/static/plotly-gl3d-latest.min.js"
        strategy="beforeInteractive"
      />
      <Script id="search-loader" strategy="afterInteractive">
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
