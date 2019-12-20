import { css } from 'lit-element';
export default css`
:host {
  display: block;
}

::slotted([hidden]) {
  display: none !important;
}
`;
