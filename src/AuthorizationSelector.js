import { html, LitElement } from 'lit-element';
import { AnypointSelectableMixin } from '@anypoint-web-components/anypoint-selector/anypoint-selectable-mixin.js';
import '@anypoint-web-components/anypoint-dropdown-menu/anypoint-dropdown-menu.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import styles from './Styles.js';

const selectable = '[type]';

/**
 * A function that maps a value of the `type` attribute of an authorization method
 * to a label to be presented in the drodown.
 *
 * The `attrForLabel` has higher priority of defining a custom name for the method.
 *
 * @param {Node} node A node to read type from.
 * @param {String=} attrForLabel In case when the type is not recognized it uses
 * this attribute to look for the label.
 * @return {String} Lable for the type.
 */
export const nodeToLabel = (node, attrForLabel) => {
  if (!node) {
    return '';
  }
  if (attrForLabel && node.hasAttribute(attrForLabel)) {
    return node.getAttribute(attrForLabel);
  }
  let type = node.type;
  if (!type && node.hasAttribute('type')) {
    type = node.getAttribute('type');
  }
  type = String(type).toLowerCase();
  switch (type) {
    case 'none': return 'None';
    case 'basic': return 'Basic';
    case 'ntlm': return 'NTLM';
    case 'digest': return 'Digest';
    case 'oauth 1': return 'OAuth 1';
    case 'oauth 2': return 'OAuth 2';
    case 'client certificate': return 'Client certificate';
  }
  return type;
};

export class AuthorizationSelector extends AnypointSelectableMixin(LitElement) {
  get styles() {
    return [
      styles,
    ];
  }

  get _dropdown() {
    return this.shadowRoot.querySelector('anypoint-dropdown-menu');
  }

  /**
   * @return {any} Previously registered function or undefined.
   */
  get onchange() {
    return this._onChange;
  }
  /**
   * Registers listener for the `change` event
   * @param {any} value A function to be called when `change` event is
   * dispatched
   */
  set onchange(value) {
    if (this._onChange) {
      this.removeEventListener('change', this._onChange);
    }
    if (typeof value !== 'function') {
      this._onChange = null;
      return;
    }
    this._onChange = value;
    this.addEventListener('change', value);
  }
  /**
   * @return {String|null} A type attribute value of selected authorization method.
   */
  get type() {
    const { selectedItem } = this;
    if (!selectedItem) {
      return null;
    }
    if (selectedItem.type) {
      return selectedItem.type;
    }
    // because [type] is the only selectable childrent this has to have
    // `type` attribute
    return selectedItem.getAttribute('type');
  }

  get selectable() {
    return selectable;
  }

  set selectable(value) {
    throw new Error(`Cannot set ${value} on selectable attribute. It is read only.`);
  }

