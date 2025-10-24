import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Vangogh - Say Hi!",
};

export default function SayHiPage() {
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
        <div className="about-list-name">
          <a href="/what">What&apos;s it ?</a>
        </div>
        <div className="about-list-name">
          <a href="/how">How does it work ?</a>
        </div>
        <div className="about-list-name about-list-name-sel">Say Hi !</div>
      </div>
      <div id="about-title">Say Hi !</div>
      <div id="about-sayhi-content">
        Have a detailed question about how VANGOGH works?
        <br />
        Have an idea for a cool new feature?
        <br />
        Found a bug on the site?
        <br />
        Or better, just wanna say Hi?
        <br />
        Please drop in.
        <br />
        <br />
        And yeah, I&apos;m <span style={{ color: "#470041" }}>Poobesh Gowtham</span>,
        <br />
        Industrial Design Undergrad, IDC School of Design, IIT Bombay.
      </div>
      <img
        src="/static/img/icons/github.png"
        id="sayhi-github-img"
        alt="GitHub icon"
      />
      <div id="sayhi-github">
        <a target="blank" href="https://github.com/wanderling/vangogh">
          https://github.com/wanderling/vangogh
        </a>
      </div>
      <img
        src="/static/img/icons/email.png"
        id="sayhi-email-img"
        alt="Email icon"
      />
      <div id="sayhi-email">
        <a target="blank" href="mailto:poobeshgowtham@gmail.com">
          poobeshgowtham@live.com
        </a>
      </div>

      <Script
        src="/static/plotly-gl3d-latest.min.js"
        strategy="beforeInteractive"
      />
      <Script id="sayhi-loader" strategy="afterInteractive">
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
