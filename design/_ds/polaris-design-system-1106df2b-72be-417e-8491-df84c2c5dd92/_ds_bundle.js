/* @ds-bundle: {"format":3,"namespace":"PolarisDesignSystem_1106df","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"ButtonGroup","sourcePath":"components/actions/ButtonGroup.jsx"},{"name":"Avatar","sourcePath":"components/display/Avatar.jsx"},{"name":"Icon","sourcePath":"components/display/Icon.jsx"},{"name":"Tag","sourcePath":"components/display/Tag.jsx"},{"name":"Text","sourcePath":"components/display/Text.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Banner","sourcePath":"components/feedback/Banner.jsx"},{"name":"Spinner","sourcePath":"components/feedback/Spinner.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"RadioButton","sourcePath":"components/forms/RadioButton.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"BlockStack","sourcePath":"components/structure/BlockStack.jsx"},{"name":"InlineStack","sourcePath":"components/structure/BlockStack.jsx"},{"name":"Divider","sourcePath":"components/structure/BlockStack.jsx"},{"name":"Card","sourcePath":"components/structure/Card.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"310f0b871682","components/actions/ButtonGroup.jsx":"0366f32d7a37","components/display/Avatar.jsx":"68d439b8e85a","components/display/Icon.jsx":"bac2012cebdd","components/display/Tag.jsx":"49b9f45d0f27","components/display/Text.jsx":"82e039dbf9f1","components/feedback/Badge.jsx":"881d7457f3f0","components/feedback/Banner.jsx":"9f941e696d1b","components/feedback/Spinner.jsx":"2b374465dba4","components/forms/Checkbox.jsx":"992f87103908","components/forms/RadioButton.jsx":"19dd969384e5","components/forms/Select.jsx":"4b32c872e222","components/forms/TextField.jsx":"50ced09d90cd","components/structure/BlockStack.jsx":"90d366d0b35b","components/structure/Card.jsx":"7841640a1dae","ui_kits/admin/Common.jsx":"145f544f54f7","ui_kits/admin/Frame.jsx":"d5d1bfab2919","ui_kits/admin/Home.jsx":"08e5361ccb0b","ui_kits/admin/OrderDetail.jsx":"7f759200bc32","ui_kits/admin/Orders.jsx":"f1faa21a426a","ui_kits/admin/Products.jsx":"c90d0feb93d7","ui_kits/admin/data.js":"4528343b5197"},"inlinedExternals":[],"unexposedExports":[{"name":"iconNames","sourcePath":"components/display/Icon.jsx"}]} */

