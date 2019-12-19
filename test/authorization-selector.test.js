import { fixture, assert, html } from '@open-wc/testing';
// import * as sinon from 'sinon';
// import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '@advanced-rest-client/authorization-method/authorization-method.js';
import '../authorization-selector.js';

describe('authorization-selector', function() {
  async function basicFixture() {
    return (await fixture(html`<authorization-selector></authorization-selector>`));
  }

  // async function methodsFixture() {
  //   return (await fixture(html`<authorization-selector>
  //     <authorization-method type="basic"></authorization-method>
  //     <authorization-method type="ntlm"></authorization-method>
  //   </authorization-selector>`));
  // }

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
});
