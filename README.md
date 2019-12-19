# authorization-selector

A web component that renders single authorization method from a list of passed as children methods. In a way it behaves like `<select>` element that accepts `<option>` elements as children and render drop down to select single option.

The element is designed to work with `@advanced-rest-client/authorization-method` element. You can create own element by extending `@advanced-rest-client/authorization-method/src/AuthorizationBase.js` class. However, the component renders any child and has `type` attribute.

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
    <script>
    {
      const selector = document.querySelector('authorization-selector');
      selector.onchange = (e) => {
        const { target } = e;
        console.log(`Current settings for ${target.type} method is`, target.serialize());
      };
    }
    </script>
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

## The "none" authorization method

Sometimes users may want to choose not to provide any authorization values. With default configuration
once the user select a method there's no way to reset it "none".
To allow the user to make a "none" selection you can simply add a node that has `type="none"` attribute set.

```html
<authorization-selector selected="0">
  <div type="none">Authorization configuration is disabled</div>
  <authorization-method type="basic"></authorization-method>
</authorization-selector>
</body>
```

The result of calling `serialize()` function is always `null` when `none` is selected. You can change this behavior by adding the `serialize()` function to the node.

Be aware that by manipulating the children at runtime the drop down selector may be
out of sync with the selected panel if the children before current selection has changed. In this case you should set `selected` to `undefined` to reset the selection.

## Creating custom authorization methods

The easiest way is to create a custom element that extends `@advanced-rest-client/authorization-method/src/AuthorizationBase.js`. You can override any of methods defined there. Most likely you would defined `validate()` and possibly `serialize()` functions.

You can also create completely different based on other class. You can see an example of such in [demo/custom-method.js](demo/custom-method.js) file.

Things to remember:

-   when inserting a method to the DOM always set `type`. It is an identifier used by you to know which authorization data you are dealing with. Also, if it's not defined then this component will ignore it.
-   Optionally provide an attribute with a value that is rendered in the drop down selector. Set `attrforlabel` on this element to inform it where to look for the label.
-   The `serialize()` function is just a helper for you to get the configuration values in single function call. It is not used by this element.
-   The `validate()` function has no effect on this element or the UI unless you perform some action after validating the state.
-   The most efficient way of dealing with setting and getting properties is to directly work with the properties / attributes of the authorization method and then to listen for `change` event to serialize configuration or to perform validation.

Example

```html
<authorization-selector attrforlabel="label">
  <custom-auth-method1 type="custom1" label="Custom method #1"></custom-auth-method1>
  <custom-auth-method2 type="custom2" label="Custom method #2"></custom-auth-method2>
  <authorization-method type="basic" label="Custom Basic"></authorization-method>
</authorization-selector>
```

You can also use `attrforlabel` to override default label generated for the common authorization methods.
It takes the attribute value before it processes the `type` attribute.

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
