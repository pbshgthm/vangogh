import type { Metadata } from "next";
import Script from "next/script";
import { getArchiveKeys } from "@/lib/processing";

export const metadata: Metadata = {
  title: "Vangogh - Archive",
};

async function getArchiveList() {
  try {
    return await getArchiveKeys();
  } catch {
    return [];
  }
}

export default async function ArchivePage() {
  const archiveList = await getArchiveList();
  const archiveJson = JSON.stringify({ archive: archiveList });
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

        <div id="archive-list-pane">
          <div id="archive-title">Archive list</div>
          <div id="archive-dir-list" />
        </div>
        <div id="archive-view-pane" />
      </div>
      <Script id="archive-data" strategy="beforeInteractive">
        {`var archiveList = (${archiveJson}).archive.sort();`}
      </Script>
      <Script
        src="/static/plotly-gl3d-latest.min.js"
        strategy="beforeInteractive"
      />
      <Script id="archive-loader" strategy="afterInteractive">
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
