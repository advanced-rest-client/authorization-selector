import { html } from 'lit-element';
import { ArcDemoPage } from '@advanced-rest-client/arc-demo-helper/ArcDemoPage.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@advanced-rest-client/authorization-method/authorization-method.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js'
import '../authorization-selector.js';

const STORE_KEY = 'auth-selector-config';

class DemoPage extends ArcDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'demoState',
      'compatibility',
      'outlined',
      'changeCounter',
      'allowNone',
    ]);
    this._componentName = 'authorization-selector';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.demoState = 0;
    this.changeCounter = 0;

    const base = `${location.protocol}//${location.host}`;
    this.authorizationUri = `${base}${location.pathname}oauth-authorize.html`;
    this.oauth2redirect = 'http://auth.advancedrestclient.com/arc.html';
    this.oauth2scopes = [
      'profile',
      'email'
    ];
    this.oauth1redirect = `${base}/node_modules/@advanced-rest-client/oauth-authorization/oauth-popup.html`;

    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._mainChangeHandler = this._mainChangeHandler.bind(this);

    this._restoreConfig();
  }

  _restoreConfig() {
    const data = localStorage[STORE_KEY];
    if (!data) {
      return;
    }
    if (data[0] !== '{') {
      return;
    }
    try {
      this.authConfiguration = JSON.parse(data);
    } catch (_) {
      // ..
    }
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.demoState = state;
    this.outlined = state === 1;
    this.compatibility = state === 2;
  }

  _mainChangeHandler(e) {
    this.changeCounter++;
    const { selected, type } = e.target;
    const config = e.target.serialize();
    const valid = e.target.validate();

    this.authConfiguration = {
      selected,
      config,
      type,
    };

    const storeValue = JSON.stringify(this.authConfiguration);
    localStorage[STORE_KEY] = storeValue;

    console.log('selected:', selected, 'type:', type, 'valid:', valid);
    console.log(config);
  }

  _basicTemplate(config={}) {
    const {
      compatibility,
      outlined,
    } = this;
    const defaults = {
      username: "basic-username",
      password: "basic-password",
    };
    const { type } = config;
    const { username, password } = (type === 'basic' ? config.config : defaults);
    return html`<authorization-method
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      type="basic"
      .username="${username}"
      .password="${password}"
    ></authorization-method>`;
  }

  _ntlmTemplate(config={}) {
    const {
      compatibility,
      outlined,
    } = this;
    const defaults = {
      username: "ntlm-username",
      password: "ntlm-password",
      domain: 'ntlm-domain',
    };
    const { type } = config;
    const { username, password, domain } = (type === 'ntlm' ? config.config : defaults);
    return html`<authorization-method
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      type="ntlm"
      .username="${username}"
      .password="${password}"
      .domain="${domain}"
    ></authorization-method>`;
  }

  _digestTemplate(config={}) {
    const {
      compatibility,
      outlined,
    } = this;
    const defaults = {
      username: "digest-username",
      password: "digest-password",
      realm: "digest-realm",
      nonce: "digest-nonce",
      opaque: "digest-opaque",
      algorithm: "MD5-sess",
      requestUrl: "https://api.domain.com/v0/endpoint",
    };
    const { type } = config;
    const {
      username, password, realm, nonce, opaque, algorithm,
      requestUrl, qop, nc, cnonce,
    } = (type === 'digest' ? config.config : defaults);
    return html`<authorization-method
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      type="digest"
      .username="${username}"
      .password="${password}"
      .realm="${realm}"
      .nonce="${nonce}"
      .opaque="${opaque}"
      .algorithm="${algorithm}"
      .requestUrl="${requestUrl}"
      .qop="${qop}"
      .cnonce="${cnonce}"
      .nc="${nc}"
    ></authorization-method>`;
  }

  _oa1Template(config={}) {
    const {
      compatibility,
      outlined,
      oauth1redirect,
    } = this;
    const defaults = {
      consumerKey: 'key',
      consumerSecret: 'secret',
      token: 'oauth 1 token',
      tokenSecret: 'oauth 1 token secret',
    };
    const { type } = config;
    const {
      consumerKey, consumerSecret, token, tokenSecret, timestamp,
      nonce, realm, signatureMethod, authTokenMethod, authParamsLocation,
    } = (type === 'oauth 1' ? config.config : defaults);
    return html`<authorization-method
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      type="oauth 1"
      .consumerKey="${consumerKey}"
      .consumerSecret="${consumerSecret}"
      .redirectUri="${oauth1redirect}"
      .token="${token}"
      .tokenSecret="${tokenSecret}"
      .timestamp="${timestamp}"
      .nonce="${nonce}"
      .realm="${realm}"
      .signatureMethod="${signatureMethod}"
      .authTokenMethod="${authTokenMethod}"
      .authParamsLocation="${authParamsLocation}"
      requesttokenuri="http://term.ie/oauth/example/request_token.php"
      accesstokenuri="http://term.ie/oauth/example/access_token.php"
    ></authorization-method>`;
  }

  _oa2Template(config={}) {
    const {
      compatibility,
      outlined,
      oauth2redirect,
      oauth2scopes,
    } = this;

    const defaults = {
      clientId: 'test-client-id',
      grantType: 'implicit',
      scopes: oauth2scopes,
      accessTokenUri: 'https://api.domain.com/token',
      authorizationUri: this.authorizationUri,
      username: "oauth2-username",
      password: "oauth2-password",
    };
    const { type } = config;
    let {
      accessToken, tokenType, scopes, clientId, grantType, deliveryMethod,
      deliveryName, clientSecret, accessTokenUri, authorizationUri,
      username, password,
    } = (type === 'oauth 2' ? config.config : defaults);
    if (!authorizationUri) {
      authorizationUri = this.authorizationUri
    }
    return html`<authorization-method
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      type="oauth 2"
      .scopes="${scopes}"
      .accessToken="${accessToken}"
      .tokenType="${tokenType}"
      .clientId="${clientId}"
      .clientSecret="${clientSecret}"
      .grantType="${grantType}"
      .deliveryMethod="${deliveryMethod}"
      .deliveryName="${deliveryName}"
      .authorizationUri="${authorizationUri}"
      .accessTokenUri="${accessTokenUri}"
      .username="${username}"
      .password="${password}"
      redirectUri="${oauth2redirect}"
    ></authorization-method>`;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      demoState,
      changeCounter,
      authConfiguration,
      allowNone,
    } = this;
    const selected = authConfiguration ? authConfiguration.selected : undefined;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the Authorization Selector element with various
          configuration options.
        </p>
        <arc-interactive-demo
          .states="${demoStates}"
          .selectedState="${demoState}"
          @state-chanegd="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <authorization-selector
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            slot="content"
            @change="${this._mainChangeHandler}"
            .selected="${selected}"
          >
            ${allowNone ? html`<div type="none">Authorization configuration is disabled</div>` : ''}
            ${this._basicTemplate(authConfiguration)}
            ${this._ntlmTemplate(authConfiguration)}
            ${this._digestTemplate(authConfiguration)}
            ${this._oa1Template(authConfiguration)}
            ${this._oa2Template(authConfiguration)}
          </authorization-selector>

          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="allowNone"
            @change="${this._toggleMainOption}"
            >Alow "None"</anypoint-checkbox
          >
        </arc-interactive-demo>
        <p>Change event dispatched ${changeCounter} time(s)</p>
      </section>
    `;
  }

  _singleItemTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      demoState,
    } = this;
    return html`
      <h3>Single authorization method</h3>
      <arc-interactive-demo
        .states="${demoStates}"
        .selectedState="${demoState}"
        @state-chanegd="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >

        <authorization-selector
          ?compatibility="${compatibility}"
          ?outlined="${outlined}"
          slot="content"
        >
          ${this._basicTemplate()}
        </authorization-selector>
      </arc-interactive-demo>
    `;
  }

  _attrForSelectedTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      demoState,
    } = this;
    return html`
      <h3>With "attrForSelected" set to type</h3>
      <arc-interactive-demo
        .states="${demoStates}"
        .selectedState="${demoState}"
        @state-chanegd="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >

        <authorization-selector
          ?compatibility="${compatibility}"
          ?outlined="${outlined}"
          slot="content"
          attrforselected="type"
          selected="ntlm"
        >
          ${this._basicTemplate()}
          ${this._ntlmTemplate()}
          ${this._digestTemplate()}
          ${this._oa1Template()}
          ${this._oa2Template()}
        </authorization-selector>
      </arc-interactive-demo>
    `;
  }

  _introductionTemplate() {
    return html `
      <section class="documentation-section">
        <h2>Introduction</h2>
        <p>
          A web component to render signle authorization method from a list of available methods.
        </p>
        <p>
          This component implements Material Design styles.
        </p>
      </section>
      <client-certificate-model></client-certificate-model>
    `;
  }

  _usageTemplate() {
    return html `
      <section class="documentation-section">
        <h2>Usage</h2>
        <p>Authorization selector comes with 2 predefied styles:</p>
        <ul>
          <li><b>Filled</b> (default)</li>
          <li>
            <b>Compatibility</b> - To provide compatibility with Anypoint design
          </li>
        </ul>

        ${this._singleItemTemplate()}
        ${this._attrForSelectedTemplate()}
      </section>`;
  }

  contentTemplate() {
    return html`
      <h2>Authorization selector</h2>
      <oauth2-authorization></oauth2-authorization>
      ${this._demoTemplate()}
      ${this._introductionTemplate()}
      ${this._usageTemplate()}
    `;
  }
}

const instance = new DemoPage();
instance.render();
window._demo = instance;