(() => {

const __ds_ns = (window.PolarisDesignSystem_1106df = window.PolarisDesignSystem_1106df || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/ButtonGroup.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Groups related buttons with consistent spacing. `segmented` connects them into one control. */
function ButtonGroup({
  children,
  gap = 'space-200',
  segmented,
  fullWidth,
  noWrap,
  style,
  ...rest
}) {
  const css = {
    display: 'flex',
    flexWrap: noWrap ? 'nowrap' : 'wrap',
    alignItems: 'center',
    gap: segmented ? 0 : `var(--p-${gap})`,
    ...style
  };
  if (segmented) {
    return /*#__PURE__*/React.createElement("div", _extends({
      "data-segmented": true,
      style: css
    }, rest), React.Children.map(children, (child, i) => {
      if (!React.isValidElement(child)) return child;
      const count = React.Children.count(children);
      const radius = {
        borderTopLeftRadius: i === 0 ? undefined : 0,
        borderBottomLeftRadius: i === 0 ? undefined : 0,
        borderTopRightRadius: i === count - 1 ? undefined : 0,
        borderBottomRightRadius: i === count - 1 ? undefined : 0,
        marginLeft: i === 0 ? 0 : 'var(--p-border-width-025)',
        flex: fullWidth ? '1 1 0' : undefined
      };
      return React.cloneElement(child, {
        style: {
          ...radius,
          ...child.props.style
        }
      });
    }));
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    style: css
  }, rest), children);
}
Object.assign(__ds_scope, { ButtonGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/ButtonGroup.jsx", error: String((e && e.message) || e) }); }

// components/display/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZE = {
  xs: 20,
  sm: 28,
  md: 32,
  lg: 40,
  xl: 60
};
const FONT = {
  xs: 'var(--p-font-size-275)',
  sm: 'var(--p-font-size-300)',
  md: 'var(--p-font-size-325)',
  lg: 'var(--p-font-size-350)',
  xl: 'var(--p-font-size-500)'
};

// Polaris rotates avatar bg across 7 named color pairs, chosen from the initials.
const SCHEMES = [['var(--p-color-avatar-one-bg-fill)', 'var(--p-color-avatar-one-text-on-bg-fill)'], ['var(--p-color-avatar-two-bg-fill)', 'var(--p-color-avatar-two-text-on-bg-fill)'], ['var(--p-color-avatar-three-bg-fill)', 'var(--p-color-avatar-three-text-on-bg-fill)'], ['var(--p-color-avatar-four-bg-fill)', 'var(--p-color-avatar-four-text-on-bg-fill)'], ['var(--p-color-avatar-five-bg-fill)', 'var(--p-color-avatar-five-text-on-bg-fill)'], ['var(--p-color-avatar-six-bg-fill)', 'var(--p-color-avatar-six-text-on-bg-fill)'], ['var(--p-color-avatar-seven-bg-fill)', 'var(--p-color-avatar-seven-text-on-bg-fill)']];
function pick(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) % SCHEMES.length;
  return SCHEMES[h];
}

/** Round (or squared) identity token: initials over a name-derived color, or an image. */
function Avatar({
  name = '',
  initials,
  source,
  size = 'md',
  shape = 'round',
  style,
  ...rest
}) {
  const px = SIZE[size] || SIZE.md;
  const [bg, fg] = pick(initials || name);
  const text = initials || name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const css = {
    width: px,
    height: px,
    flex: `0 0 ${px}px`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: shape === 'square' ? 'var(--p-border-radius-150)' : 'var(--p-border-radius-full)',
    background: source ? 'var(--p-color-bg-surface-secondary)' : bg,
    color: fg,
    fontFamily: 'var(--p-font-family-sans)',
    fontSize: FONT[size],
    fontWeight: 'var(--p-font-weight-medium)',
    overflow: 'hidden',
    userSelect: 'none',
    ...style
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: css
  }, rest), source ? /*#__PURE__*/React.createElement("img", {
    src: source,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : text);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/display/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Polaris icons — 20×20, monochrome, single-path. Source markup imported
 * verbatim from Shopify polaris-icons. Paths carry no fill attribute, so they
 * inherit `fill` from the <svg> (currentColor by default) and stay themeable.
 */
const ICONS = {
  "AlertCircleIcon": "<path d=\"M10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z\"></path><path d=\"M11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z\"></path><path fill-rule=\"evenodd\" d=\"M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-1.5 0a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z\"></path>",
  "AlertTriangleIcon": "<path d=\"M10 6.75a.75.75 0 0 1 .75.75v3.5a.75.75 0 1 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z\"></path><path d=\"M11 13.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z\"></path><path fill-rule=\"evenodd\" d=\"M10 3.5c-1.045 0-1.784.702-2.152 1.447a449.26 449.26 0 0 1-2.005 3.847l-.028.052a403.426 403.426 0 0 0-2.008 3.856c-.372.752-.478 1.75.093 2.614.57.863 1.542 1.184 2.464 1.184h7.272c.922 0 1.895-.32 2.464-1.184.57-.864.465-1.862.093-2.614-.21-.424-1.113-2.147-2.004-3.847l-.032-.061a429.497 429.497 0 0 1-2.005-3.847c-.368-.745-1.107-1.447-2.152-1.447Zm-.808 2.112c.404-.816 1.212-.816 1.616 0 .202.409 1.112 2.145 2.022 3.88a418.904 418.904 0 0 1 2.018 3.875c.404.817 0 1.633-1.212 1.633h-7.272c-1.212 0-1.617-.816-1.212-1.633.202-.408 1.113-2.147 2.023-3.883a421.932 421.932 0 0 0 2.017-3.872Z\"></path>",
  "ArrowDownIcon": "<path fill-rule=\"evenodd\" d=\"M10 3.5a.75.75 0 0 1 .75.75v9.69l2.72-2.72a.75.75 0 0 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 1.06-1.06l2.72 2.72v-9.69a.75.75 0 0 1 .75-.75Z\"></path>",
  "ArrowLeftIcon": "<path fill-rule=\"evenodd\" d=\"M16.5 10a.75.75 0 0 1-.75.75h-9.69l2.72 2.72a.75.75 0 0 1-1.06 1.06l-4-4a.75.75 0 0 1 0-1.06l4-4a.75.75 0 1 1 1.06 1.06l-2.72 2.72h9.69a.75.75 0 0 1 .75.75Z\"></path>",
  "ArrowRightIcon": "<path fill-rule=\"evenodd\" d=\"M3.5 10a.75.75 0 0 1 .75-.75h9.69l-2.72-2.72a.75.75 0 1 1 1.06-1.06l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 0 1-1.06-1.06l2.72-2.72h-9.69a.75.75 0 0 1-.75-.75Z\"></path>",
  "ArrowUpIcon": "<path fill-rule=\"evenodd\" d=\"M10 16.5a.75.75 0 0 1-.75-.75v-9.69l-2.72 2.72a.75.75 0 1 1-1.06-1.06l4-4a.75.75 0 0 1 1.06 0l4 4a.75.75 0 1 1-1.06 1.06l-2.72-2.72v9.69a.75.75 0 0 1-.75.75Z\"></path>",
  "CalendarIcon": "<path fill-rule=\"evenodd\" d=\"M7.75 3.5a.75.75 0 0 0-1.5 0v.407a3.075 3.075 0 0 0-.702.252 3.75 3.75 0 0 0-1.64 1.639c-.226.444-.32.924-.365 1.47-.043.531-.043 1.187-.043 2v1.464c0 .813 0 1.469.043 2 .045.546.14 1.026.366 1.47a3.75 3.75 0 0 0 1.639 1.64c.444.226.924.32 1.47.365.531.043 1.187.043 2 .043h3.383c.323 0 .542 0 .735-.02a3.75 3.75 0 0 0 3.344-3.344c.02-.193.02-.412.02-.735v-2.883c0-.813 0-1.469-.043-2-.045-.546-.14-1.026-.366-1.47a3.75 3.75 0 0 0-1.639-1.64 3.076 3.076 0 0 0-.702-.251v-.407a.75.75 0 0 0-1.5 0v.259c-.373-.009-.794-.009-1.268-.009h-1.964c-.474 0-.895 0-1.268.009v-.259Zm-1.521 1.995c.197-.1.458-.17.912-.207.462-.037 1.057-.038 1.909-.038h1.9c.853 0 1.447 0 1.91.038.453.037.714.107.912.207.423.216.767.56.983.984.1.197.17.458.207.912.014.18.024.38.029.609h-9.982c.006-.228.015-.429.03-.61.036-.453.106-.714.206-.911a2.25 2.25 0 0 1 .984-.984Zm-1.229 4.005v1.2c0 .853 0 1.447.038 1.91.037.453.107.714.207.912.216.423.56.767.984.983.197.1.458.17.912.207.462.037 1.057.038 1.909.038h3.306c.385 0 .52-.001.626-.012a2.25 2.25 0 0 0 2.006-2.006c.011-.106.012-.241.012-.626v-2.606h-10Z\"></path>",
  "CartIcon": "<path fill-rule=\"evenodd\" d=\"M2.5 3.75a.75.75 0 0 1 .75-.75h1.612a1.75 1.75 0 0 1 1.732 1.5h9.656a.75.75 0 0 1 .748.808l-.358 4.653a2.75 2.75 0 0 1-2.742 2.539h-6.351l.093.78a.25.25 0 0 0 .248.22h6.362a.75.75 0 0 1 0 1.5h-6.362a1.75 1.75 0 0 1-1.738-1.543l-1.04-8.737a.25.25 0 0 0-.248-.22h-1.612a.75.75 0 0 1-.75-.75Zm4.868 7.25h6.53a1.25 1.25 0 0 0 1.246-1.154l.296-3.846h-8.667l.595 5Z\"></path><path d=\"M10 17a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z\"></path><path d=\"M15 17a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z\"></path>",
  "CashDollarIcon": "<path d=\"M9.5 6.5a.75.75 0 0 1 1.5 0v.25h.75a.75.75 0 0 1 0 1.5h-2.25a.5.5 0 0 0 0 1h1a2 2 0 1 1 0 4v.25a.75.75 0 0 1-1.5 0v-.25h-.75a.75.75 0 0 1 0-1.5h2.25a.5.5 0 0 0 0-1h-1a2 2 0 1 1 0-4v-.25Z\"></path><path fill-rule=\"evenodd\" d=\"M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-1.5 0a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z\"></path>",
  "CheckCircleIcon": "<path d=\"M13.28 9.03a.75.75 0 0 0-1.06-1.06l-2.97 2.97-1.22-1.22a.75.75 0 0 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l3.5-3.5Z\"></path><path fill-rule=\"evenodd\" d=\"M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-1.5 0a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z\"></path>",
  "CheckIcon": "<path fill-rule=\"evenodd\" d=\"M15.78 5.97a.75.75 0 0 1 0 1.06l-6.5 6.5a.75.75 0 0 1-1.06 0l-3.25-3.25a.75.75 0 1 1 1.06-1.06l2.72 2.72 5.97-5.97a.75.75 0 0 1 1.06 0Z\"></path>",
  "ChevronDownIcon": "<path fill-rule=\"evenodd\" d=\"M5.72 8.47a.75.75 0 0 1 1.06 0l3.47 3.47 3.47-3.47a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 0-1.06Z\"></path>",
  "ChevronLeftIcon": "<path fill-rule=\"evenodd\" d=\"M11.764 5.204a.75.75 0 0 1 .032 1.06l-3.516 3.736 3.516 3.736a.75.75 0 1 1-1.092 1.028l-4-4.25a.75.75 0 0 1 0-1.028l4-4.25a.75.75 0 0 1 1.06-.032Z\"></path>",
  "ChevronRightIcon": "<path fill-rule=\"evenodd\" d=\"M7.72 14.53a.75.75 0 0 1 0-1.06l3.47-3.47-3.47-3.47a.75.75 0 0 1 1.06-1.06l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 0 1-1.06 0Z\"></path>",
  "ChevronUpIcon": "<path fill-rule=\"evenodd\" d=\"M14.53 12.28a.75.75 0 0 1-1.06 0l-3.47-3.47-3.47 3.47a.75.75 0 0 1-1.06-1.06l4-4a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1 0 1.06Z\"></path>",
  "ClockIcon": "<path d=\"M10.75 6a.75.75 0 0 0-1.5 0v4c0 .199.079.39.22.53l2 2a.75.75 0 1 0 1.06-1.06l-1.78-1.78v-3.69Z\"></path><path fill-rule=\"evenodd\" d=\"M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-1.5 0a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z\"></path>",
  "ContentIcon": "<path d=\"M12 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z\"></path><path fill-rule=\"evenodd\" d=\"M7.42 3.5h5.16c.535 0 .98 0 1.345.03.38.03.736.098 1.073.27a2.75 2.75 0 0 1 1.202 1.202c.172.337.24.693.27 1.073.03.365.03.81.03 1.345v1.91c0 .535 0 .98-.03 1.345-.03.38-.098.736-.27 1.073a2.751 2.751 0 0 1-1.201 1.202c-.338.172-.694.24-1.074.27-.365.03-.81.03-1.345.03h-5.16c-.535 0-.98 0-1.345-.03-.38-.03-.736-.098-1.073-.27a2.75 2.75 0 0 1-1.202-1.201c-.172-.338-.24-.694-.27-1.074-.03-.365-.03-.81-.03-1.345v-1.91c0-.535 0-.98.03-1.345.03-.38.098-.736.27-1.073a2.75 2.75 0 0 1 1.202-1.202c.337-.172.693-.24 1.073-.27.365-.03.81-.03 1.345-.03Zm-1.223 1.525c-.287.023-.424.065-.514.111a1.25 1.25 0 0 0-.547.547c-.046.09-.088.227-.111.514-.024.296-.025.68-.025 1.253v1.548l.908-1.073a1.75 1.75 0 0 1 2.68.01l2.412 2.894 1.086-1.304a1.75 1.75 0 0 1 2.778.116l.135.192.001-.533v-1.85c0-.572 0-.957-.025-1.253-.023-.287-.065-.424-.111-.514a1.25 1.25 0 0 0-.546-.547c-.091-.046-.228-.088-.515-.111-.296-.024-.68-.025-1.253-.025h-5.1c-.572 0-.957 0-1.253.025Zm-.514 6.589a1.25 1.25 0 0 1-.516-.49l1.886-2.23a.25.25 0 0 1 .383.001l2.38 2.855h-2.366c-.572 0-.957 0-1.253-.025-.287-.023-.424-.065-.514-.111Zm6.867.136h-.365l1.054-1.265a.25.25 0 0 1 .397.017l.751 1.073a1.274 1.274 0 0 1-.07.039c-.09.046-.227.088-.514.111-.296.024-.68.025-1.253.025Z\"></path><path d=\"M4 15.75a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75Z\"></path><path d=\"M12.75 15a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z\"></path>",
  "CreditCardIcon": "<path d=\"M6.25 11.25a.75.75 0 0 0 0 1.5h2.75a.75.75 0 0 0 0-1.5h-2.75Z\"></path><path fill-rule=\"evenodd\" d=\"M2.5 7.25a2.75 2.75 0 0 1 2.75-2.75h9.5a2.75 2.75 0 0 1 2.75 2.75v5.5a2.75 2.75 0 0 1-2.75 2.75h-9.5a2.75 2.75 0 0 1-2.75-2.75v-5.5Zm12.25-1.25c.69 0 1.25.56 1.25 1.25h-12c0-.69.56-1.25 1.25-1.25h9.5Zm1.25 3.25h-12v3.5c0 .69.56 1.25 1.25 1.25h9.5c.69 0 1.25-.56 1.25-1.25v-3.5Z\"></path>",
  "DeleteIcon": "<path d=\"M11.5 8.25a.75.75 0 0 1 .75.75v4.25a.75.75 0 0 1-1.5 0v-4.25a.75.75 0 0 1 .75-.75Z\"></path><path d=\"M9.25 9a.75.75 0 0 0-1.5 0v4.25a.75.75 0 0 0 1.5 0v-4.25Z\"></path><path fill-rule=\"evenodd\" d=\"M7.25 5.25a2.75 2.75 0 0 1 5.5 0h3a.75.75 0 0 1 0 1.5h-.75v5.45c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311c-.642.327-1.482.327-3.162.327h-.4c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311c-.327-.642-.327-1.482-.327-3.162v-5.45h-.75a.75.75 0 0 1 0-1.5h3Zm1.5 0a1.25 1.25 0 1 1 2.5 0h-2.5Zm-2.25 1.5h7v5.45c0 .865-.001 1.423-.036 1.848-.033.408-.09.559-.128.633a1.5 1.5 0 0 1-.655.655c-.074.038-.225.095-.633.128-.425.035-.983.036-1.848.036h-.4c-.865 0-1.423-.001-1.848-.036-.408-.033-.559-.09-.633-.128a1.5 1.5 0 0 1-.656-.655c-.037-.074-.094-.225-.127-.633-.035-.425-.036-.983-.036-1.848v-5.45Z\"></path>",
  "DiscountIcon": "<path d=\"M12.78 8.28a.75.75 0 0 0-1.06-1.06l-4.5 4.5a.75.75 0 1 0 1.06 1.06l4.5-4.5Z\"></path><path d=\"M9 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z\"></path><path d=\"M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z\"></path><path fill-rule=\"evenodd\" d=\"M12.094 3.514c-.822-1.79-3.366-1.79-4.188 0a.804.804 0 0 1-1.011.42c-1.848-.686-3.647 1.113-2.962 2.96a.804.804 0 0 1-.419 1.012c-1.79.822-1.79 3.366 0 4.188a.805.805 0 0 1 .42 1.011c-.686 1.848 1.113 3.647 2.96 2.962a.805.805 0 0 1 1.012.419c.822 1.79 3.366 1.79 4.188 0a.805.805 0 0 1 1.011-.42c1.848.686 3.647-1.113 2.962-2.96a.805.805 0 0 1 .419-1.012c1.79-.822 1.79-3.366 0-4.188a.805.805 0 0 1-.42-1.011c.686-1.848-1.113-3.647-2.96-2.962a.805.805 0 0 1-1.012-.419Zm-2.825.626a.804.804 0 0 1 1.462 0 2.304 2.304 0 0 0 2.896 1.2.804.804 0 0 1 1.034 1.034 2.304 2.304 0 0 0 1.199 2.895.804.804 0 0 1 0 1.462 2.304 2.304 0 0 0-1.2 2.896.805.805 0 0 1-1.034 1.034 2.304 2.304 0 0 0-2.895 1.199.804.804 0 0 1-1.462 0 2.304 2.304 0 0 0-2.896-1.2.804.804 0 0 1-1.033-1.034 2.305 2.305 0 0 0-1.2-2.895.804.804 0 0 1 0-1.462 2.304 2.304 0 0 0 1.2-2.896.804.804 0 0 1 1.033-1.033 2.304 2.304 0 0 0 2.896-1.2Z\"></path>",
  "DuplicateIcon": "<path d=\"M11.25 8.5c-.414 0-.75.336-.75.75v1.25h-1.25c-.414 0-.75.336-.75.75s.336.75.75.75h1.25v1.25c0 .414.336.75.75.75s.75-.336.75-.75v-1.25h1.25c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-1.25v-1.25c0-.414-.336-.75-.75-.75Z\"></path><path fill-rule=\"evenodd\" d=\"M8.75 16.5c-1.438 0-2.618-1.104-2.74-2.51-1.406-.122-2.51-1.302-2.51-2.74v-5c0-1.519 1.231-2.75 2.75-2.75h5c1.438 0 2.618 1.104 2.74 2.51 1.406.122 2.51 1.302 2.51 2.74v5c0 1.519-1.231 2.75-2.75 2.75h-5Zm0-10.5c-1.519 0-2.75 1.231-2.75 2.75v3.725c-.57-.116-1-.62-1-1.225v-5c0-.69.56-1.25 1.25-1.25h5c.605 0 1.11.43 1.225 1h-3.725Zm0 1.5c-.69 0-1.25.56-1.25 1.25v5c0 .69.56 1.25 1.25 1.25h5c.69 0 1.25-.56 1.25-1.25v-5c0-.69-.56-1.25-1.25-1.25h-5Z\"></path>",
  "EditIcon": "<path fill-rule=\"evenodd\" d=\"M15.655 4.344a2.695 2.695 0 0 0-3.81 0l-.599.599-.009-.009-1.06 1.06.008.01-5.88 5.88a2.75 2.75 0 0 0-.805 1.944v1.922a.75.75 0 0 0 .75.75h1.922a2.75 2.75 0 0 0 1.944-.806l7.54-7.539a2.695 2.695 0 0 0 0-3.81Zm-4.409 2.72-5.88 5.88a1.25 1.25 0 0 0-.366.884v1.172h1.172c.331 0 .65-.132.883-.366l5.88-5.88-1.689-1.69Zm2.75.629.599-.599a1.195 1.195 0 1 0-1.69-1.689l-.598.599 1.69 1.689Z\"></path>",
  "EmailIcon": "<path fill-rule=\"evenodd\" d=\"M5.75 4.5c-1.519 0-2.75 1.231-2.75 2.75v5.5c0 1.519 1.231 2.75 2.75 2.75h8.5c1.519 0 2.75-1.231 2.75-2.75v-5.5c0-1.519-1.231-2.75-2.75-2.75h-8.5Zm-1.25 2.75c0-.69.56-1.25 1.25-1.25h8.5c.69 0 1.25.56 1.25 1.25v5.5c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-5.5Zm2.067.32c-.375-.175-.821-.013-.997.363-.175.375-.013.821.363.997l3.538 1.651c.335.156.723.156 1.058 0l3.538-1.651c.376-.176.538-.622.363-.997-.175-.376-.622-.538-.997-.363l-3.433 1.602-3.433-1.602Z\"></path>",
  "ExportIcon": "<path d=\"M10.75 12.75a.75.75 0 0 1-1.5 0v-6.69l-1.72 1.72a.75.75 0 0 1-1.06-1.06l3-3a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1-1.06 1.06l-1.72-1.72v6.69Z\"></path><path d=\"M16.5 13.75a.75.75 0 0 0-1.5 0v.76a.75.75 0 0 1-.75.75h-8.5a.75.75 0 0 1-.75-.75v-.76a.75.75 0 0 0-1.5 0v.76a2.25 2.25 0 0 0 2.25 2.25h8.5a2.25 2.25 0 0 0 2.25-2.25v-.76Z\"></path>",
  "ExternalIcon": "<path d=\"M11.75 3.5a.75.75 0 0 0 0 1.5h2.19l-4.97 4.97a.75.75 0 1 0 1.06 1.06l4.97-4.97v2.19a.75.75 0 0 0 1.5 0v-4a.75.75 0 0 0-.75-.75h-4Z\"></path><path d=\"M15 10.967a.75.75 0 0 0-1.5 0v2.783c0 .69-.56 1.25-1.25 1.25h-6c-.69 0-1.25-.56-1.25-1.25v-6c0-.69.56-1.25 1.25-1.25h2.783a.75.75 0 0 0 0-1.5h-2.783a2.75 2.75 0 0 0-2.75 2.75v6a2.75 2.75 0 0 0 2.75 2.75h6a2.75 2.75 0 0 0 2.75-2.75v-2.783Z\"></path>",
  "FilterIcon": "<path d=\"M3 6a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5h-12.5a.75.75 0 0 1-.75-.75Z\"></path><path d=\"M6.75 14a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Z\"></path><path d=\"M5.5 9.25a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9Z\"></path>",
  "HomeIcon": "<path fill-rule=\"evenodd\" d=\"M8.344 3.692a2.25 2.25 0 0 1 3.312 0l3.854 4.19a3.75 3.75 0 0 1 .99 2.538v3.33a2.75 2.75 0 0 1-2.75 2.75h-1.75a1.5 1.5 0 0 1-1.5-1.5v-2h-1v2a1.5 1.5 0 0 1-1.5 1.5h-1.75a2.75 2.75 0 0 1-2.75-2.75v-3.33c0-.94.353-1.847.99-2.539l3.854-4.189Zm2.208 1.016a.75.75 0 0 0-1.104 0l-3.854 4.189a2.25 2.25 0 0 0-.594 1.523v3.33c0 .69.56 1.25 1.25 1.25h1.75v-2a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v2h1.75c.69 0 1.25-.56 1.25-1.25v-3.33a2.25 2.25 0 0 0-.594-1.523l-3.854-4.19Z\"></path>",
  "ImageIcon": "<path d=\"M12.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z\"></path><path fill-rule=\"evenodd\" d=\"M9.018 3.5h1.964c.813 0 1.469 0 2 .043.546.045 1.026.14 1.47.366a3.75 3.75 0 0 1 1.64 1.639c.226.444.32.924.365 1.47.043.531.043 1.187.043 2v1.964c0 .813 0 1.469-.043 2-.045.546-.14 1.026-.366 1.47a3.75 3.75 0 0 1-1.639 1.64c-.444.226-.924.32-1.47.365-.531.043-1.187.043-2 .043h-1.964c-.813 0-1.469 0-2-.043-.546-.045-1.026-.14-1.47-.366a3.75 3.75 0 0 1-1.64-1.639c-.226-.444-.32-.924-.365-1.47-.043-.531-.043-1.187-.043-2v-1.964c0-.813 0-1.469.043-2 .045-.546.14-1.026.366-1.47a3.75 3.75 0 0 1 1.639-1.64c.444-.226.924-.32 1.47-.365.531-.043 1.187-.043 2-.043Zm-1.877 1.538c-.454.037-.715.107-.912.207a2.25 2.25 0 0 0-.984.984c-.1.197-.17.458-.207.912-.037.462-.038 1.057-.038 1.909v1.428l.723-.867a1.75 1.75 0 0 1 2.582-.117l2.695 2.695 1.18-1.18a1.75 1.75 0 0 1 2.604.145l.216.27v-2.374c0-.852 0-1.447-.038-1.91-.037-.453-.107-.714-.207-.911a2.25 2.25 0 0 0-.984-.984c-.197-.1-.458-.17-.912-.207-.462-.037-1.056-.038-1.909-.038h-1.9c-.852 0-1.447 0-1.91.038Zm-2.103 7.821a7.12 7.12 0 0 1-.006-.08.746.746 0 0 0 .044-.049l1.8-2.159a.25.25 0 0 1 .368-.016l3.226 3.225a.75.75 0 0 0 1.06 0l1.71-1.71a.25.25 0 0 1 .372.021l1.213 1.516c-.021.06-.045.114-.07.165-.216.423-.56.767-.984.983-.197.1-.458.17-.912.207-.462.037-1.056.038-1.909.038h-1.9c-.852 0-1.447 0-1.91-.038-.453-.037-.714-.107-.911-.207a2.25 2.25 0 0 1-.984-.984c-.1-.197-.17-.458-.207-.912Z\"></path>",
  "ImportIcon": "<path d=\"M10.75 4.25a.75.75 0 0 0-1.5 0v6.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72v-6.69Z\"></path><path d=\"M16.5 13.75a.75.75 0 0 0-1.5 0v.8a.75.75 0 0 1-.75.75h-8.5a.75.75 0 0 1-.75-.75v-.8a.75.75 0 0 0-1.5 0v.8a2.25 2.25 0 0 0 2.25 2.25h8.5a2.25 2.25 0 0 0 2.25-2.25v-.8Z\"></path>",
  "InfoIcon": "<path d=\"M10 14a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-.75.75Z\"></path><path d=\"M9 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z\"></path><path fill-rule=\"evenodd\" d=\"M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-1.5 0a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z\"></path>",
  "MagicIcon": "<path d=\"M5.702 4.253a.625.625 0 0 1 1.096 0l.196.358c.207.378.517.688.895.895l.358.196a.625.625 0 0 1 0 1.097l-.358.196a2.25 2.25 0 0 0-.895.894l-.196.359a.625.625 0 0 1-1.096 0l-.196-.359a2.25 2.25 0 0 0-.895-.894l-.358-.196a.625.625 0 0 1 0-1.097l.358-.196a2.25 2.25 0 0 0 .895-.895l.196-.358Z\"></path><path fill-rule=\"evenodd\" d=\"M12.948 7.89c-.18-1.167-1.852-1.19-2.064-.029l-.03.164a3.756 3.756 0 0 1-3.088 3.031c-1.15.189-1.173 1.833-.03 2.054l.105.02a3.824 3.824 0 0 1 3.029 3.029l.032.165c.233 1.208 1.963 1.208 2.196 0l.025-.129a3.836 3.836 0 0 1 3.077-3.045c1.184-.216 1.12-1.928-.071-2.107a3.789 3.789 0 0 1-3.18-3.154Zm-.944 6.887a5.34 5.34 0 0 1 2.542-2.647 5.305 5.305 0 0 1-2.628-2.548 5.262 5.262 0 0 1-2.488 2.508 5.329 5.329 0 0 1 2.574 2.687Z\"></path>",
  "MenuHorizontalIcon": "<path d=\"M6 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z\"></path><path d=\"M11.5 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z\"></path><path d=\"M17 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z\"></path>",
  "MenuIcon": "<path fill-rule=\"evenodd\" d=\"M3 4.75a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5h-12.5a.75.75 0 0 1-.75-.75Z\"></path><path fill-rule=\"evenodd\" d=\"M3 10a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5h-12.5a.75.75 0 0 1-.75-.75Z\"></path><path fill-rule=\"evenodd\" d=\"M3 15.25a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5h-12.5a.75.75 0 0 1-.75-.75Z\"></path>",
  "MinusIcon": "<path fill-rule=\"evenodd\" d=\"M5 10c0-.414.336-.75.75-.75h8.5c.414 0 .75.336.75.75s-.336.75-.75.75h-8.5c-.414 0-.75-.336-.75-.75Z\"></path>",
  "NotificationIcon": "<path fill-rule=\"evenodd\" d=\"m7.252 14.424-2.446-.281c-1.855-.213-2.38-2.659-.778-3.616l.065-.038a2.887 2.887 0 0 0 1.407-2.48v-.509a4.5 4.5 0 0 1 9 0v.51c0 1.016.535 1.958 1.408 2.479l.065.038c1.602.957 1.076 3.403-.778 3.616l-2.543.292v.365a2.7 2.7 0 0 1-5.4 0v-.376Zm3.9.076h-2.4v.3a1.2 1.2 0 0 0 2.4 0v-.3Zm-3.152-1.5h4l3.024-.348a.452.452 0 0 0 .18-.837l-.065-.038a4.414 4.414 0 0 1-.747-.562 4.387 4.387 0 0 1-1.392-3.205v-.51a3 3 0 0 0-6 0v.51a4.387 4.387 0 0 1-2.138 3.767l-.065.038a.452.452 0 0 0 .18.838l3.023.347Z\"></path>",
  "OrderIcon": "<path fill-rule=\"evenodd\" d=\"M6.976 3.5a2.75 2.75 0 0 0-2.72 2.347l-.662 4.46a8.75 8.75 0 0 0-.094 1.282v1.661a3.25 3.25 0 0 0 3.25 3.25h6.5a3.25 3.25 0 0 0 3.25-3.25v-1.66c0-.43-.032-.858-.095-1.283l-.66-4.46a2.75 2.75 0 0 0-2.72-2.347h-6.05Zm-1.237 2.567a1.25 1.25 0 0 1 1.237-1.067h6.048c.62 0 1.146.454 1.237 1.067l.583 3.933h-2.484a1.25 1.25 0 0 0-1.185.855l-.159.474a.25.25 0 0 1-.237.171h-1.558a.25.25 0 0 1-.237-.17l-.159-.475a1.25 1.25 0 0 0-1.185-.855h-2.484l.583-3.933Zm-.738 5.433-.001.09v1.66c0 .966.784 1.75 1.75 1.75h6.5a1.75 1.75 0 0 0 1.75-1.75v-1.75h-2.46l-.1.303a1.75 1.75 0 0 1-1.66 1.197h-1.56a1.75 1.75 0 0 1-1.66-1.197l-.1-.303h-2.46Z\"></path>",
  "PersonFilledIcon": "<path d=\"M10 9.75a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z\"></path><path d=\"M10 11.5c-1.968 0-3.815.95-4.959 2.552l-.561.786a1.05 1.05 0 0 0 .855 1.662h9.33a1.05 1.05 0 0 0 .855-1.662l-.561-.786a6.094 6.094 0 0 0-4.959-2.552Z\"></path>",
  "PersonIcon": "<path fill-rule=\"evenodd\" d=\"M10 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-2 3.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z\"></path><path fill-rule=\"evenodd\" d=\"M15.484 14.227a6.274 6.274 0 0 0-10.968 0l-.437.786a1.338 1.338 0 0 0 1.17 1.987h9.502a1.338 1.338 0 0 0 1.17-1.987l-.437-.786Zm-9.657.728a4.773 4.773 0 0 1 8.346 0l.302.545h-8.95l.302-.545Z\"></path>",
  "PlusIcon": "<path d=\"M10.75 5.75c0-.414-.336-.75-.75-.75s-.75.336-.75.75v3.5h-3.5c-.414 0-.75.336-.75.75s.336.75.75.75h3.5v3.5c0 .414.336.75.75.75s.75-.336.75-.75v-3.5h3.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-3.5v-3.5Z\"></path>",
  "ProductIcon": "<path d=\"M13 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z\"></path><path fill-rule=\"evenodd\" d=\"M11.276 3.5a3.75 3.75 0 0 0-2.701 1.149l-4.254 4.417a2.75 2.75 0 0 0 .036 3.852l2.898 2.898a2.5 2.5 0 0 0 3.502.033l4.747-4.571a3.25 3.25 0 0 0 .996-2.341v-2.187a3.25 3.25 0 0 0-3.25-3.25h-1.974Zm-1.62 2.19a2.25 2.25 0 0 1 1.62-.69h1.974c.966 0 1.75.784 1.75 1.75v2.187c0 .475-.194.93-.536 1.26l-4.747 4.572a1 1 0 0 1-1.401-.014l-2.898-2.898a1.25 1.25 0 0 1-.016-1.75l4.253-4.418Z\"></path>",
  "SearchIcon": "<path fill-rule=\"evenodd\" d=\"M12.323 13.383a5.5 5.5 0 1 1 1.06-1.06l2.897 2.897a.75.75 0 1 1-1.06 1.06l-2.897-2.897Zm.677-4.383a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z\"></path>",
  "SettingsIcon": "<path fill-rule=\"evenodd\" d=\"M12.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-1.5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z\"></path><path fill-rule=\"evenodd\" d=\"M9.377 2.5c-.926 0-1.676.75-1.676 1.676v.688c0 .056-.043.17-.198.251-.153.08-.303.168-.448.262-.147.097-.268.076-.318.048l-.6-.346a1.676 1.676 0 0 0-2.29.613l-.622 1.08a1.676 1.676 0 0 0 .613 2.289l.648.374c.048.028.124.12.119.29a5.484 5.484 0 0 0 .005.465c.009.175-.07.27-.119.299l-.653.377a1.676 1.676 0 0 0-.613 2.29l.623 1.08a1.676 1.676 0 0 0 2.29.613l.7-.405c.048-.028.166-.048.312.043.115.071.233.139.353.202.155.08.198.195.198.251v.811c0 .926.75 1.676 1.676 1.676h1.246c.926 0 1.676-.75 1.676-1.676v-.81c0-.057.042-.171.197-.252.121-.063.239-.13.354-.202.146-.091.264-.07.312-.043l.7.405a1.676 1.676 0 0 0 2.29-.614l.623-1.08a1.676 1.676 0 0 0-.613-2.289l-.653-.377c-.05-.029-.128-.123-.119-.3a5.494 5.494 0 0 0 .005-.463c-.005-.171.07-.263.12-.291l.647-.374a1.676 1.676 0 0 0 .613-2.29l-.623-1.079a1.676 1.676 0 0 0-2.29-.613l-.6.346c-.049.028-.17.048-.318-.048a5.4 5.4 0 0 0-.448-.262c-.155-.081-.197-.195-.197-.251v-.688c0-.926-.75-1.676-1.676-1.676h-1.246Zm-.176 1.676c0-.097.078-.176.176-.176h1.246c.097 0 .176.079.176.176v.688c0 .728.462 1.298 1.003 1.58.11.058.219.122.323.19.517.337 1.25.458 1.888.09l.6-.346a.176.176 0 0 1 .24.064l.623 1.08a.176.176 0 0 1-.064.24l-.648.374c-.623.36-.888 1.034-.868 1.638a4.184 4.184 0 0 1-.004.337c-.032.615.23 1.31.867 1.677l.653.377a.176.176 0 0 1 .064.24l-.623 1.08a.176.176 0 0 1-.24.065l-.701-.405c-.624-.36-1.341-.251-1.855.069a3.91 3.91 0 0 1-.255.145c-.54.283-1.003.853-1.003 1.581v.811a.176.176 0 0 1-.176.176h-1.246a.176.176 0 0 1-.176-.176v-.81c0-.73-.462-1.3-1.003-1.582a3.873 3.873 0 0 1-.255-.146c-.514-.32-1.23-.428-1.855-.068l-.7.405a.176.176 0 0 1-.241-.065l-.623-1.08a.176.176 0 0 1 .064-.24l.653-.377c.637-.368.899-1.062.867-1.677a3.97 3.97 0 0 1-.004-.337c.02-.604-.245-1.278-.868-1.638l-.648-.374a.176.176 0 0 1-.064-.24l.623-1.08a.176.176 0 0 1 .24-.064l.6.346c.638.368 1.37.247 1.888-.09a3.85 3.85 0 0 1 .323-.19c.54-.282 1.003-.852 1.003-1.58v-.688Z\"></path>",
  "SortIcon": "<path d=\"M7.75 6.06v7.69a.75.75 0 0 1-1.5 0v-7.69l-1.72 1.72a.75.75 0 0 1-1.06-1.06l3-3a.75.75 0 0 1 1.06 0l3 3a.75.75 0 1 1-1.06 1.06l-1.72-1.72Z\"></path><path d=\"M13.75 6.25a.75.75 0 0 0-1.5 0v7.69l-1.72-1.72a.75.75 0 1 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72v-7.69Z\"></path>",
  "StarFilledIcon": "<path d=\"M11.128 4.123c-.453-.95-1.803-.95-2.256 0l-1.39 2.912-3.199.421c-1.042.138-1.46 1.422-.697 2.146l2.34 2.222-.587 3.172c-.192 1.034.901 1.828 1.825 1.327l2.836-1.54 2.836 1.54c.924.501 2.017-.293 1.825-1.327l-.587-3.172 2.34-2.222c.762-.724.345-2.008-.697-2.146l-3.2-.421-1.389-2.912Z\"></path>",
  "StarIcon": "<path fill-rule=\"evenodd\" d=\"M8.872 4.123c.453-.95 1.803-.95 2.256 0l1.39 2.912 3.199.421c1.042.138 1.46 1.422.697 2.146l-2.34 2.222.587 3.172c.192 1.034-.901 1.828-1.825 1.327l-2.836-1.54-2.836 1.54c-.924.501-2.017-.293-1.825-1.327l.587-3.172-2.34-2.222c-.762-.724-.345-2.008.697-2.146l3.2-.421 1.389-2.912Zm1.128 1.119-1.222 2.561a1.25 1.25 0 0 1-.965.701l-2.814.371 2.058 1.954c.307.292.446.718.369 1.134l-.517 2.791 2.495-1.354a1.25 1.25 0 0 1 1.192 0l2.495 1.354-.517-2.79a1.25 1.25 0 0 1 .369-1.135l2.058-1.954-2.814-.37a1.25 1.25 0 0 1-.965-.702l-1.222-2.561Z\"></path>",
  "StoreIcon": "<path fill-rule=\"evenodd\" d=\"M13.257 3h-6.514a1.25 1.25 0 0 0-.983.478l-2.386 3.037a1.75 1.75 0 0 0-.374 1.08v.655a2.75 2.75 0 0 0 1.5 2.45v4.55c0 .966.784 1.75 1.75 1.75h7.5a1.75 1.75 0 0 0 1.75-1.75v-4.55a2.75 2.75 0 0 0 1.5-2.45v-.481c0-.504-.17-.994-.48-1.39l-2.28-2.901a1.25 1.25 0 0 0-.983-.478Zm-.257 12.5h.75a.25.25 0 0 0 .25-.25v-4.25a2.742 2.742 0 0 1-2-.863 2.742 2.742 0 0 1-2 .863 2.742 2.742 0 0 1-2-.863 2.742 2.742 0 0 1-2 .863v4.25c0 .138.112.25.25.25h3.75v-2.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2.5Zm-7-6h-.25c-.69 0-1.25-.56-1.25-1.25v-.654a.25.25 0 0 1 .053-.155l2.312-2.941h6.27l2.205 2.805a.75.75 0 0 1 .16.464v.481c0 .69-.56 1.25-1.25 1.25h-.25c-.69 0-1.25-.56-1.25-1.25v-.5a.75.75 0 0 0-1.5 0v.5a1.25 1.25 0 1 1-2.5 0v-.5a.75.75 0 0 0-1.5 0v.5c0 .69-.56 1.25-1.25 1.25Z\"></path>",
  "ViewIcon": "<path fill-rule=\"evenodd\" d=\"M13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-1.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z\"></path><path fill-rule=\"evenodd\" d=\"M10 4c-2.476 0-4.348 1.23-5.577 2.532a9.266 9.266 0 0 0-1.4 1.922 5.98 5.98 0 0 0-.37.818c-.082.227-.153.488-.153.728s.071.501.152.728c.088.246.213.524.371.818.317.587.784 1.27 1.4 1.922 1.229 1.302 3.1 2.532 5.577 2.532 2.476 0 4.348-1.23 5.577-2.532a9.265 9.265 0 0 0 1.4-1.922 5.98 5.98 0 0 0 .37-.818c.082-.227.153-.488.153-.728s-.071-.501-.152-.728a5.984 5.984 0 0 0-.371-.818 9.269 9.269 0 0 0-1.4-1.922c-1.229-1.302-3.1-2.532-5.577-2.532Zm-5.999 6.002v-.004c.004-.02.017-.09.064-.223a4.5 4.5 0 0 1 .278-.608 7.768 7.768 0 0 1 1.17-1.605c1.042-1.104 2.545-2.062 4.487-2.062 1.942 0 3.445.958 4.486 2.062a7.77 7.77 0 0 1 1.17 1.605c.13.24.221.447.279.608.047.132.06.203.064.223v.004c-.004.02-.017.09-.064.223a4.503 4.503 0 0 1-.278.608 7.768 7.768 0 0 1-1.17 1.605c-1.042 1.104-2.545 2.062-4.487 2.062-1.942 0-3.445-.958-4.486-2.062a7.766 7.766 0 0 1-1.17-1.605 4.5 4.5 0 0 1-.279-.608c-.047-.132-.06-.203-.064-.223Z\"></path>",
  "XCircleIcon": "<path d=\"M13.03 6.97a.75.75 0 0 1 0 1.06l-1.97 1.97 1.97 1.97a.75.75 0 1 1-1.06 1.06l-1.97-1.97-1.97 1.97a.75.75 0 0 1-1.06-1.06l1.97-1.97-1.97-1.97a.75.75 0 0 1 1.06-1.06l1.97 1.97 1.97-1.97a.75.75 0 0 1 1.06 0Z\"></path><path fill-rule=\"evenodd\" d=\"M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm0-1.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z\"></path>",
  "XIcon": "<path d=\"M13.97 15.03a.75.75 0 1 0 1.06-1.06l-3.97-3.97 3.97-3.97a.75.75 0 0 0-1.06-1.06l-3.97 3.97-3.97-3.97a.75.75 0 0 0-1.06 1.06l3.97 3.97-3.97 3.97a.75.75 0 1 0 1.06 1.06l3.97-3.97 3.97 3.97Z\"></path>"
};
const iconNames = Object.keys(ICONS);
const TONE_FILL = {
  base: 'var(--p-color-icon)',
  subdued: 'var(--p-color-icon-secondary)',
  inverse: 'var(--p-color-icon-inverse)',
  brand: 'var(--p-color-icon-brand)',
  info: 'var(--p-color-icon-info)',
  success: 'var(--p-color-icon-success)',
  caution: 'var(--p-color-icon-caution)',
  warning: 'var(--p-color-icon-warning)',
  critical: 'var(--p-color-icon-critical)',
  magic: 'var(--p-color-icon-magic)'
};
function Icon({
  source,
  tone,
  color,
  size = 20,
  decorative = true,
  label,
  style,
  ...rest
}) {
  // Accept "HomeIcon" or "Home"
  const key = ICONS[source] != null ? source : ICONS[source + 'Icon'] != null ? source + 'Icon' : null;
  const fill = color || (tone ? TONE_FILL[tone] : 'currentColor');
  if (!key) {
    if (typeof console !== 'undefined') console.warn('Icon: unknown source "' + source + '"');
    return null;
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    role: decorative ? 'presentation' : 'img',
    "aria-hidden": decorative ? true : undefined,
    "aria-label": decorative ? undefined : label,
    style: {
      display: 'inline-flex',
      width: size,
      height: size,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 20 20",
    width: size,
    height: size,
    fill: fill,
    focusable: "false",
    dangerouslySetInnerHTML: {
      __html: ICONS[key]
    }
  }));
}
Object.assign(__ds_scope, { iconNames, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Icon.jsx", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Inject the Button stylesheet once. Plain CSS over tokens — needed for
// :hover / :active / :focus-visible, which inline styles can't express.
const STYLE_ID = 'pds-button-styles';
const CSS = `
.PButton {
  all: unset;
  box-sizing: border-box;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--p-space-100);
  font-family: var(--p-font-family-sans);
  font-size: var(--p-font-size-325);
  font-weight: var(--p-font-weight-medium);
  line-height: var(--p-font-line-height-500);
  border-radius: var(--p-border-radius-200);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--p-motion-duration-100) var(--p-motion-ease);
}
.PButton svg { fill: currentColor; }
.PButton__content { display: inline-flex; align-items: center; gap: var(--p-space-100); }
.PButton:active:not(.PButton--plain) .PButton__content { transform: translate3d(0, 1px, 0); }
.PButton:focus-visible {
  outline: var(--p-border-width-050) solid var(--p-color-border-focus);
  outline-offset: var(--p-space-025);
}
.PButton[disabled] { cursor: default; pointer-events: none; }

/* Sizes */
.PButton--micro  { padding: var(--p-space-100) var(--p-space-200); min-height: 28px; font-size: var(--p-font-size-300); }
.PButton--slim   { padding: var(--p-space-150) var(--p-space-300); min-height: 28px; }
.PButton--medium { padding: var(--p-space-150) var(--p-space-300); min-height: 32px; }
.PButton--large  { padding: var(--p-space-150) var(--p-space-400); min-height: 40px; font-size: var(--p-font-size-350); }
.PButton--fullWidth { width: 100%; }
.PButton--iconOnly { padding: var(--p-space-150); min-width: 32px; }
.PButton--iconOnly.PButton--large { padding: var(--p-space-200); min-width: 40px; }
.PButton--iconOnly.PButton--slim, .PButton--iconOnly.PButton--micro { padding: var(--p-space-100); min-width: 28px; }

/* Primary (dark) */
.PButton--primary {
  background: var(--p-color-button-gradient-bg-fill), var(--p-color-bg-fill-brand);
  color: var(--p-color-text-brand-on-bg-fill);
  box-shadow: var(--p-shadow-button-primary);
}
.PButton--primary:hover { background: var(--p-color-button-gradient-bg-fill), var(--p-color-bg-fill-brand-hover); }
.PButton--primary:active { box-shadow: var(--p-shadow-button-primary-inset); }
.PButton--primary.PButton--critical {
  background: var(--p-color-bg-fill-critical);
  box-shadow: var(--p-shadow-button-primary-critical);
  color: var(--p-color-text-critical-on-bg-fill);
}
.PButton--primary.PButton--critical:hover { background: var(--p-color-bg-fill-critical-hover); }
.PButton--primary.PButton--critical:active { box-shadow: var(--p-shadow-button-primary-critical-inset); }
.PButton--primary.PButton--success {
  background: var(--p-color-bg-fill-success);
  box-shadow: var(--p-shadow-button-primary-success);
  color: var(--p-color-text-success-on-bg-fill);
}
.PButton--primary.PButton--success:hover { background: var(--p-color-bg-fill-success-hover); }

/* Secondary (white, beveled) */
.PButton--secondary {
  background: var(--p-color-bg-fill);
  color: var(--p-color-text);
  box-shadow: var(--p-shadow-button);
}
.PButton--secondary:hover { background: var(--p-color-bg-fill-hover); box-shadow: var(--p-shadow-button-hover); }
.PButton--secondary:active { background: var(--p-color-bg-fill-active); box-shadow: var(--p-shadow-button-inset); }
.PButton--secondary.PButton--critical { color: var(--p-color-text-critical); }
.PButton--secondary.PButton--success { color: var(--p-color-text-success); }

/* Tertiary (transparent) */
.PButton--tertiary { background: transparent; color: var(--p-color-text); }
.PButton--tertiary:hover { background: var(--p-color-bg-fill-transparent-hover); }
.PButton--tertiary:active { background: var(--p-color-bg-fill-transparent-active); }
.PButton--tertiary.PButton--critical { color: var(--p-color-text-critical); }

/* Plain (link) */
.PButton--plain { background: transparent; color: var(--p-color-text-link); padding-left: 0; padding-right: 0; min-height: 0; }
.PButton--plain:hover { color: var(--p-color-text-link-hover); text-decoration: underline; }
.PButton--plain.PButton--critical { color: var(--p-color-text-critical); }

/* Disabled */
.PButton--primary[disabled] { background: var(--p-color-bg-fill-brand-disabled); box-shadow: none; color: var(--p-color-text-brand-on-bg-fill-disabled); }
.PButton--secondary[disabled], .PButton--tertiary[disabled] { background: var(--p-color-bg-fill-disabled); box-shadow: none; color: var(--p-color-text-disabled); }
.PButton--plain[disabled] { color: var(--p-color-text-disabled); }
`;
function useButtonStyles() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById(STYLE_ID)) {
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }
}

/** The primary action component. Primary (dark) for the page's single key action; secondary for the rest. */
function Button({
  children,
  variant = 'secondary',
  tone,
  size = 'medium',
  icon,
  disclosure,
  fullWidth,
  disabled,
  onClick,
  ...rest
}) {
  useButtonStyles();
  const iconOnly = icon && !children;
  const classes = ['PButton', `PButton--${variant}`, `PButton--${size}`, tone ? `PButton--${tone}` : '', fullWidth ? 'PButton--fullWidth' : '', iconOnly ? 'PButton--iconOnly' : ''].filter(Boolean).join(' ');
  const iconSize = size === 'large' ? 20 : 18;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: classes,
    disabled: disabled,
    onClick: onClick
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "PButton__content"
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    source: icon,
    size: iconSize
  }), children && /*#__PURE__*/React.createElement("span", null, children), disclosure && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    source: disclosure === 'up' ? 'ChevronUpIcon' : 'ChevronDownIcon',
    size: 16
  })));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/display/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** A small labelled token, used for filters and applied facets. Optionally removable. */