  static get properties() {
    return {
      /**
       * Enables outlined theme.
       */
      outlined: { type: Boolean, reflect: true },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean, reflect: true },
      /**
       * An attrribute to use to read value for the lable to be rendered in the
       * drop down when `type` property cannot be translated to a common name.
       *
       * This attribute should be set on the child element.
       */
      attrForLabel: { type: String },
      /**
       * A value to set on a dropdown's select attribute.
       *
       * Note, do not use it as a getter. It may not have the actual value.
       * This is used to force the dropdown to change a selection. However,
       * change in the UI is not handled here so the value may be different.
       */
      _dropdownSelected: { type: Number }
    };
  }

  constructor() {
    super();
    this._itemsHandler = this._itemsHandler.bind(this);
    this._selectionHandler = this._selectionHandler.bind(this);
    this._methodChange = this._methodChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('items-changed', this._itemsHandler);
    this.addEventListener('selected-changed', this._selectionHandler);
    this._updateSelectionState();
    if (this.attrForSelected) {
      this._selectionHandler();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('items-changed', this._itemsHandler);
    this.removeEventListener('selected-changed', this._selectionHandler);
  }

  firstUpdated() {
    const { items } = this;
    if (items && items.length) {
      this._addItemsListeners(items);
      this._itemsHandler();
    }
    this._dropdownSelected = this._valueToIndex(this.selected);
  }
  /**
   * Calls `serialize()` function on currenty selected authorization method.
   * @return {Object|null} Result of calling `serialize()` function on selected
   * method or `null` if no selection or selected method does not implement this
   * function.
   */
  serialize() {
    const { selectedItem } = this;
    return selectedItem && selectedItem.serialize ? selectedItem.serialize() : null;
  }
  /**
   * Calls `validate()` function on currenty selected authorization method.
   * @return {Boolean|null} Result of calling `validate()` function on selected
   * method or `null` if no selection or selected method does not implement this
   * function.
   */
  validate() {
    const { selectedItem } = this;
    return selectedItem && selectedItem.validate ? selectedItem.validate() : true;
  }
  /**
   * Calls `authorize()` function on currenty selected authorization method.
   * @return {any|null} Result of calling `authorize()` function on selected
   * method or `null` if no selection or selected method does not implement this
   * function.
   */
  authorize() {
    const { selectedItem } = this;
    return selectedItem && selectedItem.authorize ? selectedItem.authorize() : null;
  }
  /**
   * Calls `serialize()` function on currenty selected authorization method.
   *
   * Note, this function quits quietly when there's no selection or when selected
   * method does not implement the `restore()` function
   *
   * @param {Object} values
   */
  restore(values) {
    const { selectedItem } = this;
    if (selectedItem && selectedItem.restore) {
      selectedItem.restore(values);
    }
  }

  /**
   * A handler for `items-changed` event dispatched by the selectable mixin.
   * It manages selection state when items changed.
   */
  _itemsHandler() {
    this._ensureSingleSelection();
    this._updateSelectionState();
    this.requestUpdate();
  }
  /**
   * Handler for `selected-changed` event dispatched by the selectable mixin.
   *
   * Updates selection state and sets/removed `hidden` attribute on the children.
   */
  _selectionHandler() {
    this._updateSelectionState();
    this._selectSelected(this.selected);
    this._dropdownSelected = this._valueToIndex(this.selected);
  }
  /**
   * A handler for the `selected-changed` event dispatched on the dropdown
   * element.
   * It maps selected index on the dropdown to currently `selected` value.
   * Note, when `attrForSelected` is used then it won't be the index of selected
   * item.
   *
   * @param {CustomEvent} e
   */
  _selectedDropdownHandler(e) {
    this.selected = this._indexToValue(e.detail.value);
    this._notifyChange();
  }
  /**
   * Handler for the `activate` event dispatched by the dropdown.
   * It ensures that the dropdown is closed when clicked on already selected item.
   * @param {CustomEvent} e
   */
  _activateDropdownHandler(e) {
    e.target.parentNode.close();
  }
  /**
   * Updates children to add or remove the `hidden` attribute depending on current selection.
   */
  _updateSelectionState() {
    const { items, selected } = this;
    if (!items) {
      return;
    }
    for (let i = 0, len = items.length; i < len; i++) {
      const node = items[i];
      if (this._valueForItem(node) === selected) {
        if (node.hasAttribute('hidden')) {
          node.removeAttribute('hidden');
        }
      } else {
        if (!node.hasAttribute('hidden')) {
          node.setAttribute('hidden', '');
        }
      }
    }
  }
  /**
   * Ensures that authorization method is selected if only one item is
   * recognized.
   */
  _ensureSingleSelection() {
    const { items } = this;
    if (!items) {
      return;
    }
    if (items.length === 0 || items.length > 1) {
      return;
    }
    this.selected = this._indexToValue(0);
    this._dropdownSelected = 0;
    this._selectionHandler();
  }
  /**
   * Overrides `_mutationHandler()` from the selectable mixin to add/remove
   * `change` event on authorization methods being added / removed.
   * @param {Array<MutationRecord>} mutationsList
   */
  _mutationHandler(mutationsList) {
    super._mutationHandler(mutationsList);
    for(const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        if (mutation.removedNodes.length) {
          this._testRemovedSelected(mutation.removedNodes);
          this._removeItemsListeners(mutation.removedNodes);
          this.requestUpdate();
        } else if (mutation.addedNodes.length) {
          this._addItemsListeners(mutation.removedNodes);
        }
      }
    }
  }
  /**
   * Tests whether a node in a list of removed nodes represents currently selected
   * authorization method. If so then it removes current selection.
   * This is to ensure the label in the dropdown isthis.dispatchEvent( updated when current selection change.
   *
   * @param {NodeList} nodesList A list of removed nodes.
   */
  _testRemovedSelected(nodesList) {
    const dropdown = this._dropdown;
    if (!dropdown) {
      return;
    }
    const value = dropdown.value;
    const { attrForLabel } = this;
    for (let i = 0, len = nodesList.length; i < len; i++) {
      const type = nodesList[i].type;
      if (type && nodeToLabel(nodesList[i], attrForLabel) === value) {
        this.selected = undefined;
        dropdown._selectedItem = undefined;
        this._dropdownSelected = undefined;
        return;
      }
    }
  }
  /**
   * Removes `change` observer from passed nodes.
   *
   * @param {Array<Node>|NodeList} nodes List of nodes to remove event listener from.
   */
  _removeItemsListeners(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].removeEventListener('change', this._methodChange);
    }
  }
  /**
   * Adds `change` observer to passed nodes.
   * It is safe to call it more than once on the same nodes list as it removes
   * the event listener if it previously was registered.
   *
   * @param {Array<Node>|NodeList} nodes List of nodes to add event listener to.
   */
  _addItemsListeners(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].removeEventListener('change', this._methodChange);
      nodes[i].addEventListener('change', this._methodChange);
    }
  }
  /**
   * Handler for authorization method `change` event that retargets
   * the event to be dispatched from this element.
   */
  _methodChange() {
    this._notifyChange();
  }

  /**
   * Dispatches non-bubbling `change` event.
   */
  _notifyChange() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  render() {
    return html`
    <style>${this.styles}</style>
    ${this._methodSelectorTemplate()}
    <slot></slot>
    `;
  }

  _methodSelectorTemplate() {
    const {
      items,
      compatibility,
      outlined,
      _dropdownSelected,
    } = this;
    if (!items || !items.length) {
      return '';
    }
    return html`
    <anypoint-dropdown-menu
      aria-label="Activate to select authorization method"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    >
      <label slot="label">Select authorization</label>
      <anypoint-listbox
        slot="dropdown-content"
        tabindex="-1"
        .selected="${_dropdownSelected}"
        @selected-changed="${this._selectedDropdownHandler}"
        @activate="${this._activateDropdownHandler}"
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
      >
        ${items.map((item) => this._dropdownItemTemplate(item))}
      </anypoint-listbox>
    </anypoint-dropdown-menu>
    `;
  }

  _dropdownItemTemplate(item) {
    const {
      compatibility,
      outlined,
      attrForLabel,
    } = this;

    const label = nodeToLabel(item, attrForLabel)
    return html`<anypoint-item
      data-label="${label}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
    >${label}</anypoint-item>`;
  }
}
