"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = require("react-dom");

var _TestComp = _interopRequireDefault(require("../src/TestComp"));

function queryRender(query, component) {
  var els = document.querySelectorAll("[data-test-".concat(query, "]"));

  for (var i = els.length; i--;) {
    if (els[i].dataset.processed) {
      continue;
    }

    (0, _reactDom.render)(component, els[i]);
    els[i].dataset.processed = true;
  }
}

var LocatorInject = /*#__PURE__*/function () {
  function LocatorInject() {// this.inject()

    (0, _classCallCheck2.default)(this, LocatorInject);
  }

  (0, _createClass2.default)(LocatorInject, [{
    key: "inject",
    value: function inject() {
      queryRender("container", /*#__PURE__*/_react.default.createElement(_TestComp.default, null));
    }
  }]);
  return LocatorInject;
}();

exports.default = LocatorInject;