function Tag({
  children,
  onRemove,
  disabled,
  style,
  ...rest
}) {
  const css = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--p-space-100)',
    minHeight: 'var(--p-space-600)',
    padding: onRemove ? 'var(--p-space-050) var(--p-space-100) var(--p-space-050) var(--p-space-200)' : 'var(--p-space-050) var(--p-space-200)',
    background: 'var(--p-color-bg-surface-secondary)',
    color: disabled ? 'var(--p-color-text-disabled)' : 'var(--p-color-text)',
    borderRadius: 'var(--p-border-radius-200)',
    fontFamily: 'var(--p-font-family-sans)',
    fontSize: 'var(--p-font-size-325)',
    lineHeight: 'var(--p-font-line-height-500)',
    ...style
  };
  const removeCss = {
    all: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--p-space-500)',
    height: 'var(--p-space-500)',
    cursor: 'pointer',
    borderRadius: 'var(--p-border-radius-100)',
    color: 'var(--p-color-icon-secondary)'
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: css
  }, rest), /*#__PURE__*/React.createElement("span", null, children), onRemove && !disabled && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Remove",
    style: removeCss,
    onClick: onRemove
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    source: "XIcon",
    size: 16,
    tone: "subdued"
  })));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/display/Text.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const VARIANT = {
  'heading-3xl': {
    fontSize: 'var(--p-font-size-900)',
    lineHeight: 'var(--p-font-line-height-1200)',
    fontWeight: 'var(--p-font-weight-bold)',
    letterSpacing: 'var(--p-font-letter-spacing-densest)'
  },
  'heading-2xl': {
    fontSize: 'var(--p-font-size-750)',
    lineHeight: 'var(--p-font-line-height-1000)',
    fontWeight: 'var(--p-font-weight-bold)',
    letterSpacing: 'var(--p-font-letter-spacing-denser)'
  },
  'heading-xl': {
    fontSize: 'var(--p-font-size-600)',
    lineHeight: 'var(--p-font-line-height-800)',
    fontWeight: 'var(--p-font-weight-bold)',
    letterSpacing: 'var(--p-font-letter-spacing-dense)'
  },
  'heading-lg': {
    fontSize: 'var(--p-font-size-500)',
    lineHeight: 'var(--p-font-line-height-600)',
    fontWeight: 'var(--p-font-weight-semibold)',
    letterSpacing: 'var(--p-font-letter-spacing-dense)'
  },
  'heading-md': {
    fontSize: 'var(--p-font-size-350)',
    lineHeight: 'var(--p-font-line-height-500)',
    fontWeight: 'var(--p-font-weight-semibold)'
  },
  'heading-sm': {
    fontSize: 'var(--p-font-size-325)',
    lineHeight: 'var(--p-font-line-height-500)',
    fontWeight: 'var(--p-font-weight-semibold)'
  },
  'heading-xs': {
    fontSize: 'var(--p-font-size-300)',
    lineHeight: 'var(--p-font-line-height-400)',
    fontWeight: 'var(--p-font-weight-semibold)'
  },
  'body-lg': {
    fontSize: 'var(--p-font-size-350)',
    lineHeight: 'var(--p-font-line-height-500)',
    fontWeight: 'var(--p-font-weight-regular)'
  },
  'body-md': {
    fontSize: 'var(--p-font-size-325)',
    lineHeight: 'var(--p-font-line-height-500)',
    fontWeight: 'var(--p-font-weight-regular)'
  },
  'body-sm': {
    fontSize: 'var(--p-font-size-300)',
    lineHeight: 'var(--p-font-line-height-400)',
    fontWeight: 'var(--p-font-weight-regular)'
  },
  'body-xs': {
    fontSize: 'var(--p-font-size-275)',
    lineHeight: 'var(--p-font-line-height-300)',
    fontWeight: 'var(--p-font-weight-regular)'
  }
};
const TONE = {
  base: 'var(--p-color-text)',
  subdued: 'var(--p-color-text-secondary)',
  disabled: 'var(--p-color-text-disabled)',
  inverse: 'var(--p-color-text-inverse)',
  success: 'var(--p-color-text-success)',
  critical: 'var(--p-color-text-critical)',
  caution: 'var(--p-color-text-caution)',
  warning: 'var(--p-color-text-warning)',
  magic: 'var(--p-color-text-magic)',
  'text-inverse-secondary': 'var(--p-color-text-inverse-secondary)'
};
const WEIGHT = {
  regular: 'var(--p-font-weight-regular)',
  medium: 'var(--p-font-weight-medium)',
  semibold: 'var(--p-font-weight-semibold)',
  bold: 'var(--p-font-weight-bold)'
};
const DEFAULT_TAG = {
  'heading-3xl': 'h1',
  'heading-2xl': 'h1',
  'heading-xl': 'h2',
  'heading-lg': 'h3',
  'heading-md': 'h4',
  'heading-sm': 'h5',
  'heading-xs': 'h6',
  'body-lg': 'p',
  'body-md': 'p',
  'body-sm': 'p',
  'body-xs': 'p'
};

