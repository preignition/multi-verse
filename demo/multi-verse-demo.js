import { LitElement, html, css } from 'lit-element';

// import '@vaadin/vaadin-tabs';
import 'api-viewer-element';
import { Router } from '@vaadin/router';

import './basic-demo.js';
import './chart-demo.js';
import './advanced-demo.js';

import {github, preignition, DemoRoot} from '@preignition/preignition-demo';

// import './src/demo-api-viewer.js';
// import './src/demo-container.js';
// import './src/demo-fancy-list.js';
// import './src/demo-readme.js';

/**
 * This component combines all the examples to be displayed. See the basic/intermediate/advanced folders for the actual examples.
 */

class DemoMultiVerse extends DemoRoot {

  constructor() {
    super();
    this.activeTab = location.pathname === '/' ? 'intro' : location.pathname.replace('/', '');
    this.tabs = ['intro', 'charts', 'container', 'helper', 'advanced'];

  }

  firstUpdated() {
    const router = new Router(this.shadowRoot.getElementById('outlet'));
    router.setRoutes([
      { path: '/', component: 'demo-readme' },
      { path: '/intro', component: 'demo-readme' },
      { path: '/basic', component: 'basic-demo' },
      { path: '/charts', component: 'chart-demo' },
      { path: '/advanced', component: 'advanced-demo' },
      // { path: '/container', component: 'container-demo' },
      {
        path: '(.*)',
        redirect: '/',
        action: () => {
          this.activeTab = 'intro';
        }
      }
    ]);
  }

  render() {
    return html `
      <div id="header">
        <span class="logo"><a href="https://preignition.org">${preignition}</a></span>
        <h1>Multi verse - ${this.capitalize(this.activeTab)} API and demos</h1>
        <a class="github" href="https://www.github.com/preignition/multi-verse" target="_blank">${github}</a>
      </div>

      <vaadin-tabs class="${this.smallScreen ? 'nav' : ''}" orientation="${this.smallScreen ? 'vertical' : 'horizontal'}" selected=${this.tabs.indexOf(this.activeTab)} theme="${this.smallScreen ? '' : 'centered'}">
        <vaadin-tab @click=${() => this.switchRoute('intro')}>Intro</vaadin-tab>
        <vaadin-tab @click=${() => this.switchRoute('basic')}>Basic</vaadin-tab>
        <vaadin-tab @click=${() => this.switchRoute('charts')}>Charts</vaadin-tab>
        <vaadin-tab @click=${() => this.switchRoute('advanced')}>Advanced</vaadin-tab>
      </vaadin-tabs>

      <div id="outlet">
      </div>
      <p class="footer">Made with love by <a target="_blank" href="https://preignition.org/">preignition</a>, with precious help of <a target="_blank" href="https://github.com/web-padawan/api-viewer-element">api-viewer-element</a> and <a target="_blank" href="https://github.com/runem/web-component-analyzer">web-component-analyzer</a></p>
    `;
  }

}

customElements.define('multi-verse-demo', DemoMultiVerse);
