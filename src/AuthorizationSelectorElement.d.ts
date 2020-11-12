import { AuthorizationMethod } from "@advanced-rest-client/authorization-method";
import { AnypointDropdownMenu } from "@anypoint-web-components/anypoint-dropdown-menu";
import { AnypointSelectableMixin } from "@anypoint-web-components/anypoint-selector/anypoint-selectable-mixin";
import { CSSResult, LitElement, TemplateResult } from "lit-element";

export declare const dropdownSelected: unique symbol;
export declare const updateSelectionState: unique symbol;
export declare const activateDropdownHandler: unique symbol;
export declare const selectedDropdownHandler: unique symbol;
export declare const dropdownItemTemplate: unique symbol;
export declare const methodSelectorTemplate: unique symbol;
export declare const notifyChange: unique symbol;
export declare const methodChange: unique symbol;
export declare const dropdownValue: unique symbol;
export declare const testRemovedSelected: unique symbol;
export declare const removeItemsListeners: unique symbol;
export declare const addItemsListeners: unique symbol;
export declare const ensureSingleSelection: unique symbol;
export declare const selectionHandler: unique symbol;
export declare const processDocs: unique symbol;

/**
 * A function that maps a value of the `type` attribute of an authorization method
 * to a label to be presented in the dropdown.
 *
 * The `attrForLabel` has higher priority of defining a custom name for the method.
 *
 * @param node A node to read type from.
 * @param attrForLabel In case when the type is not recognized it uses this attribute to look for the label.
 * @returns Label for the type.
 */
export declare function nodeToLabel(node: AuthorizationMethod, attrForLabel?: string): string;

/**
 * @fires change When configuration change
 * @slot - Authorization method to be rendered. Must have `type` attribute to be rendered.
 * @slot aria - For description of the selected method. Recognized by `aria-describedby` property of the auth method
 */
export declare class AuthorizationSelectorElement extends AnypointSelectableMixin(LitElement) {
  get styles(): CSSResult;
  get [dropdownValue](): AnypointDropdownMenu;
  onchange: EventListener;
  get type(): string|null;
  selectable: string;

  /**
   * Enables outlined theme.
   * @attribute
   */
  outlined: boolean;
  /**
   * Enables compatibility with Anypoint components.
   * @attribute
   */
  compatibility: boolean;
  /**
   * An attribute to use to read value for the label to be rendered in the
   * drop down when `type` property cannot be translated to a common name.
   *
   * This attribute should be set on the child element.
   * 
   * @attribute
   */
  attrForLabel: string;

  /** 
   * When set it renders the authorization form next to the drop down.
   * Use this when there's enough screen to render the form.
   * 
   * @attribute
   */
  horizontal: boolean;

  [dropdownSelected]: number;

  constructor();

  connectedCallback(): void;
  disconnectedCallback(): void;
  firstUpdated(): void;

  /**
   * Calls `serialize()` function on currently selected authorization method.
   *
   * @returns Result of calling `serialize()` function on selected
   * method or `null` if no selection or selected method does not implement this
   * function.
   */
  serialize(): any|null;

  /**
   * Calls `validate()` function on currently selected authorization method.
   *
   * @returns Result of calling `validate()` function on selected
   * method or `null` if no selection or selected method does not implement this
   * function.
   */
  validate(): boolean;

  /**
   * Calls `authorize()` function on currently selected authorization method.
   *
   * @returns Result of calling `authorize()` function on selected
   * method or `null` if no selection or selected method does not implement this
   * function.
   */
  authorize(): any|null;

  /**
   * Calls `serialize()` function on currently selected authorization method.
   *
   * Note, this function quits quietly when there's no selection or when selected
   * method does not implement the `restore()` function
   */
  restore(values: any): void;

  /**
   * A handler for `items-changed` event dispatched by the selectable mixin.
   * It manages selection state when items changed.
   */
  _itemsHandler(): void;

  /**
   * Handler for `selected-changed` event dispatched by the selectable mixin.
   *
   * Updates selection state and sets/removed `hidden` attribute on the children.
   */
  [selectionHandler](): void;

  /**
   * A handler for the `selected-changed` event dispatched on the dropdown
   * element.
   * It maps selected index on the dropdown to currently `selected` value.
   * Note, when `attrForSelected` is used then it won't be the index of selected
   * item.
   */
  [selectedDropdownHandler](e: CustomEvent|null): void;

  /**
   * Handler for the `activate` event dispatched by the dropdown.
   * It ensures that the dropdown is closed when clicked on already selected item.
   */
  [activateDropdownHandler](e: CustomEvent|null): void;

  /**
   * Updates children to add or remove the `hidden` attribute depending on current selection.
   */
  [updateSelectionState](): void;

  /**
   * Ensures that authorization method is selected if only one item is
   * recognized.
   */
  [ensureSingleSelection](): void;

  /**
   * Overrides `_mutationHandler()` from the selectable mixin to add/remove
   * `change` event on authorization methods being added / removed.
   */
  _mutationHandler(mutationsList: Array<MutationRecord>): void;

  /**
   * Tests whether a node in a list of removed nodes represents currently selected
   * authorization method. If so then it removes current selection.
   * This is to ensure the label in the dropdown is updated when current selection change.
   *
   * @param nodesList A list of removed nodes.
   */
  [testRemovedSelected](nodesList: NodeList): void;

  /**
   * Removes `change` observer from passed nodes.
   *
   * @param nodes List of nodes to remove event listener from.
   */
  [removeItemsListeners](nodes: Array<Node>|NodeList): void;

  /**
   * Adds `change` observer to passed nodes.
   * It is safe to call it more than once on the same nodes list as it removes
   * the event listener if it previously was registered.
   *
   * @param nodes List of nodes to add event listener to.
   */
  [addItemsListeners](nodes: Array<Node>|NodeList): void;

  /**
   * Handler for authorization method `change` event that re-targets
   * the event to be dispatched from this element.
   */
  [methodChange](): void;

  /**
   * Dispatches non-bubbling `change` event.
   */
  [notifyChange](): void;
  
  /**
   * It checks whether the current selection has an element that describes it via 
   * the ARIA attribute, and if so then it renders it in the slot.
   */
  [processDocs](): void;

  render(): TemplateResult;
  [methodSelectorTemplate](): TemplateResult|string;
  [dropdownItemTemplate](item: AuthorizationMethod): TemplateResult;
}