/** The single typographic primitive. Everything textual flows through here. */
function Text({
  variant = 'body-md',
  as,
  tone,
  fontWeight,
  alignment,
  truncate,
  numeric,
  textDecorationLine,
  children,
  style,
  ...rest
}) {
  const Tag = as || DEFAULT_TAG[variant] || 'span';
  const v = VARIANT[variant] || VARIANT['body-md'];
  const css = {
    margin: 0,
    fontFamily: numeric ? 'var(--p-font-family-mono)' : 'var(--p-font-family-sans)',
    fontSize: v.fontSize,
    lineHeight: v.lineHeight,
    fontWeight: fontWeight ? WEIGHT[fontWeight] : v.fontWeight,
    letterSpacing: v.letterSpacing || 'var(--p-font-letter-spacing-normal)',
    color: tone ? TONE[tone] : 'inherit',
    textAlign: alignment,
    textDecorationLine,
    fontVariantNumeric: numeric ? 'tabular-nums' : undefined,
    ...(truncate ? {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    } : null),
    ...style
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: css
  }, rest), children);
}
Object.assign(__ds_scope, { Text });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Text.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONE = {
  default: {
    bg: 'var(--p-color-bg-fill-transparent-secondary)',
    color: 'var(--p-color-text-secondary)'
  },
  info: {
    bg: 'var(--p-color-bg-fill-info-secondary)',
    color: 'var(--p-color-text-info)'
  },
  success: {
    bg: 'var(--p-color-bg-fill-success-secondary)',
    color: 'var(--p-color-text-success)'
  },
  attention: {
    bg: 'var(--p-color-bg-fill-caution-secondary)',
    color: 'var(--p-color-text-caution)'
  },
  warning: {
    bg: 'var(--p-color-bg-fill-warning-secondary)',
    color: 'var(--p-color-text-warning)'
  },
  critical: {
    bg: 'var(--p-color-bg-fill-critical-secondary)',
    color: 'var(--p-color-text-critical)'
  },
  magic: {
    bg: 'var(--p-color-bg-fill-magic-secondary)',
    color: 'var(--p-color-text-magic)'
  },
  'read-only': {
    bg: 'transparent',
    color: 'var(--p-color-text-secondary)'
  },
  new: {
    bg: 'var(--p-color-bg-fill-transparent-secondary)',
    color: 'var(--p-color-text-secondary)'
  }
};

