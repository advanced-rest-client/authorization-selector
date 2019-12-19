# authorization-selector

A web component that renders single authorization method from a list of passed as children methods. In a way it behaves like `<select>` HTML element that accepts `<option>` elements as children and render drop down to select single option.

The element is designed to work with `@advanced-rest-client/authorization-method` element. You can create own element by extending `@advanced-rest-client/authorization-method/src/AuthorizationBase.js` class. However, the component renders any child and adds support to children with `type` attribute.

## Usage

### Installation

```bash
npm install --save @advanced-rest-client/authorization-selector
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/authorization-selector/authorization-selector.js';
      import '@advanced-rest-client/authorization-method/authorization-method.js';
    </script>
  </head>
  <body>
    <authorization-selector selected="0">
      <authorization-method type="basic"></authorization-method>
      <authorization-method type="oauth 2"></authorization-method>
      <authorization-method type="x-custom"></authorization-method>
      <authorization-method type="api key"></authorization-method>
    </authorization-selector>
  </body>
</html>
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/authorization-selector/authorization-selector.js';
import '@advanced-rest-client/authorization-method/authorization-method.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <authorization-selector
      @change="${this._securityChangeHandler}"
    >
      <authorization-method type="basic"></authorization-method>
      <authorization-method type="oauth 2"></authorization-method>
    </authorization-selector>
    `;
  }

  _securityChangeHandler(e) {
    console.log('current authorization settings', e.target.serialize());
  }
}
customElements.define('sample-element', SampleElement);
```

## Authorization data processing

Unlike the `@advanced-rest-client/auth-methods` and `@advanced-rest-client/authorization-panel` this element and the `authorization-method` does not manage state of authorization configuration.
This should be done by the hosting component/application. State management in this case is very complex and depends on the environment so it won't be supported here.

The `@advanced-rest-client/authorization-selector` panel cooperates with `@advanced-rest-client/authorization-method` elements and provides similar API (the `validate`, `serialize`, `authorize`, and `restore` functions). It calls the corresponding method on currently selected element. It also dispatches `change` event redirected from `authorization-method` element that is currently selected.

To pass the authorization configuration data from a store to the corresponding authorization method you have to pass the values via properties or attributes on the `authorization-method` element.
See the demo page for one of possible solutions of how to do this.

### Example

```javascript
class SampleElement extends LitElement {

  constructor() {
    super();
    this.authConfiguration = this.restoreConfigurationSomehow();
  }

  render() {
    const { authConfiguration } = this;
    return html`<authorization-selector
      .selected="${selected}"
      @change="${this._authChangeHandler}"
    >
      ${this._basicTemplate(authConfiguration)}
      ${this._ntlmTemplate(authConfiguration)}
      ${this._digestTemplate(authConfiguration)}
      ${this._oa1Template(authConfiguration)}
      ${this._oa2Template(authConfiguration)}
    </authorization-selector>`;
  }

  _authChangeHandler() {
    const { selected, type } = e.target;
    const config = e.target.serialize();

    this.authConfiguration = {
      selected,
      config,
      type,
    };

    this.storeConfigurationSomehow(this.authConfiguration);
  }

  _basicTemplate(config={}) {
    const { type } = config;
    const { username, password } = (type === 'basic' ? config.config : {});
    return html`<authorization-method
      type="basic"
      .username="${username}"
      .password="${password}"
    ></authorization-method>`;
  }

  _ntlmTemplate(config={}) {
    const { type } = config;
    const { username, password, domain } = (type === 'ntlm' ? config.config : {});
    return html`<authorization-method
      type="ntlm"
      .username="${username}"
      .password="${password}"
      .domain="${domain}"
    ></authorization-method>`;
  }

  // ...
}
```


## Development

```sh
git clone https://github.com/advanced-rest-client/authorization-selector
cd authorization-selector
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests
```sh
npm test
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
