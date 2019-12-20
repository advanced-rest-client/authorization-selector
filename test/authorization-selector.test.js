import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '@advanced-rest-client/authorization-method/authorization-method.js';
import { nodeToLabel } from '../src/AuthorizationSelector.js';
import '../authorization-selector.js';
import './custom-method.js';

describe('authorization-selector', function() {
  async function basicFixture() {
    return (await fixture(html`<authorization-selector></authorization-selector>`));
  }

  async function methodsFixture(selected) {
    return (await fixture(html`<authorization-selector .selected="${selected}">
      <authorization-method type="basic"></authorization-method>
      <authorization-method type="ntlm"></authorization-method>
    </authorization-selector>`));
  }

  async function singleFixture() {
    return (await fixture(html`<authorization-selector>
      <authorization-method type="basic"></authorization-method>
    </authorization-selector>`));
  }

  async function attrForSelectedFixture(selected) {
    return (await fixture(html`<authorization-selector .selected="${selected}" attrforselected="type">
      <authorization-method type="basic"></authorization-method>
      <authorization-method type="ntlm"></authorization-method>
    </authorization-selector>`));
  }

  async function customFixture(selected) {
    return (await fixture(html`<authorization-selector .selected="${selected}" attrforlabel="data-label">
      <authorization-method type="basic"></authorization-method>
      <div type="noop-custom"></div>
      <custom-auth-method type="test-custom" data-label="Test custom"></custom-auth-method>
      <div id="not-included"></div>
    </authorization-selector>`));
  }

  async function labelsFixture() {
    return (await fixture(html`<authorization-selector attrforlabel="data-label">
      <authorization-method type="basic"></authorization-method>
      <authorization-method type="basic" data-label="Test Basic"></authorization-method>
      <custom-auth-method type="test-custom" data-label="Test Custom"></custom-auth-method>
      <custom-auth-method type="other-custom"></custom-auth-method>
      <div type="attribute-custom"></div>
    </authorization-selector>`));
  }

  async function authorizeFixture(selected) {
    return (await fixture(html`<authorization-selector .selected="${selected}">
      <authorization-method type="basic"></authorization-method>
      <authorization-method type="oauth 2"></authorization-method>
    </authorization-selector>`));
  }

  describe('initialization', () => {
    it('can be created by using web APIs', async () => {
      const element = document.createElement('authorization-selector');
      assert.ok(element);
    });

    it('can be created from a template', async () => {
      const element = await basicFixture();
      assert.ok(element);
    });
  });

  describe('#selectable', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('reads the value', () => {
      assert.equal(element.selectable, '[type]');
    });

    it('throws an error when trying to override', () => {
      assert.throws(() => {
        element.selectable = 'test'
      });
    });
  });

  describe('Children rendering', () => {
    it('renders no authorization method when no selection', async () => {
      const element = await methodsFixture();
      const nodes = element.querySelector('authorization-method');
      const node = Array.from(nodes).some((node) => !node.hasAttribute('hidden'));
      assert.notOk(node, 'all nodes are hidden');
    });

    it('renders selected method only', async () => {
      const element = await methodsFixture(1);
      assert.isFalse(element.querySelector('[type=ntlm]').hasAttribute('hidden'));
      assert.isTrue(element.querySelector('[type=basic]').hasAttribute('hidden'));
    });

    it('renders other method when selection change', async () => {
      const element = await methodsFixture(1);
      element.selected = 0;
      await nextFrame();
      assert.isFalse(element.querySelector('[type=basic]').hasAttribute('hidden'));
      assert.isTrue(element.querySelector('[type=ntlm]').hasAttribute('hidden'));
    });

    it('automatically selects signle authorization method', async () => {
      const element = await singleFixture();
      assert.equal(element.selected, 0);
    });
  });

  describe('Selection management', () => {
    it('changes selection when dropdown item is selected', async () => {
      const element = await methodsFixture();
      const option = element.shadowRoot.querySelector('anypoint-item[data-label="Basic"]');
      MockInteractions.tap(option);
      assert.equal(element.selected, 0);
    });

    it('changes selection when dropdown item is selected for attrforselected', async () => {
      const element = await attrForSelectedFixture();
      const option = element.shadowRoot.querySelector('anypoint-item[data-label="Basic"]');
      MockInteractions.tap(option);
      assert.equal(element.selected, 'basic');
    });

    it('changes selection for attrforselected', async () => {
      const element = await attrForSelectedFixture();
      element.selected = 'ntlm';
      assert.isFalse(element.querySelector('[type=ntlm]').hasAttribute('hidden'));
    });
  });

  describe('Dynamic children', () => {
    it('adds new method dynamically to existing methods', async () => {
      const element = await methodsFixture();
      const node = document.createElement('authorization-method');
      node.setAttribute('type', 'oauth 1');
      element.appendChild(node);
      await nextFrame();
      assert.lengthOf(element.items, 3, 'new child is detected');
      assert.equal(element.items[2].type, 'oauth 1', 'new child is inserted in the right position');
      const options = element.shadowRoot.querySelectorAll('anypoint-item[data-label]');
      assert.lengthOf(options, 3, 'has 3 options in the selector');
    });

    it('removes an option when node is removed', async () => {
      const element = await methodsFixture();
      const node = element.querySelector('[type="basic"]');
      element.removeChild(node);
      await nextFrame();
      assert.lengthOf(element.items, 1, 'the child is removed');
      const options = element.shadowRoot.querySelectorAll('anypoint-item[data-label]');
      assert.lengthOf(options, 1, 'has 1 option in the selector');
    });

    it('removes selection when removing current node', async () => {
      const element = await methodsFixture(0);
      const node = element.querySelector('[type="basic"]');
      element.removeChild(node);
      await nextFrame();
      assert.isUndefined(element.selected, 'selected is undefined');
      assert.isUndefined(element._dropdownSelected, '_dropdownSelected is undefined');
      assert.notOk(element._dropdown._selectedItem, '_selectedItem on the dropdown is undefined');
    });

    it('keeps selection when removed node is not selected', async () => {
      const element = await methodsFixture(1);
      const node = element.querySelector('[type="basic"]');
      element.removeChild(node);
      await nextFrame();
      assert.equal(element.selected, 0);
    });
  });

  describe('Custom authorization methods', () => {
    it('accepts all supported methods', async () => {
      const element = await customFixture();
      assert.lengthOf(element.items, 3, 'has all recognized methods')
    });

    it('accepts label defined on a cutom method', async () => {
      const element = await customFixture();
      const option = element.shadowRoot.querySelector('anypoint-item[data-label="Test custom"]');
      assert.ok(option);
    });

    it('selects cutom method', async () => {
      const element = await customFixture(2);
      assert.isFalse(element.querySelector('[type=test-custom]').hasAttribute('hidden'));
    });

    it('selects cutom method (native element)', async () => {
      const element = await customFixture(1);
      assert.isFalse(element.querySelector('[type=noop-custom]').hasAttribute('hidden'));
    });
  });

  describe('Methods labeling', () => {
    it('sets label for a default method', async () => {
      const element = await labelsFixture();
      const node = element.shadowRoot.querySelector('[data-label=Basic]');
      assert.equal(node.textContent.trim(), 'Basic');
    });

    it('overrides label for a default method', async () => {
      const element = await labelsFixture();
      const node = element.shadowRoot.querySelector('[data-label="Test Basic"]');
      assert.equal(node.textContent.trim(), 'Test Basic');
    });

    it('sets label for an unknown method', async () => {
      const element = await labelsFixture();
      const node = element.shadowRoot.querySelector('[data-label="Test Custom"]');
      assert.equal(node.textContent.trim(), 'Test Custom');
    });

    it('uses type property as a fallback', async () => {
      const element = await labelsFixture();
      const node = element.shadowRoot.querySelector('[data-label="other-custom"]');
      assert.equal(node.textContent.trim(), 'other-custom');
    });

    it('uses type attribute as a fallback', async () => {
      const element = await labelsFixture();
      const node = element.shadowRoot.querySelector('[data-label="attribute-custom"]');
      assert.equal(node.textContent.trim(), 'attribute-custom');
    });
  });

  describe('nodeToLabel()', () => {
    it('returns empty string when no node', () => {
      const result = nodeToLabel();
      assert.equal(result, '');
    });

    it('returns attribute value for attrForLabel', () => {
      const node = document.createElement('p');
      node.setAttribute('test-label', 'test-value');
      const result = nodeToLabel(node, 'test-label');
      assert.equal(result, 'test-value');
    });

    it('returns the same "type" property value', () => {
      const node = document.createElement('p');
      node.type = 'test-type-property';
      const result = nodeToLabel(node);
      assert.equal(result, 'test-type-property');
    });

    it('returns the same "type" attribute value', () => {
      const node = document.createElement('p');
      node.setAttribute('type', 'test-type-attribute');
      const result = nodeToLabel(node);
      assert.equal(result, 'test-type-attribute');
    });

    it('returns the "type" property when attrForLabel is not in the passed node', () => {
      const node = document.createElement('p');
      node.type = 'test-type';
      const result = nodeToLabel(node, 'test-label');
      assert.equal(result, 'test-type');
    });

    [
      ['none', 'None'],
      ['basic', 'Basic'],
      ['ntlm', 'NTLM'],
      ['digest', 'Digest'],
      ['oauth 1', 'OAuth 1'],
      ['oauth 2', 'OAuth 2'],
      ['client certificate', 'Client certificate'],
    ].forEach(([type, label]) => {
      it(`returns mapped value for ${type}`, () => {
        const node = document.createElement('p');
        node.type = type;
        const result = nodeToLabel(node);
        assert.equal(result, label);
      });
    });
  });

  describe('#type', () => {
    it('returns null when no selection', async () => {
      const element = await customFixture();
      assert.strictEqual(element.type, null);
    });

    it('returns value from "type" property', async () => {
      const element = await customFixture(0);
      assert.strictEqual(element.type, 'basic');
    });

    it('returns value from "type" attribute', async () => {
      const element = await customFixture(1);
      assert.strictEqual(element.type, 'noop-custom');
    });
  });

  describe('onchange', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onchange);
      const f = () => {};
      element.onchange = f;
      assert.isTrue(element.onchange === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onchange = f;
      element._notifyChange();
      element.onchange = null;
      assert.isTrue(called);
    });

    it('Unregisters old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onchange = f1;
      element.onchange = f2;
      element._notifyChange();
      element.onchange = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('serialize()', () => {
    it('returns null when no selection', async () => {
      const element = await customFixture();
      const result = element.serialize();
      assert.strictEqual(result, null);
    });

    it('returns null when no serialize function on selected item', async () => {
      const element = await customFixture(1);
      const result = element.serialize();
      assert.strictEqual(result, null);
    });

    it('returns result of calling serialize function on selected item', async () => {
      const element = await customFixture(0);
      const result = element.serialize();
      assert.deepEqual(result, { username: '', password: '' });
    });
  });

  describe('validate()', () => {
    it('returns true when no selection', async () => {
      const element = await customFixture();
      const result = element.validate();
      assert.isTrue(result);
    });

    it('returns true when no validate function on selected item', async () => {
      const element = await customFixture(1);
      const result = element.validate();
      assert.isTrue(result);
    });

    it('returns result of calling validate function on selected item', async () => {
      const element = await customFixture(0);
      const result = element.validate();
      assert.isFalse(result);
    });
  });

  describe('authorize()', () => {
    it('returns null when no selection', async () => {
      const element = await customFixture();
      const result = element.authorize();
      assert.strictEqual(result, null);
    });

    it('returns null when no authorize function on selected item', async () => {
      const element = await customFixture(0);
      const result = element.authorize();
      assert.strictEqual(result, null);
    });

    it('returns result of calling authorize function on selected item', async () => {
      const element = await authorizeFixture(1);
      const result = element.authorize();
      assert.isFalse(result); // result of calling authorize() on invalid oauth 2
    });
  });

  describe('restore()', () => {
    it('ignores when no selection', async () => {
      const element = await customFixture();
      element.restore({});
    });

    it('ignores when no authorize function on selected item', async () => {
      const element = await customFixture(1);
      element.restore({});
    });

    it('restores values on selected item', async () => {
      const element = await customFixture(0);
      element.restore({
        username: 'test-u',
        password: 'test-p'
      });
      const result = element.serialize();
      assert.deepEqual(result, {
        username: 'test-u',
        password: 'test-p'
      });
    });
  });

  describe('change event', () => {
    it('dispatches the event when method selection changes', async () => {
      const element = await methodsFixture();
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const option = element.shadowRoot.querySelector('anypoint-item[data-label="Basic"]');
      MockInteractions.tap(option);
      assert.isTrue(spy.called);
    });

    it('retargets event from method', async () => {
      const element = await methodsFixture(0); // basic
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      const method = element.querySelector('authorization-method[type="basic"]');
      method.dispatchEvent(new CustomEvent('change')); // non-bubbling
      assert.isTrue(spy.called);
    });
  });

  describe('accessibility', () => {
    it('is accessible when no selection', async () => {
      const element = await methodsFixture();
      await assert.isAccessible(element);
    });

    it('is accessible when selection', async () => {
      const element = await methodsFixture(0);
      await assert.isAccessible(element);
    });

    it('is accessible when no methods', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element);
    });
  });
});