// progress pip: a small status disc that fills as work completes
function Pip({
  progress,
  color
}) {
  const base = {
    width: 10,
    height: 10,
    borderRadius: '50%',
    boxShadow: `inset 0 0 0 1.5px ${color}`,
    flex: '0 0 10px'
  };
  if (progress === 'complete') return /*#__PURE__*/React.createElement("span", {
    style: {
      ...base,
      background: color
    }
  });
  if (progress === 'partiallyComplete') return /*#__PURE__*/React.createElement("span", {
    style: {
      ...base,
      background: `linear-gradient(90deg, ${color} 50%, transparent 50%)`
    }
  });
  return /*#__PURE__*/React.createElement("span", {
    style: base
  });
}

/** A small status label. Tone carries the meaning; an optional progress pip shows completion. */
function Badge({
  children,
  tone = 'default',
  progress,
  size = 'medium',
  icon,
  style,
  ...rest
}) {
  const t = TONE[tone] || TONE.default;
  const css = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--p-space-100)',
    padding: size === 'large' ? 'var(--p-space-100) var(--p-space-200)' : 'var(--p-space-050) var(--p-space-200)',
    background: t.bg,
    color: t.color,
    borderRadius: 'var(--p-border-radius-200)',
    fontFamily: 'var(--p-font-family-sans)',
    fontSize: 'var(--p-font-size-300)',
    fontWeight: tone === 'new' ? 'var(--p-font-weight-bold)' : 'var(--p-font-weight-medium)',
    lineHeight: 'var(--p-font-line-height-500)',
    whiteSpace: 'nowrap',
    ...style
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: css
  }, rest), progress && /*#__PURE__*/React.createElement(Pip, {
    progress: progress,
    color: t.color
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Banner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONE = {
  info: {
    bg: 'var(--p-color-bg-surface-info)',
    border: 'var(--p-color-border-info)',
    icon: 'InfoIcon',
    iconTone: 'info'
  },
  success: {
    bg: 'var(--p-color-bg-surface-success)',
    border: 'var(--p-color-border-success)',
    icon: 'CheckCircleIcon',
    iconTone: 'success'
  },
  warning: {
    bg: 'var(--p-color-bg-surface-warning)',
    border: 'var(--p-color-border-warning)',
    icon: 'AlertTriangleIcon',
    iconTone: 'warning'
  },
  critical: {
    bg: 'var(--p-color-bg-surface-critical)',
    border: 'var(--p-color-border-critical)',
    icon: 'AlertCircleIcon',
    iconTone: 'critical'
  }
};

/** A prominent in-context message about the state of the page or an action. */
function Banner({
  title,
  tone = 'info',
  children,
  action,
  onDismiss,
  style,
  ...rest
}) {
  const t = TONE[tone] || TONE.info;
  const css = {
    display: 'flex',
    gap: 'var(--p-space-200)',
    padding: 'var(--p-space-300) var(--p-space-400)',
    background: t.bg,
    borderRadius: 'var(--p-border-radius-300)',
    boxShadow: 'var(--p-shadow-border-inset)',
    ...style
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    role: tone === 'critical' || tone === 'warning' ? 'alert' : 'status',
    style: css
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: '0 0 auto',
      marginTop: 1
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    source: t.icon,
    tone: t.iconTone
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--p-space-100)'
    }
  }, title && /*#__PURE__*/React.createElement(__ds_scope.Text, {
    variant: "heading-sm"
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--p-color-text)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Text, {
    variant: "body-md"
  }, children)), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--p-space-100)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "slim",
    onClick: action.onAction
  }, action.content))), onDismiss && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: '0 0 auto',
      margin: 'calc(-1 * var(--p-space-100)) calc(-1 * var(--p-space-200)) 0 0'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "tertiary",
    size: "slim",
    icon: "XIcon",
    onClick: onDismiss,
    "aria-label": "Dismiss"
  })));
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Banner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Spinner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = 'pds-spinner-styles';
function useSpinnerStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = '@keyframes pds-spin { to { transform: rotate(360deg); } } .PSpinner { animation: pds-spin var(--p-motion-duration-500) var(--p-motion-linear) infinite; }';
  document.head.appendChild(el);
}

/** An indeterminate loading indicator. Use `large` for full-page, `small` inline. */
function Spinner({
  size = 'large',
  tone,
  color,
  style,
  ...rest
}) {
  useSpinnerStyles();
  const px = size === 'small' ? 20 : 44;
  const stroke = color || (tone === 'inverse' ? 'var(--p-color-text-inverse)' : 'var(--p-color-text)');
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "status",
    "aria-label": "Loading",
    style: {
      display: 'inline-flex',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    className: "PSpinner",
    viewBox: "0 0 44 44",
    width: px,
    height: px,
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "22",
    cy: "22",
    r: "18",
    stroke: stroke,
    strokeOpacity: "0.18",
    strokeWidth: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M22 4a18 18 0 0 1 18 18",
    stroke: stroke,
    strokeWidth: "4",
    strokeLinecap: "round"
  })));
}
Object.assign(__ds_scope, { Spinner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Spinner.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = 'pds-choice-styles';
const CSS = `
.PChoice { display: inline-flex; align-items: flex-start; gap: var(--p-space-200); cursor: pointer; }
.PChoice--disabled { cursor: not-allowed; opacity: 0.6; }
.PChoice__input { position: absolute; opacity: 0; width: 0; height: 0; }
.PChoice__box {
  flex: 0 0 auto; width: 18px; height: 18px; margin-top: 1px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--p-color-input-bg-surface);
  box-shadow: 0 0 0 var(--p-border-width-025) var(--p-color-input-border) inset, var(--p-shadow-inset-100);
  color: transparent;
  transition: background var(--p-motion-duration-100) var(--p-motion-ease);
}
.PChoice__box--checkbox { border-radius: var(--p-border-radius-100); }
.PChoice__box--radio { border-radius: var(--p-border-radius-full); }
.PChoice__input:focus-visible + .PChoice__box {
  outline: var(--p-border-width-050) solid var(--p-color-border-focus);
  outline-offset: var(--p-space-025);
}
.PChoice__input:checked + .PChoice__box {
  background: var(--p-color-bg-fill-brand);
  box-shadow: none;
  color: var(--p-color-text-brand-on-bg-fill);
}
.PChoice__dot { width: 8px; height: 8px; border-radius: var(--p-border-radius-full); background: currentColor; }
`;
function useStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

/** A single checkbox with label and optional help text. */
function Checkbox({
  label,
  checked,
  defaultChecked,
  disabled,
  helpText,
  id,
  onChange,
  ...rest
}) {
  useStyles();
  const fieldId = id || React.useId();
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: `PChoice${disabled ? ' PChoice--disabled' : ''}`,
    htmlFor: fieldId
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: "checkbox",
    className: "PChoice__input",
    checked: checked,
    defaultChecked: defaultChecked,
    disabled: disabled,
    onChange: onChange
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "PChoice__box PChoice__box--checkbox"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    source: "CheckIcon",
    size: 14,
    color: "currentColor"
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--p-space-050)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Text, {
    variant: "body-md",
    as: "span"
  }, label), helpText && /*#__PURE__*/React.createElement(__ds_scope.Text, {
    variant: "body-sm",
    tone: "subdued"
  }, helpText))));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/RadioButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = 'pds-choice-styles';
const CSS = `
.PChoice { display: inline-flex; align-items: flex-start; gap: var(--p-space-200); cursor: pointer; }
.PChoice--disabled { cursor: not-allowed; opacity: 0.6; }
.PChoice__input { position: absolute; opacity: 0; width: 0; height: 0; }
.PChoice__box {
  flex: 0 0 auto; width: 18px; height: 18px; margin-top: 1px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--p-color-input-bg-surface);
  box-shadow: 0 0 0 var(--p-border-width-025) var(--p-color-input-border) inset, var(--p-shadow-inset-100);
  color: transparent;
  transition: background var(--p-motion-duration-100) var(--p-motion-ease);
}
.PChoice__box--checkbox { border-radius: var(--p-border-radius-100); }
.PChoice__box--radio { border-radius: var(--p-border-radius-full); }
.PChoice__input:focus-visible + .PChoice__box {
  outline: var(--p-border-width-050) solid var(--p-color-border-focus);
  outline-offset: var(--p-space-025);
}
.PChoice__input:checked + .PChoice__box {
  background: var(--p-color-bg-fill-brand);
  box-shadow: none;
  color: var(--p-color-text-brand-on-bg-fill);
}
.PChoice__dot { width: 8px; height: 8px; border-radius: var(--p-border-radius-full); background: currentColor; }
`;
function useStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

