import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Vangogh - Working",
};

export default function HowPage() {
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

      <img src="/static/img/index-bg.png" id="about-bg" alt="" />

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
      <div id="about-bottom-pane" />
      <div id="about-list">
        <div className="about-list-name">
          <a href="/what">What&apos;s it ?</a>
        </div>
        <div className="about-list-name about-list-name-sel">
          How does it work ?
        </div>
        <div className="about-list-name">
          <a href="/sayhi">Say Hi !</a>
        </div>
      </div>
      <div id="about-title">How does it work ?</div>
      <div id="about-work-content">
        <div className="work-content" id="work-web">
          When you search for a color palette, VANGOGH queries the Brave Search
          API and downloads 100 images tagged with the search term. It then
          resizes the images to 50×50 pixels to improve efficiency. The images
          are cached and can be viewed{" "}
          <a target="blank" href="/imgcache">
            here
          </a>
          .
        </div>
        <img
          id="work-img-search"
          src="/static/img/about/search.png"
          alt="Search workflow"
        />
        <div className="work-content" id="work-cluster">
          The images are clustered based on perceptual similarity, i.e., similar
          colored images are grouped together. This is done by generating{" "}
          <i>color moments</i> for each image, which serve as signatures and are
          then used to cluster using K-Means.
        </div>
        <img
          id="work-img-cluster"
          src="/static/img/about/cluster.png"
          alt="Clustering workflow"
        />
        <div className="work-content" id="work-colors">
          Each image is converted to a collection of pixels. The constituting
          colors are visualised on a 3D space, where the spatial coordinates X,
          Y, Z are the values R, G, B of the pixel. The collection of coloured
          points is grouped using <i>K-Means clustering</i> to generate palettes.
          Palettes are tweaked and ranked based on colour theory.
        </div>
        <img
          id="work-img-color"
          src="/static/img/about/color.png"
          alt="Colour space visualisation"
        />
        <div className="work-content" id="work-palette">
          Each image now has a palette. Palettes from the same image cluster
          create a palette theme as they share a common colour scheme. VANGOGH
          provides four themes with five palettes in each. The palette data and
          the 3D visualisation of the colour space of the images are sent to the
          browser in just a few seconds.
        </div>
        <img
          id="work-img-palette"
          src="/static/img/about/palette.png"
          alt="Palette output"
        />
      </div>

      <Script
        src="/static/plotly-gl3d-latest.min.js"
        strategy="beforeInteractive"
      />
      <Script id="how-loader" strategy="afterInteractive">
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
