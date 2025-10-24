import type { Metadata } from "next";
import Script from "next/script";
import imageInitData from "../../../public/static/image-init.json";

export const metadata: Metadata = {
  title: "Vangogh - Image",
};

export default function ImagePage() {
  const currPlot = JSON.stringify(imageInitData);
  return (
    <>
      <div id="loaded">
        <img
          src="/static/img/overlays/image-overlay.png"
          className="dash-overlay"
          id="image-overlay"
          alt=""
        />

        <div id="support-close">x</div>
        <a
          target="_blank"
          href="https://www.buymeacoffee.com/pbsh"
          id="support-link"
        >
          <img
            src="/static/img/support.png"
            id="support"
            alt="Support Vangogh"
          />
        </a>

        <img src="/static/img/icons/moon.png" id="dark-btn" alt="Dark mode" />
        <img src="/static/img/icons/sun.png" id="light-btn" alt="Light mode" />

        <div id="nav-pane">
          <div className="nav-links" id="nav-search-link">
            <a href="/home">Home</a>
          </div>
          <div className="nav-links nav-links-sel" id="nav-image-link">
            Upload image
          </div>
            <div className="nav-links" id="nav-blog-link">
            <a href="/what">About</a>
          </div>
          <div className="nav-links" id="nav-help-link">
            Help
          </div>
        </div>

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

        <div id="VANGOGH-image">
          <label id="image-upload-area">
            <input type="file" id="image-upload-btn" />
          </label>

          <div id="image-preview-backdrop" />
          <img src="/static/img/loader-img.gif" id="imgload" alt="Loading" />
          <div
            id="image-preview"
            style={{
              backgroundImage: "url('/static/img/sample/sample0')",
            }}
          >
            Drag image or click to upload
          </div>

          <div id="image-palette-bar">
            <div
              className="image-palette-colors"
              id="imgclr0"
              style={{ backgroundColor: "#0d85fa" }}
              data-clr="#0d85fa"
              {...{ clr: "#0d85fa" }}
            />
            <div
              className="image-palette-colors"
              id="imgclr1"
              style={{ backgroundColor: "#ece5be" }}
              data-clr="#ece5be"
              {...{ clr: "#ece5be" }}
            />
            <div
              className="image-palette-colors"
              id="imgclr2"
              style={{ backgroundColor: "#bfcf47" }}
              data-clr="#bfcf47"
              {...{ clr: "#bfcf47" }}
            />
            <div
              className="image-palette-colors"
              id="imgclr3"
              style={{ backgroundColor: "#48a151" }}
              data-clr="#48a151"
              {...{ clr: "#48a151" }}
            />
          </div>
          <div id="image-color-code">qwerty</div>
          <div className="image-copy-alert">copied to clipoard</div>
          <div id="image-palette-size-pane">
            <div className="palette-size-opt">3</div>
            <div className="palette-size-opt palette-size-opt-sel">4</div>
            <div className="palette-size-opt">5</div>
            <div className="palette-size-opt">6</div>
            <div className="palette-size-opt">7</div>
          </div>

          <div id="image-color-space">
            <div
              id="image-optn-hex"
              className="image-color-space-opt image-color-space-opt-sel"
            >
              HEX
            </div>
            <div id="image-optn-rgb" className="image-color-space-opt">
              RGB
            </div>
            <div id="image-optn-hsl" className="image-color-space-opt">
              HSL
            </div>
          </div>

          <div id="image-sample-panel">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                id={`ims${idx}`}
                className={`image-sample-img${idx === 0 ? " image-sample-img-sel" : ""}`}
                style={{
                  backgroundImage: `url('/static/img/sample/sample${idx}')`,
                }}
              />
            ))}
          </div>
          <div id="image-scatter-plot" />

          <img
            src="/static/img/icons/pause.png"
            className="rot-stop-btn"
            id="image-rot-btn"
            alt="Toggle rotation"
          />
          <img
            src="/static/img/icons/full.png"
            className="full-btn"
            id="image-full-btn"
            alt="Full screen"
          />
        </div>
      </div>
      <Script id="image-curr-plot" strategy="beforeInteractive">
        {`var currPlot = ${currPlot};`}
      </Script>
      <Script
        src="/static/plotly-gl3d-latest.min.js"
        strategy="beforeInteractive"
      />
      <Script id="image-loader" strategy="afterInteractive">
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
      <Script id="image-upload-handler" strategy="afterInteractive">
        {`
          function bindImageUpload() {
            var uploadInput = document.getElementById('image-upload-btn');
            if (uploadInput) {
              if (uploadInput.dataset.vgBound === 'true') {
                return;
              }
              uploadInput.addEventListener('change', function () {
                if (typeof readURL === 'function') {
                  readURL(this);
                }
              });
              uploadInput.dataset.vgBound = 'true';
            }
          }
          if (document.readyState === 'complete' || document.readyState === 'interactive') {
            bindImageUpload();
          } else {
            document.addEventListener('DOMContentLoaded', bindImageUpload);
          }
        `}
      </Script>
    </>
  );
}