/** A single radio button. Give a set of them the same `name` to make them exclusive. */
function RadioButton({
  label,
  name,
  value,
  checked,
  defaultChecked,
  disabled,
  helpText,
  id,
  onChange,
  ...rest
}) {
  useStyles();
  const fieldId = id || React.useId();
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: `PChoice${disabled ? ' PChoice--disabled' : ''}`,
    htmlFor: fieldId
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: "radio",
    name: name,
    value: value,
    className: "PChoice__input",
    checked: checked,
    defaultChecked: defaultChecked,
    disabled: disabled,
    onChange: onChange
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "PChoice__box PChoice__box--radio"
  }, /*#__PURE__*/React.createElement("span", {
    className: "PChoice__dot"
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--p-space-050)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Text, {
    variant: "body-md",
    as: "span"
  }, label), helpText && /*#__PURE__*/React.createElement(__ds_scope.Text, {
    variant: "body-sm",
    tone: "subdued"
  }, helpText))));
}
Object.assign(__ds_scope, { RadioButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/RadioButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = 'pds-select-styles';
const CSS = `
.PSelect {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--p-color-input-bg-surface);
  border-radius: var(--p-border-radius-200);
  box-shadow: 0 0 0 var(--p-border-width-025) var(--p-color-input-border) inset, var(--p-shadow-inset-100);
  min-height: 32px;
  transition: box-shadow var(--p-motion-duration-100) var(--p-motion-ease);
}
.PSelect:hover { box-shadow: 0 0 0 var(--p-border-width-025) var(--p-color-input-border-hover) inset, var(--p-shadow-inset-100); }
.PSelect:focus-within { box-shadow: 0 0 0 var(--p-border-width-050) var(--p-color-border-focus) inset; }
.PSelect--disabled { background: var(--p-color-bg-surface-disabled); }
.PSelect__el, .PSelect__el:focus {
  all: unset;
  flex: 1 1 auto;
  font-family: var(--p-font-family-sans);
  font-size: var(--p-font-size-350);
  line-height: var(--p-font-line-height-500);
  color: var(--p-color-text);
  padding: var(--p-space-150) var(--p-space-300);
  padding-right: var(--p-space-1000);
  cursor: pointer;
}
.PSelect__chevron { position: absolute; right: var(--p-space-300); pointer-events: none; display: inline-flex; }
`;
function useStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

/** A styled native select. Pass options as strings or {label, value} objects. */
function Select({
  label,
  options = [],
  value,
  defaultValue,
  disabled,
  id,
  onChange,
  helpText,
  ...rest
}) {
  useStyles();
  const fieldId = id || React.useId();
  const norm = options.map(o => typeof o === 'string' ? {
    label: o,
    value: o
  } : o);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--p-space-100)'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId
  }, /*#__PURE__*/React.createElement(__ds_scope.Text, {
    variant: "body-md",
    as: "span"
  }, label)), /*#__PURE__*/React.createElement("div", {
    className: `PSelect${disabled ? ' PSelect--disabled' : ''}`
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    className: "PSelect__el",
    value: value,
    defaultValue: defaultValue,
    disabled: disabled,
    onChange: onChange
  }, rest), norm.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement("span", {
    className: "PSelect__chevron"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    source: "ChevronDownIcon",
    size: 16,
    tone: "subdued"
  }))), helpText && /*#__PURE__*/React.createElement(__ds_scope.Text, {
    variant: "body-sm",
    tone: "subdued"
  }, helpText));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = 'pds-textfield-styles';
const CSS = `
.PField {
  display: flex;
  align-items: center;
  gap: var(--p-space-100);
  background: var(--p-color-input-bg-surface);
  border-radius: var(--p-border-radius-200);
  box-shadow: 0 0 0 var(--p-border-width-025) var(--p-color-input-border) inset, var(--p-shadow-inset-100);
  transition: box-shadow var(--p-motion-duration-100) var(--p-motion-ease);
  padding: 0 var(--p-space-300);
  min-height: 32px;
}
.PField:hover { box-shadow: 0 0 0 var(--p-border-width-025) var(--p-color-input-border-hover) inset, var(--p-shadow-inset-100); }
.PField--focused { box-shadow: 0 0 0 var(--p-border-width-050) var(--p-color-border-focus) inset; }
.PField--error { box-shadow: 0 0 0 var(--p-border-width-025) var(--p-color-border-critical-secondary) inset; }
.PField--error.PField--focused { box-shadow: 0 0 0 var(--p-border-width-050) var(--p-color-border-critical-secondary) inset; }
.PField--disabled { background: var(--p-color-bg-surface-disabled); box-shadow: 0 0 0 var(--p-border-width-025) var(--p-color-border-disabled) inset; cursor: not-allowed; }
.PField__input, .PField__input:focus {
  all: unset;
  flex: 1 1 auto;
  width: 100%;
  font-family: var(--p-font-family-sans);
  font-size: var(--p-font-size-350);
  line-height: var(--p-font-line-height-500);
  color: var(--p-color-text);
  padding: var(--p-space-150) 0;
  min-width: 0;
}
.PField__input::placeholder { color: var(--p-color-text-disabled); }
.PField__affix { color: var(--p-color-text-secondary); font-size: var(--p-font-size-350); flex: 0 0 auto; }
`;
function useStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

/** Single- or multi-line text input with label, prefix/suffix, error and help text. */
function TextField({
  label,
  value,
  defaultValue,
  placeholder,
  type = 'text',
  prefix,
  suffix,
  error,
  helpText,
  disabled,
  multiline,
  id,
  onChange,
  ...rest
}) {
  useStyles();
  const [focused, setFocused] = React.useState(false);
  const fieldId = id || React.useId();
  const cls = ['PField', focused ? 'PField--focused' : '', error ? 'PField--error' : '', disabled ? 'PField--disabled' : ''].filter(Boolean).join(' ');
  const InputTag = multiline ? 'textarea' : 'input';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--p-space-100)'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId
  }, /*#__PURE__*/React.createElement(__ds_scope.Text, {
    variant: "body-md",
    as: "span"
  }, label)), /*#__PURE__*/React.createElement("div", {
    className: cls
  }, prefix && /*#__PURE__*/React.createElement("span", {
    className: "PField__affix"
  }, prefix), /*#__PURE__*/React.createElement(InputTag, _extends({
    id: fieldId,
    className: "PField__input",
    type: multiline ? undefined : type,
    rows: multiline ? multiline === true ? 3 : multiline : undefined,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onChange: onChange,
    style: multiline ? {
      resize: 'vertical'
    } : undefined
  }, rest)), suffix && /*#__PURE__*/React.createElement("span", {
    className: "PField__affix"
  }, suffix)), error && typeof error === 'string' && /*#__PURE__*/React.createElement(__ds_scope.Text, {
    variant: "body-sm",
    tone: "critical"
  }, error), helpText && !error && /*#__PURE__*/React.createElement(__ds_scope.Text, {
    variant: "body-sm",
    tone: "subdued"
  }, helpText));
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/structure/BlockStack.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sp = t => t == null ? undefined : `var(--p-space-${t})`;

/** Vertical flex stack with token gap. The default layout primitive. */
function BlockStack({
  children,
  gap = '0',
  align,
  inlineAlign,
  as = 'div',
  style,
  ...rest
}) {
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: sp(gap),
      justifyContent: align,
      alignItems: inlineAlign,
      ...style
    }
  }, rest), children);
}

/** Horizontal flex stack with token gap, wraps by default. */
function InlineStack({
  children,
  gap = '0',
  align,
  blockAlign = 'center',
  wrap = true,
  as = 'div',
  style,
  ...rest
}) {
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      display: 'flex',
      flexDirection: 'row',
      gap: sp(gap),
      justifyContent: align,
      alignItems: blockAlign,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      ...style
    }
  }, rest), children);
}

