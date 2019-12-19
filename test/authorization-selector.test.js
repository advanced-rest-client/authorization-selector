import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';

describe('authorization-selector', function() {
  async function basicFixture() {
    return (await fixture(html`<authorization-selector></authorization-selector>`));
  }

  async function queryDataFixture() {
    const elmRequest = fixture(html`<div>
      <client-certificate-model></client-certificate-model>
      <authorization-selector></authorization-selector>
    </div>`);
    return new Promise((resolve) => {
      window.addEventListener('client-certificate-list', function f(e) {
        window.removeEventListener('client-certificate-list', f);
        const { detail } = e;
        setTimeout(() => {
          detail.result
          .then(() => elmRequest)
          .then((node) => {
            resolve(node.querySelector('authorization-selector'));
          });
        });
      });
    });
  }

  async function untilAfterQuery(element, result) {
    return new Promise((resolve) => {
      element.addEventListener('client-certificate-list', function f(e) {
        element.removeEventListener('client-certificate-list', f);
        e.preventDefault();
        e.detail.result = Promise.resolve(result || []);
        nextFrame().then(() => resolve())
      });
      element.reset();
    });
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

    it('has no initial selection value', async () => {
      const element = await basicFixture();
      assert.isUndefined(element.selected);
    });

    it('has read only "type"', async () => {
      const element = await basicFixture();
      assert.equal(element.type, METHOD_CC, 'getter is set');
      assert.throws(() => {
        element.type = 'basic';
      }, 'Cannot set type value to basic. The type is read only.',
      'setter throws an error');
    });
  });

  describe('validate()', () => {
    it('always returns true', async () => {
      const element = document.createElement('authorization-selector');
      assert.isTrue(element.validate());
    });
  });

  describe('Empty state', () => {
    it('render empty state', async () => {
      const element = await basicFixture();
      await untilAfterQuery(element);
      const node = element.shadowRoot.querySelector('.empty-screen');
      assert.ok(node);
    });

    it('queries for certificates when initialized', async () => {
      const spy = sinon.spy();
      window.addEventListener('client-certificate-list', spy);
      await basicFixture();
      assert.isTrue(spy.called);
    });
  });

  describe('Data list', () => {
    before(async () => {
      await DataGenerator.insertCertificatesData({});
    });

    after(async () => {
      await DataGenerator.destroyClientCertificates();
    });

    let element;
    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('has items set', () => {
      assert.lengthOf(element.items, 15);
    });

    it('renders list items', () => {
      const nodes = element.shadowRoot.querySelectorAll('anypoint-radio-button');
      assert.lengthOf(nodes, 16);
    });

    it('does not render empty state', async () => {
      const node = element.shadowRoot.querySelector('.empty-screen');
      assert.notOk(node);
    });

    it('selects button group when selected changes', async () => {
      const item = element.items[0];
      const id = item._id;
      element.selected = id;
      await nextFrame();
      const group = element.shadowRoot.querySelector('anypoint-radio-group');
      const button = element.shadowRoot.querySelector(`[data-id="${id}"]`);
      assert.equal(group.selected, id, 'group selection is set');
      assert.isTrue(button.checked, 'button is checked');
    });
  });

  describe('datastore-destroyed event handler', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.items = DataGenerator.generateClientCertificates({ size: 5 });
    });

    it('resets items', () => {
      document.body.dispatchEvent(new CustomEvent('datastore-destroyed', {
        bubbles: true,
        detail: {
          datastore: 'client-certificates'
        }
      }));
      assert.isUndefined(element.items);
    });

    it('ignores other data stores', () => {
      document.body.dispatchEvent(new CustomEvent('datastore-destroyed', {
        bubbles: true,
        detail: {
          datastore: 'saved-requests'
        }
      }));
      assert.lengthOf(element.items, 5);
    });
  });

  describe('data-imported event handler', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls reset()', () => {
      const spy = sinon.spy(element, 'reset');
      document.body.dispatchEvent(new CustomEvent('data-imported', {
        bubbles: true
      }));
      assert.isTrue(spy.called);
    });
  });

  describe('client-certificate-delete event handler', () => {
    let element;

    before(async () => {
      await DataGenerator.insertCertificatesData({});
    });

    after(async () => {
      await DataGenerator.destroyClientCertificates();
    });

    beforeEach(async () => {
      element = await queryDataFixture();
    });

    function fire(id, cancelable) {
      if (cancelable === undefined) {
        cancelable = false;
      }
      const e = new CustomEvent('client-certificate-delete', {
        cancelable,
        bubbles: true,
        detail: {
          id
        }
      });
      document.body.dispatchEvent(e);
    }

    it('removes existing item', () => {
      const before = element.items.length;
      const item = element.items[0];
      fire(item._id);
      assert.lengthOf(element.items, before - 1);
    });

    it('ignores cancelable event', () => {
      const before = element.items.length;
      const item = element.items[0];
      fire(item._id, true);
      assert.lengthOf(element.items, before);
    });

    it('ignores when not on the list', () => {
      const before = element.items.length;
      fire('some-id', true);
      assert.lengthOf(element.items, before);
    });
  });

  describe('client-certificate-insert event handler', () => {
    let element;

    before(async () => {
      await DataGenerator.insertCertificatesData({});
    });

    after(async () => {
      await DataGenerator.destroyClientCertificates();
    });

    beforeEach(async () => {
      element = await queryDataFixture();
    });

    function fire(detail, cancelable) {
      if (cancelable === undefined) {
        cancelable = false;
      }
      const e = new CustomEvent('client-certificate-insert', {
        cancelable,
        bubbles: true,
        detail
      });
      document.body.dispatchEvent(e);
    }

    it('updates existing item', () => {
      let item = element.items[0];
      item = Object.assign({}, item);
      item.name = 'test';
      fire(item);
      assert.equal(element.items[0].name, 'test');
    });

    it('ignores cancelable event', () => {
      let item = element.items[0];
      item = Object.assign({}, item);
      item.name = 'test';
      fire(item, true);
      assert.notEqual(element.items[0].name, 'test');
    });

    it('Adds new item to the list', () => {
      const before = element.items.length;
      const item = DataGenerator.generateClientCertificate();
      item._id = (before + 1) + '_';
      fire(item);
      assert.lengthOf(element.items, before + 1);
    });
  });

  describe('Selecting an item', () => {
    let element;

    before(async () => {
      await DataGenerator.insertCertificatesData({});
    });

    after(async () => {
      await DataGenerator.destroyClientCertificates();
    });

    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('changes selection on item click', () => {
      const node = element.shadowRoot.querySelectorAll('anypoint-radio-button')[1];
      MockInteractions.tap(node);
      assert.notEqual(element.selected, 'none');
      assert.equal(element.selected, node.dataset.id);
    });

    it('notifies change when selection is made', () => {
      const node = element.shadowRoot.querySelectorAll('anypoint-radio-button')[1];
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      MockInteractions.tap(node);
      assert.isTrue(spy.called);
    });
  });

  describe('Restoring settings', () => {
    it('sets selected when settings are restored', async () => {
      const element = await basicFixture();
      await untilAfterQuery(element);
      element.restore({
        id: 'test'
      });
      assert.equal(element.selected, 'test');
    });

    it('sets undefined when no argument', async () => {
      const element = await basicFixture();
      await untilAfterQuery(element);
      element.restore();
      assert.isUndefined(element.selected);
    });
  });

  describe('serialize()', () => {
    let element;
    before(async () => {
      await DataGenerator.insertCertificatesData({});
    });

    after(async () => {
      await DataGenerator.destroyClientCertificates();
    });

    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('returns empty object when no selection', () => {
      const result = element.serialize();
      assert.deepEqual(result, {});
    });

    it('returns current selection', () => {
      const node = element.shadowRoot.querySelectorAll('anypoint-radio-button')[1];
      MockInteractions.tap(node);
      const result = element.serialize();
      assert.deepEqual(result, {
        id: node.dataset.id
      });
    });
  });
});