/** A 1px hairline rule using the border token. */
function Divider({
  borderColor = 'border-secondary',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("hr", _extends({
    style: {
      margin: 0,
      border: 'none',
      borderTop: `var(--p-border-width-025) solid var(--p-color-${borderColor})`,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { BlockStack, InlineStack, Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/structure/BlockStack.jsx", error: String((e && e.message) || e) }); }

// components/structure/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SPACE = t => t == null ? undefined : `var(--p-space-${t})`;

/**
 * The fundamental surface. A white, softly-rounded container with a hairline
 * shadow that holds a single unit of content. The workhorse of the admin.
 */
function Card({
  children,
  padding = '400',
  background = 'bg-surface',
  roundedAbove,
  style,
  ...rest
}) {
  const css = {
    background: `var(--p-color-${background})`,
    borderRadius: 'var(--p-border-radius-300)',
    boxShadow: 'var(--p-shadow-100)',
    padding: SPACE(padding),
    outline: 'var(--p-border-width-025) solid transparent',
    ...style
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: css
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/structure/Card.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Common.jsx
try { (() => {
(function () {
  // Shared UI-kit helpers built on the design-system primitives.
  const {
    Text,
    Button,
    Badge,
    InlineStack,
    BlockStack,
    Card
  } = window.PolarisDesignSystem_1106df;

  // Map order statuses to Badge tone + progress.
  function paymentBadge(payment) {
    const map = {
      Paid: {
        tone: 'success'
      },
      Pending: {
        tone: 'attention'
      },
      Refunded: {
        tone: 'default'
      }
    };
    return /*#__PURE__*/React.createElement(Badge, map[payment] || {}, payment);
  }
  function fulfillmentBadge(f) {
    const map = {
      Fulfilled: {
        tone: 'success',
        progress: 'complete'
      },
      Unfulfilled: {
        tone: 'attention',
        progress: 'incomplete'
      },
      Partial: {
        tone: 'warning',
        progress: 'partiallyComplete'
      }
    };
    return /*#__PURE__*/React.createElement(Badge, map[f] || {}, f);
  }
  function statusBadge(status) {
    const map = {
      Active: {
        tone: 'success'
      },
      Draft: {
        tone: 'info'
      },
      Archived: {
        tone: 'default'
      }
    };
    return /*#__PURE__*/React.createElement(Badge, map[status] || {}, status);
  }

  // Page title row with optional actions.
  function PageHeader({
    title,
    subtitle,
    back,
    onBack,
    primaryAction,
    secondaryActions = []
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 'var(--p-space-500)'
      }
    }, back && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 'var(--p-space-200)'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "tertiary",
      size: "slim",
      icon: "ArrowLeftIcon",
      onClick: onBack
    }, back)), /*#__PURE__*/React.createElement(InlineStack, {
      align: "space-between",
      blockAlign: "center"
    }, /*#__PURE__*/React.createElement(BlockStack, {
      gap: "050"
    }, /*#__PURE__*/React.createElement(Text, {
      variant: "heading-xl"
    }, title), subtitle && /*#__PURE__*/React.createElement(Text, {
      variant: "body-md",
      tone: "subdued"
    }, subtitle)), /*#__PURE__*/React.createElement(InlineStack, {
      gap: "200"
    }, secondaryActions.map((a, i) => /*#__PURE__*/React.createElement(Button, {
      key: i,
      icon: a.icon,
      onClick: a.onAction
    }, a.content)), primaryAction && /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      icon: primaryAction.icon,
      onClick: primaryAction.onAction
    }, primaryAction.content))));
  }

  // A titled section card with an optional header action.
  function Section({
    title,
    action,
    children,
    padding = '400'
  }) {
    return /*#__PURE__*/React.createElement(Card, {
      padding: "0"
    }, title && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 'var(--p-space-400) var(--p-space-400) var(--p-space-300)'
      }
    }, /*#__PURE__*/React.createElement(InlineStack, {
      align: "space-between",
      blockAlign: "center"
    }, /*#__PURE__*/React.createElement(Text, {
      variant: "heading-md"
    }, title), action)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: title ? '0 var(--p-space-400) var(--p-space-400)' : `var(--p-space-${padding})`
      }
    }, children));
  }
  Object.assign(window, {
    paymentBadge,
    fulfillmentBadge,
    statusBadge,
    PageHeader,
    Section
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Common.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Frame.jsx
try { (() => {
(function () {
  // Admin shell: dark TopBar + light Navigation sidebar + content area.
  // Composes design-system primitives from window.PolarisDesignSystem_1106df.
  const {
    Icon,
    Badge,
    Avatar,
    Text
  } = window.PolarisDesignSystem_1106df;
  const FRAME_STYLE_ID = 'admin-frame-styles';
  const FRAME_CSS = `
.admin { display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: var(--p-color-bg); }
.admin__topbar {
  flex: 0 0 56px; display: flex; align-items: center; gap: var(--p-space-400);
  padding: 0 var(--p-space-400); background: var(--p-color-bg-inverse);
}
.admin__brand { display: flex; align-items: center; gap: var(--p-space-200); flex: 0 0 auto; min-width: 200px; }
.admin__brand-name { color: #fff; font-weight: var(--p-font-weight-semibold); font-size: var(--p-font-size-325); }
.admin__search {
  flex: 1 1 auto; max-width: 480px; margin: 0 auto; display: flex; align-items: center; gap: var(--p-space-200);
  height: 32px; padding: 0 var(--p-space-300); border-radius: var(--p-border-radius-200);
  background: var(--p-color-white-alpha-9); box-shadow: inset 0 0 0 1px var(--p-color-white-alpha-11);
}
.admin__search input { all: unset; flex: 1 1 auto; color: #fff; font-size: var(--p-font-size-325); }
.admin__search input::placeholder { color: var(--p-color-text-inverse-secondary); }
.admin__topbar-actions { flex: 0 0 auto; display: flex; align-items: center; gap: var(--p-space-200); min-width: 200px; justify-content: flex-end; }
.admin__icon-btn { all: unset; display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--p-border-radius-200); cursor: pointer; }
.admin__icon-btn:hover { background: var(--p-color-white-alpha-9); }

.admin__body { flex: 1 1 auto; display: flex; min-height: 0; }
.admin__nav { flex: 0 0 232px; background: var(--p-color-nav-bg); padding: var(--p-space-300) var(--p-space-200); overflow-y: auto; display: flex; flex-direction: column; gap: var(--p-space-050); }
.admin__nav-item {
  all: unset; box-sizing: border-box; display: flex; align-items: center; gap: var(--p-space-200);
  padding: var(--p-space-150) var(--p-space-200); border-radius: var(--p-border-radius-200);
  cursor: pointer; color: var(--p-color-text); font-size: var(--p-font-size-325); font-weight: var(--p-font-weight-medium);
}
.admin__nav-item:hover { background: var(--p-color-nav-bg-surface-hover); }
.admin__nav-item--active { background: var(--p-color-bg-surface); box-shadow: var(--p-shadow-100); }
.admin__nav-item--active:hover { background: var(--p-color-bg-surface); }
.admin__nav-item .grow { flex: 1 1 auto; }
.admin__nav-section { padding: var(--p-space-300) var(--p-space-200) var(--p-space-100); }

.admin__content { flex: 1 1 auto; overflow-y: auto; }
.admin__page { max-width: 998px; margin: 0 auto; padding: var(--p-space-600) var(--p-space-500) var(--p-space-2000); }
`;
  function useFrameStyles() {
    if (typeof document === 'undefined' || document.getElementById(FRAME_STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = FRAME_STYLE_ID;
    el.textContent = FRAME_CSS;
    document.head.appendChild(el);
  }
  function TopBar({
    shopName
  }) {
    return /*#__PURE__*/React.createElement("header", {
      className: "admin__topbar"
    }, /*#__PURE__*/React.createElement("div", {
      className: "admin__brand"
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/brand/shopify-logo.svg",
      height: "28",
      alt: "Shopify"
    }), /*#__PURE__*/React.createElement("span", {
      className: "admin__brand-name"
    }, shopName)), /*#__PURE__*/React.createElement("div", {
      className: "admin__search"
    }, /*#__PURE__*/React.createElement(Icon, {
      source: "SearchIcon",
      size: 16,
      color: "var(--p-color-text-inverse-secondary)"
    }), /*#__PURE__*/React.createElement("input", {
      placeholder: "Search",
      "aria-label": "Search"
    })), /*#__PURE__*/React.createElement("div", {
      className: "admin__topbar-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "admin__icon-btn",
      "aria-label": "Notifications"
    }, /*#__PURE__*/React.createElement(Icon, {
      source: "NotificationIcon",
      size: 20,
      color: "#fff"
    })), /*#__PURE__*/React.createElement(Avatar, {
      name: shopName,
      size: "sm",
      shape: "square"
    })));
  }
  function Navigation({
    items,
    current,
    onNavigate
  }) {
    return /*#__PURE__*/React.createElement("nav", {
      className: "admin__nav"
    }, items.map(it => {
      const active = it.key === current;
      return /*#__PURE__*/React.createElement("button", {
        key: it.key,
        className: `admin__nav-item${active ? ' admin__nav-item--active' : ''}`,
        onClick: () => onNavigate && onNavigate(it.key)
      }, /*#__PURE__*/React.createElement(Icon, {
        source: it.icon,
        size: 20,
        color: active ? 'var(--p-color-icon)' : 'var(--p-color-icon-secondary)'
      }), /*#__PURE__*/React.createElement("span", {
        className: "grow"
      }, it.label), it.badge && /*#__PURE__*/React.createElement(Badge, null, it.badge));
    }), /*#__PURE__*/React.createElement("div", {
      className: "admin__nav-section"
    }, /*#__PURE__*/React.createElement(Text, {
      variant: "body-sm",
      tone: "subdued",
      fontWeight: "medium"
    }, "Sales channels")), /*#__PURE__*/React.createElement("button", {
      className: "admin__nav-item"
    }, /*#__PURE__*/React.createElement(Icon, {
      source: "StoreIcon",
      size: 20,
      color: "var(--p-color-icon-secondary)"
    }), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }, "Online Store")), /*#__PURE__*/React.createElement("button", {
      className: "admin__nav-item"
    }, /*#__PURE__*/React.createElement(Icon, {
      source: "SettingsIcon",
      size: 20,
      color: "var(--p-color-icon-secondary)"
    }), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }, "Settings")));
  }
  function Frame({
    shopName,
    items,
    current,
    onNavigate,
    children
  }) {
    useFrameStyles();
    return /*#__PURE__*/React.createElement("div", {
      className: "admin"
    }, /*#__PURE__*/React.createElement(TopBar, {
      shopName: shopName
    }), /*#__PURE__*/React.createElement("div", {
      className: "admin__body"
    }, /*#__PURE__*/React.createElement(Navigation, {
      items: items,
      current: current,
      onNavigate: onNavigate
    }), /*#__PURE__*/React.createElement("div", {
      className: "admin__content"
    }, /*#__PURE__*/React.createElement("div", {
      className: "admin__page"
    }, children))));
  }
  Object.assign(window, {
    Frame,
    TopBar,
    Navigation
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Home.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
(function () {
  // Home / dashboard screen.
  const {
    Text: HText,
    Card: HCard,
    BlockStack: HBlock,
    InlineStack: HInline,
    Icon: HIcon,
    Button: HButton,
    Divider: HDivider
  } = window.PolarisDesignSystem_1106df;
  function StatCard({
    label,
    value,
    delta,
    up
  }) {
    return /*#__PURE__*/React.createElement(HCard, null, /*#__PURE__*/React.createElement(HBlock, {
      gap: "150"
    }, /*#__PURE__*/React.createElement(HText, {
      variant: "body-sm",
      tone: "subdued"
    }, label), /*#__PURE__*/React.createElement(HText, {
      variant: "heading-xl",
      numeric: true
    }, value), /*#__PURE__*/React.createElement(HInline, {
      gap: "050",
      blockAlign: "center"
    }, /*#__PURE__*/React.createElement(HIcon, {
      source: up ? 'ArrowUpIcon' : 'ArrowDownIcon',
      size: 14,
      color: up ? 'var(--p-color-icon-success)' : 'var(--p-color-icon-critical)'
    }), /*#__PURE__*/React.createElement(HText, {
      variant: "body-sm",
      tone: up ? 'success' : 'critical'
    }, delta), /*#__PURE__*/React.createElement(HText, {
      variant: "body-sm",
      tone: "subdued"
    }, "vs last week"))));
  }
  function Home({
    data,
    onOpenOrders
  }) {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
      title: `Good afternoon, ${data.shop.owner.split(' ')[0]}`,
      subtitle: "Here's what's happening with your store today.",
      primaryAction: {
        content: 'Add product',
        icon: 'PlusIcon'
      },
      secondaryActions: [{
        content: 'Export',
        icon: 'ExportIcon'
      }]
    }), /*#__PURE__*/React.createElement(HBlock, {
      gap: "500"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--p-space-400)'
      }
    }, data.metrics.map(m => /*#__PURE__*/React.createElement(StatCard, _extends({
      key: m.label
    }, m)))), /*#__PURE__*/React.createElement(Section, {
      title: "Recent orders",
      action: /*#__PURE__*/React.createElement(HButton, {
        variant: "plain",
        onClick: onOpenOrders
      }, "View all")
    }, /*#__PURE__*/React.createElement(HBlock, {
      gap: "0"
    }, data.orders.slice(0, 5).map((o, i) => /*#__PURE__*/React.createElement("div", {
      key: o.id
    }, i > 0 && /*#__PURE__*/React.createElement(HDivider, null), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 'var(--p-space-300) 0'
      }
    }, /*#__PURE__*/React.createElement(HInline, {
      align: "space-between",
      blockAlign: "center"
    }, /*#__PURE__*/React.createElement(HInline, {
      gap: "300",
      blockAlign: "center"
    }, /*#__PURE__*/React.createElement(HText, {
      variant: "body-md",
      fontWeight: "semibold"
    }, o.id), /*#__PURE__*/React.createElement(HText, {
      variant: "body-md",
      tone: "subdued"
    }, o.customer)), /*#__PURE__*/React.createElement(HInline, {
      gap: "400",
      blockAlign: "center"
    }, fulfillmentBadge(o.fulfillment), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 84,
        textAlign: 'right'
      }
    }, /*#__PURE__*/React.createElement(HText, {
      variant: "body-md",
      numeric: true,
      fontWeight: "medium"
    }, o.total)))))))))));
  }
  Object.assign(window, {
    Home
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/OrderDetail.jsx
try { (() => {
(function () {
  // Order detail screen — two-column summary.
  const {
    Text: DText,
    Card: DCard,
    BlockStack: DBlock,
    InlineStack: DInline,
    Button: DButton,
    Badge: DBadge,
    Banner: DBanner,
    Avatar: DAvatar,
    Divider: DDivider,
    Icon: DIcon
  } = window.PolarisDesignSystem_1106df;
  function LineItem({
    line
  }) {
    return /*#__PURE__*/React.createElement(DInline, {
      gap: "300",
      blockAlign: "center"
    }, /*#__PURE__*/React.createElement(DAvatar, {
      name: line.title,
      initials: line.initials,
      shape: "square",
      size: "lg"
    }), /*#__PURE__*/React.createElement(DBlock, {
      gap: "025"
    }, /*#__PURE__*/React.createElement(DText, {
      variant: "body-md",
      fontWeight: "medium"
    }, line.title), /*#__PURE__*/React.createElement(DText, {
      variant: "body-sm",
      tone: "subdued"
    }, line.variant)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(DText, {
      variant: "body-md",
      tone: "subdued",
      as: "span"
    }, line.price, " \xD7 ", line.qty), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 84,
        textAlign: 'right'
      }
    }, /*#__PURE__*/React.createElement(DText, {
      variant: "body-md",
      numeric: true,
      fontWeight: "medium",
      as: "span"
    }, line.price)));
  }
  function SummaryRow({
    label,
    value,
    strong
  }) {
    return /*#__PURE__*/React.createElement(DInline, {
      align: "space-between"
    }, /*#__PURE__*/React.createElement(DText, {
      variant: "body-md",
      tone: strong ? 'base' : 'subdued',
      fontWeight: strong ? 'semibold' : 'regular'
    }, label), /*#__PURE__*/React.createElement(DText, {
      variant: "body-md",
      numeric: true,
      fontWeight: strong ? 'semibold' : 'regular'
    }, value));
  }
  function OrderDetail({
    data,
    order,
    onBack
  }) {
    const o = order || data.orders[0];
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
      back: "Orders",
      onBack: onBack,
      title: o.id,
      secondaryActions: [{
        content: 'Refund',
        icon: 'CashDollarIcon'
      }, {
        content: 'Edit'
      }]
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 'calc(-1 * var(--p-space-300))',
        marginBottom: 'var(--p-space-500)'
      }
    }, /*#__PURE__*/React.createElement(DInline, {
      gap: "200",
      blockAlign: "center"
    }, /*#__PURE__*/React.createElement(DText, {
      variant: "body-md",
      tone: "subdued"
    }, o.date), paymentBadge(o.payment), fulfillmentBadge(o.fulfillment))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 320px',
        gap: 'var(--p-space-500)',
        alignItems: 'start'
      }
    }, /*#__PURE__*/React.createElement(DBlock, {
      gap: "400"
    }, o.fulfillment !== 'Fulfilled' && /*#__PURE__*/React.createElement(DBanner, {
      tone: "attention",
      title: "Unfulfilled",
      action: {
        content: 'Fulfill items'
      }
    }, data.orderLines.length, " item", data.orderLines.length > 1 ? 's' : '', " are ready to be fulfilled."), /*#__PURE__*/React.createElement(Section, {
      title: "Items"
    }, /*#__PURE__*/React.createElement(DBlock, {
      gap: "300"
    }, data.orderLines.map((l, i) => /*#__PURE__*/React.createElement("div", {
      key: i
    }, i > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 'var(--p-space-300)'
      }
    }, /*#__PURE__*/React.createElement(DDivider, null)), /*#__PURE__*/React.createElement(LineItem, {
      line: l
    }))))), /*#__PURE__*/React.createElement(Section, {
      title: "Paid"
    }, /*#__PURE__*/React.createElement(DBlock, {
      gap: "200"
    }, /*#__PURE__*/React.createElement(SummaryRow, {
      label: "Subtotal",
      value: "$741.00"
    }), /*#__PURE__*/React.createElement(SummaryRow, {
      label: "Shipping (Standard)",
      value: "$12.00"
    }), /*#__PURE__*/React.createElement(SummaryRow, {
      label: "Tax (8.875%)",
      value: "$66.85"
    }), /*#__PURE__*/React.createElement(DDivider, null), /*#__PURE__*/React.createElement(SummaryRow, {
      label: "Total",
      value: o.total,
      strong: true
    }))), /*#__PURE__*/React.createElement(Section, {
      title: "Timeline"
    }, /*#__PURE__*/React.createElement(DBlock, {
      gap: "300"
    }, data.timeline.map((t, i) => /*#__PURE__*/React.createElement(DInline, {
      key: i,
      gap: "200",
      blockAlign: "start",
      wrap: false
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '0 0 auto',
        marginTop: 6,
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: 'var(--p-color-border)'
      }
    }), /*#__PURE__*/React.createElement(DBlock, {
      gap: "025"
    }, /*#__PURE__*/React.createElement(DText, {
      variant: "body-md"
    }, t.text), /*#__PURE__*/React.createElement(DText, {
      variant: "body-sm",
      tone: "subdued"
    }, t.time))))))), /*#__PURE__*/React.createElement(DBlock, {
      gap: "400"
    }, /*#__PURE__*/React.createElement(Section, {
      title: "Notes"
    }, /*#__PURE__*/React.createElement(DText, {
      variant: "body-md",
      tone: "subdued"
    }, "No notes from customer")), /*#__PURE__*/React.createElement(Section, {
      title: "Customer"
    }, /*#__PURE__*/React.createElement(DBlock, {
      gap: "300"
    }, /*#__PURE__*/React.createElement(DInline, {
      gap: "200",
      blockAlign: "center"
    }, /*#__PURE__*/React.createElement(DAvatar, {
      name: o.customer,
      size: "md"
    }), /*#__PURE__*/React.createElement(DText, {
      variant: "body-md",
      tone: "base",
      fontWeight: "medium"
    }, o.customer)), /*#__PURE__*/React.createElement(DText, {
      variant: "body-md",
      tone: "subdued"
    }, o.items, " orders"), /*#__PURE__*/React.createElement(DDivider, null), /*#__PURE__*/React.createElement(DBlock, {
      gap: "100"
    }, /*#__PURE__*/React.createElement(DText, {
      variant: "heading-sm"
    }, "Contact information"), /*#__PURE__*/React.createElement(DText, {
      variant: "body-md",
      tone: "subdued"
    }, o.customer.toLowerCase().replace(' ', '.'), "@example.com")), /*#__PURE__*/React.createElement(DDivider, null), /*#__PURE__*/React.createElement(DBlock, {
      gap: "100"
    }, /*#__PURE__*/React.createElement(DText, {
      variant: "heading-sm"
    }, "Shipping address"), /*#__PURE__*/React.createElement(DText, {
      variant: "body-md",
      tone: "subdued"
    }, "128 Birch Street", /*#__PURE__*/React.createElement("br", null), "Portland OR 97201", /*#__PURE__*/React.createElement("br", null), "United States")))))));
  }
  Object.assign(window, {
    OrderDetail
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/OrderDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Orders.jsx
try { (() => {
(function () {
  // Orders index screen — tabbed, filterable table.
  const {
    Text: OText,
    Card: OCard,
    InlineStack: OInline,
    Button: OButton,
    Checkbox: OCheck,
    Icon: OIcon
  } = window.PolarisDesignSystem_1106df;
  const ORDERS_STYLE_ID = 'admin-orders-styles';
  const ORDERS_CSS = `
.otabs { display: flex; gap: var(--p-space-100); padding: var(--p-space-200) var(--p-space-200) 0; }
.otab { all: unset; padding: var(--p-space-150) var(--p-space-300); border-radius: var(--p-border-radius-200); cursor: pointer; font-size: var(--p-font-size-325); font-weight: var(--p-font-weight-medium); color: var(--p-color-text-secondary); }
.otab:hover { background: var(--p-color-bg-fill-transparent-hover); }
.otab--active { background: var(--p-color-bg-fill-transparent-selected); color: var(--p-color-text); }
.otoolbar { display: flex; align-items: center; gap: var(--p-space-200); padding: var(--p-space-200) var(--p-space-300); border-bottom: 1px solid var(--p-color-border-secondary); }
.otable { width: 100%; border-collapse: collapse; }
.otable th { text-align: left; padding: var(--p-space-200) var(--p-space-300); font-size: var(--p-font-size-300); font-weight: var(--p-font-weight-medium); color: var(--p-color-text-secondary); border-bottom: 1px solid var(--p-color-border-secondary); }
.otable td { padding: var(--p-space-300); border-bottom: 1px solid var(--p-color-border-secondary); font-size: var(--p-font-size-325); }
.otable tr.orow { cursor: pointer; }
.otable tr.orow:hover td { background: var(--p-color-bg-surface-hover); }
.otable tr.orow:last-child td { border-bottom: none; }
.otable .num { text-align: right; font-variant-numeric: tabular-nums; }
.ocheck { width: 1px; padding-right: 0 !important; }
`;
  function useOrdersStyles() {
    if (typeof document === 'undefined' || document.getElementById(ORDERS_STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = ORDERS_STYLE_ID;
    el.textContent = ORDERS_CSS;
    document.head.appendChild(el);
  }
  const TABS = [{
    key: 'all',
    label: 'All'
  }, {
    key: 'unfulfilled',
    label: 'Unfulfilled'
  }, {
    key: 'unpaid',
    label: 'Unpaid'
  }, {
    key: 'open',
    label: 'Open'
  }];
  function Orders({
    data,
    onOpenOrder
  }) {
    useOrdersStyles();
    const [tab, setTab] = React.useState('all');
    const rows = data.orders.filter(o => {
      if (tab === 'unfulfilled') return o.fulfillment !== 'Fulfilled';
      if (tab === 'unpaid') return o.payment !== 'Paid';
      return true;
    });
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
      title: "Orders",
      primaryAction: {
        content: 'Create order',
        icon: 'PlusIcon'
      },
      secondaryActions: [{
        content: 'Export',
        icon: 'ExportIcon'
      }]
    }), /*#__PURE__*/React.createElement(OCard, {
      padding: "0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "otabs"
    }, TABS.map(t => /*#__PURE__*/React.createElement("button", {
      key: t.key,
      className: `otab${tab === t.key ? ' otab--active' : ''}`,
      onClick: () => setTab(t.key)
    }, t.label))), /*#__PURE__*/React.createElement("div", {
      className: "otoolbar",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--p-space-200)',
        padding: 'var(--p-space-200) var(--p-space-300)',
        borderBottom: '1px solid var(--p-color-border-secondary)'
      }
    }, /*#__PURE__*/React.createElement(OButton, {
      icon: "SearchIcon",
      size: "slim",
      "aria-label": "Search orders"
    }), /*#__PURE__*/React.createElement(OButton, {
      icon: "FilterIcon",
      size: "slim"
    }, "Add filter"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(OButton, {
      icon: "SortIcon",
      size: "slim"
    }, "Sort")), /*#__PURE__*/React.createElement("table", {
      className: "otable"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      className: "ocheck"
    }, /*#__PURE__*/React.createElement(OCheck, null)), /*#__PURE__*/React.createElement("th", null, "Order"), /*#__PURE__*/React.createElement("th", null, "Date"), /*#__PURE__*/React.createElement("th", null, "Customer"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "Total"), /*#__PURE__*/React.createElement("th", null, "Payment"), /*#__PURE__*/React.createElement("th", null, "Fulfillment"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(o => /*#__PURE__*/React.createElement("tr", {
      key: o.id,
      className: "orow",
      onClick: () => onOpenOrder(o)
    }, /*#__PURE__*/React.createElement("td", {
      className: "ocheck",
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement(OCheck, null)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(OText, {
      variant: "body-md",
      as: "span",
      fontWeight: "semibold"
    }, o.id)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(OText, {
      variant: "body-md",
      as: "span",
      tone: "subdued"
    }, o.date)), /*#__PURE__*/React.createElement("td", null, o.customer), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, /*#__PURE__*/React.createElement(OText, {
      variant: "body-md",
      as: "span",
      numeric: true,
      fontWeight: "medium"
    }, o.total)), /*#__PURE__*/React.createElement("td", null, paymentBadge(o.payment)), /*#__PURE__*/React.createElement("td", null, fulfillmentBadge(o.fulfillment))))))));
  }
  Object.assign(window, {
    Orders
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Orders.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Products.jsx
try { (() => {
(function () {
  // Products index screen.
  const {
    Text: PText,
    Card: PCard,
    Avatar: PAvatar,
    Button: PBtn,
    Checkbox: PCheck
  } = window.PolarisDesignSystem_1106df;
  const PROD_STYLE_ID = 'admin-products-styles';
  const PROD_CSS = `
.ptable { width: 100%; border-collapse: collapse; }
.ptable th { text-align: left; padding: var(--p-space-200) var(--p-space-300); font-size: var(--p-font-size-300); font-weight: var(--p-font-weight-medium); color: var(--p-color-text-secondary); border-bottom: 1px solid var(--p-color-border-secondary); }
.ptable td { padding: var(--p-space-300); border-bottom: 1px solid var(--p-color-border-secondary); font-size: var(--p-font-size-325); vertical-align: middle; }
.ptable tr.prow:hover td { background: var(--p-color-bg-surface-hover); cursor: pointer; }
.ptable tr.prow:last-child td { border-bottom: none; }
.ptable .num { text-align: right; font-variant-numeric: tabular-nums; }
.pprod { display: flex; align-items: center; gap: var(--p-space-300); }
`;
  function usePStyles() {
    if (typeof document === 'undefined' || document.getElementById(PROD_STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = PROD_STYLE_ID;
    el.textContent = PROD_CSS;
    document.head.appendChild(el);
  }
  function Products({
    data
  }) {
    usePStyles();
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
      title: "Products",
      primaryAction: {
        content: 'Add product',
        icon: 'PlusIcon'
      },
      secondaryActions: [{
        content: 'Import',
        icon: 'ImportIcon'
      }, {
        content: 'Export',
        icon: 'ExportIcon'
      }]
    }), /*#__PURE__*/React.createElement(PCard, {
      padding: "0"
    }, /*#__PURE__*/React.createElement("table", {
      className: "ptable"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      style: {
        width: 1
      }
    }, /*#__PURE__*/React.createElement(PCheck, null)), /*#__PURE__*/React.createElement("th", null, "Product"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Inventory"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "Price"))), /*#__PURE__*/React.createElement("tbody", null, data.products.map(p => {
      const out = p.inventory.startsWith('0');
      return /*#__PURE__*/React.createElement("tr", {
        key: p.title,
        className: "prow"
      }, /*#__PURE__*/React.createElement("td", {
        onClick: e => e.stopPropagation()
      }, /*#__PURE__*/React.createElement(PCheck, null)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
        className: "pprod"
      }, /*#__PURE__*/React.createElement(PAvatar, {
        name: p.title,
        initials: p.initials,
        shape: "square",
        size: "lg"
      }), /*#__PURE__*/React.createElement(PText, {
        variant: "body-md",
        as: "span",
        fontWeight: "medium"
      }, p.title))), /*#__PURE__*/React.createElement("td", null, statusBadge(p.status)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(PText, {
        variant: "body-md",
        as: "span",
        tone: out ? 'critical' : 'subdued'
      }, p.inventory)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(PText, {
        variant: "body-md",
        as: "span",
        tone: "subdued"
      }, p.type)), /*#__PURE__*/React.createElement("td", {
        className: "num"
      }, /*#__PURE__*/React.createElement(PText, {
        variant: "body-md",
        as: "span",
        numeric: true,
        fontWeight: "medium"
      }, p.price)));
    })))));
  }
  Object.assign(window, {
    Products
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Products.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/data.js
try { (() => {
// Mock data for the Shopify Admin UI kit. Not real — illustrative only.
window.ADMIN_DATA = {
  shop: {
    name: 'Northbound Supply',
    plan: 'Shopify',
    owner: 'Mae Jensen'
  },
  nav: [{
    key: 'home',
    label: 'Home',
    icon: 'HomeIcon'
  }, {
    key: 'orders',
    label: 'Orders',
    icon: 'OrderIcon',
    badge: '8'
  }, {
    key: 'products',
    label: 'Products',
    icon: 'ProductIcon'
  }, {
    key: 'customers',
    label: 'Customers',
    icon: 'PersonIcon'
  }, {
    key: 'content',
    label: 'Content',
    icon: 'ContentIcon'
  }, {
    key: 'analytics',
    label: 'Analytics',
    icon: 'StoreIcon'
  }, {
    key: 'discounts',
    label: 'Discounts',
    icon: 'DiscountIcon'
  }],
  metrics: [{
    label: 'Total sales',
    value: '$8,420.50',
    delta: '+12.4%',
    up: true
  }, {
    label: 'Orders',
    value: '142',
    delta: '+6.1%',
    up: true
  }, {
    label: 'Sessions',
    value: '3,807',
    delta: '-2.3%',
    up: false
  }, {
    label: 'Conversion rate',
    value: '3.2%',
    delta: '+0.4%',
    up: true
  }],
  orders: [{
    id: '#1024',
    date: 'Today at 4:21 pm',
    customer: 'Mae Jensen',
    total: '$148.00',
    payment: 'Paid',
    fulfillment: 'Unfulfilled',
    items: 2
  }, {
    id: '#1023',
    date: 'Today at 1:08 pm',
    customer: 'Avi Patel',
    total: '$1,248.00',
    payment: 'Paid',
    fulfillment: 'Fulfilled',
    items: 5
  }, {
    id: '#1022',
    date: 'Today at 11:42 am',
    customer: 'Lon Ng',
    total: '$98.50',
    payment: 'Pending',
    fulfillment: 'Unfulfilled',
    items: 1
  }, {
    id: '#1021',
    date: 'Yesterday at 6:30 pm',
    customer: 'Dana Cole',
    total: '$320.00',
    payment: 'Paid',
    fulfillment: 'Fulfilled',
    items: 3
  }, {
    id: '#1020',
    date: 'Yesterday at 2:15 pm',
    customer: 'Theo Marsh',
    total: '$54.00',
    payment: 'Refunded',
    fulfillment: 'Unfulfilled',
    items: 1
  }, {
    id: '#1019',
    date: 'Jul 11 at 9:02 am',
    customer: 'Priya Rao',
    total: '$612.75',
    payment: 'Paid',
    fulfillment: 'Partial',
    items: 4
  }, {
    id: '#1018',
    date: 'Jul 10 at 5:48 pm',
    customer: 'Sam Okafor',
    total: '$210.00',
    payment: 'Paid',
    fulfillment: 'Fulfilled',
    items: 2
  }],
  products: [{
    title: 'Aurora All-Mountain Snowboard',
    status: 'Active',
    inventory: '38 in stock',
    type: 'Snowboard',
    price: '$699.00',
    initials: 'AS'
  }, {
    title: 'Compass Step-On Bindings',
    status: 'Active',
    inventory: '12 in stock',
    type: 'Bindings',
    price: '$249.00',
    initials: 'CB'
  }, {
    title: 'Tundra Insulated Jacket',
    status: 'Active',
    inventory: '0 in stock',
    type: 'Apparel',
    price: '$320.00',
    initials: 'TJ'
  }, {
    title: 'Summit Wax Kit',
    status: 'Draft',
    inventory: '120 in stock',
    type: 'Accessory',
    price: '$42.00',
    initials: 'WK'
  }, {
    title: 'Ridgeline Goggles',
    status: 'Active',
    inventory: '64 in stock',
    type: 'Accessory',
    price: '$129.00',
    initials: 'RG'
  }, {
    title: 'Basecamp Beanie',
    status: 'Archived',
    inventory: '5 in stock',
    type: 'Apparel',
    price: '$28.00',
    initials: 'BB'
  }],
  // Line items for the order-detail screen
  orderLines: [{
    title: 'Aurora All-Mountain Snowboard',
    variant: '156cm · Graphite',
    qty: 1,
    price: '$699.00',
    initials: 'AS'
  }, {
    title: 'Summit Wax Kit',
    variant: 'All-temperature',
    qty: 1,
    price: '$42.00',
    initials: 'WK'
  }],
  timeline: [{
    time: '4:21 pm',
    text: 'Order confirmation email was sent to Mae Jensen.'
  }, {
    time: '4:21 pm',
    text: 'Mae Jensen placed this order on Online Store.'
  }, {
    time: '4:20 pm',
    text: 'A $148.00 USD payment was processed on Shopify Payments.'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.ButtonGroup = __ds_scope.ButtonGroup;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Text = __ds_scope.Text;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.Spinner = __ds_scope.Spinner;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.RadioButton = __ds_scope.RadioButton;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.BlockStack = __ds_scope.BlockStack;

__ds_ns.InlineStack = __ds_scope.InlineStack;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.Card = __ds_scope.Card;

})();
