"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _mdbreact = require("mdbreact");

var _CircleLoader = _interopRequireDefault(require("react-spinners/CircleLoader"));

var _localforage = _interopRequireDefault(require("localforage"));

var _sdk = require("@enslogin/sdk");

require("@fortawesome/fontawesome-free/css/all.min.css");

require("bootstrap-css-only/css/bootstrap.min.css");

require("mdbreact/dist/css/mdb.css");

require("./index.css");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var STORE = 'login-with-ethereum-cache';

var LoginWithEthereum = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2["default"])(LoginWithEthereum, _React$Component);

  var _super = _createSuper(LoginWithEthereum);

  function LoginWithEthereum() {
    var _this;

    (0, _classCallCheck2["default"])(this, LoginWithEthereum);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {});
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "componentDidMount", function () {
      console;
      _this.props.config.__callbacks = _this.props.config.__callbacks || {};
      var super_resolved = _this.props.config.__callbacks.resolved;

      _this.props.config.__callbacks.resolved = function (username, addr, descr) {
        return _this.setState({
          details: 'username resolved'
        }, function () {
          return super_resolved && super_resolved(username, addr, descr);
        });
      };

      var super_loading = _this.props.config.__callbacks.loading;

      _this.props.config.__callbacks.loading = function (protocol, path) {
        return _this.setState({
          details: 'fetching wallet'
        }, function () {
          return super_loading && super_loading(protocol, path);
        });
      };

      var super_loaded = _this.props.config.__callbacks.loaded;

      _this.props.config.__callbacks.loaded = function (protocol, path) {
        return _this.setState({
          details: 'instanciating wallet'
        }, function () {
          return super_loaded && super_loaded(protocol, path);
        });
      };
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "setProvider", function (provider) {
      return new Promise(function (resolve, reject) {
        _this.setState({
          provider: provider,
          modal: false,
          loading: false
        }, function () {
          _this.props.connect && _this.props.connect(provider);
          provider.on('accountsChanged', function (accounts) {
            return accounts.length === 0 && _this.disconnect();
          });
          resolve();
        });
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "clearProvider", function () {
      return new Promise(function (resolve, reject) {
        _this.setState({
          provider: undefined,
          modal: _this.props.startVisible,
          loading: false
        }, function () {
          _this.props.disconnect && _this.props.disconnect();
          resolve();
        });
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "connect", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var cache, injected;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.t0 = !_this.props.noCache;

              if (!_context.t0) {
                _context.next = 5;
                break;
              }

              _context.next = 4;
              return _this.getCache();

            case 4:
              _context.t0 = _context.sent;

            case 5:
              cache = _context.t0;
              injected = !_this.props.noInjected && window.ethereum;

              if (!cache) {
                _context.next = 17;
                break;
              }

              _context.prev = 8;
              _context.next = 11;
              return _this.enslogin(cache);

            case 11:
              return _context.abrupt("return");

            case 14:
              _context.prev = 14;
              _context.t1 = _context["catch"](8);
              console.warn("Failed to load from cache: ".concat(cache));

            case 17:
              if (!injected) {
                _context.next = 30;
                break;
              }

              _context.prev = 18;
              _context.t2 = injected.enable;

              if (!_context.t2) {
                _context.next = 23;
                break;
              }

              _context.next = 23;
              return injected.enable();

            case 23:
              _context.next = 25;
              return _this.setProvider(injected);

            case 25:
              return _context.abrupt("return");

            case 28:
              _context.prev = 28;
              _context.t3 = _context["catch"](18);

            case 30:
              _this.setState({
                modal: true
              });

            case 31:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[8, 14], [18, 28]]);
    })));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "disconnect", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.t0 = _this.state.provider.disable;

              if (!_context2.t0) {
                _context2.next = 4;
                break;
              }

              _context2.next = 4;
              return _this.state.provider.disable();

            case 4:
              _context2.next = 6;
              return _this.clearCache();

            case 6:
              _context2.next = 8;
              return _this.clearProvider();

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    })));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "enslogin", function (username) {
      return new Promise( /*#__PURE__*/function () {
        var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(resolve, reject) {
          var provider;
          return _regenerator["default"].wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.prev = 0;

                  // show loading
                  _this.setState({
                    loading: true,
                    details: undefined
                  }); // connect with enslogin's sdk


                  _context3.next = 4;
                  return _sdk.ENSLoginSDK.connect(username, _this.props.config);

                case 4:
                  provider = _context3.sent;
                  _context3.t0 = provider.enable;

                  if (!_context3.t0) {
                    _context3.next = 9;
                    break;
                  }

                  _context3.next = 9;
                  return provider.enable();

                case 9:
                  _context3.next = 11;
                  return _this.setProvider(provider);

                case 11:
                  // set cache
                  !_this.props.noCache && _this.setCache(username); // done

                  resolve();
                  _context3.next = 20;
                  break;

                case 15:
                  _context3.prev = 15;
                  _context3.t1 = _context3["catch"](0);
                  _context3.next = 19;
                  return _this.clearCache();

                case 19:
                  reject(_context3.t1);

                case 20:
                  _context3.prev = 20;

                  _this.setState({
                    loading: false,
                    details: undefined
                  });

                  return _context3.finish(20);

                case 23:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, null, [[0, 15, 20, 23]]);
        }));

        return function (_x, _x2) {
          return _ref3.apply(this, arguments);
        };
      }());
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "setCache", function (value) {
      return _localforage["default"].setItem(STORE, value, function (err) {
        return !!err;
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "getCache", function () {
      return _localforage["default"].getItem(STORE, function (value, err) {
        return err ? null : value;
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "clearCache", function () {
      return _localforage["default"].clear();
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "toggle", function () {
      _this.setState({
        modal: !_this.state.modal
      });
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "submit", function (ev) {
      ev.preventDefault();

      _this.enslogin(ev.target.username.value).then(function () {})["catch"](console.error);
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "render", function () {
      return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement("div", {
        id: "LoginWithEthereum-Button",
        className: _this.props.className
      }, _this.state.provider ? /*#__PURE__*/_react["default"].createElement("button", {
        onClick: _this.disconnect
      }, "Disconnect") : /*#__PURE__*/_react["default"].createElement("button", {
        onClick: _this.connect
      }, "Login with Ethereum")), /*#__PURE__*/_react["default"].createElement(_mdbreact.MDBModal, {
        id: "LoginWithEthereum-Modal",
        isOpen: _this.state.modal || _this.state.loading,
        toggle: _this.toggle,
        centered: true
      }, /*#__PURE__*/_react["default"].createElement("ul", {
        className: "nav nav-tabs d-flex"
      }, /*#__PURE__*/_react["default"].createElement("li", {
        className: "nav-item flex-auto text-center"
      }, /*#__PURE__*/_react["default"].createElement("span", {
        className: "nav-link active"
      }, "Login")), /*#__PURE__*/_react["default"].createElement("li", {
        className: "nav-item flex-auto text-center"
      }, /*#__PURE__*/_react["default"].createElement("a", {
        className: "nav-link text-muted",
        href: "https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2525.md",
        target: "_blank",
        rel: "noopener noreferrer"
      }, "About ENSLogin"))), /*#__PURE__*/_react["default"].createElement(_mdbreact.MDBModalBody, {
        className: "m-5"
      }, !_this.state.loading && /*#__PURE__*/_react["default"].createElement("form", {
        onSubmit: _this.submit
      }, /*#__PURE__*/_react["default"].createElement("div", {
        className: "d-flex"
      }, _this.props.networks && /*#__PURE__*/_react["default"].createElement("select", {
        className: "md-form md-outline",
        defaultValue: _this.props.config.provider && _this.props.config.provider.network || '',
        onChange: function onChange(ev) {
          _this.props.config.provider = _this.props.config.provider || {};
          _this.props.config.provider.network = ev.target.value;
        }
      }, _this.props.networks.map(function (_ref4, i) {
        var name = _ref4.name,
            endpoint = _ref4.endpoint;
        return /*#__PURE__*/_react["default"].createElement("option", {
          key: i,
          value: endpoint || name
        }, name);
      })), /*#__PURE__*/_react["default"].createElement(_mdbreact.MDBInput, {
        outline: true,
        name: "username",
        label: "username",
        className: "m-0"
      }, /*#__PURE__*/_react["default"].createElement(_mdbreact.MDBIcon, {
        icon: "qrcode",
        className: "input-embeded pointer-hover text-muted",
        onClick: function onClick() {
          return _this.enslogin('walletconnect.enslogin.eth');
        }
      }))), /*#__PURE__*/_react["default"].createElement("small", {
        className: "form-text text-muted ml-1"
      }, "Enter your username and press [enter].")), _this.state.loading && /*#__PURE__*/_react["default"].createElement("div", {
        className: "d-flex align-items-center text-muted mx-2"
      }, /*#__PURE__*/_react["default"].createElement("span", {
        className: "flex-auto text-center font-weight-bolder"
      }, "Loading ", _this.state.details && "(".concat(_this.state.details, ")")), /*#__PURE__*/_react["default"].createElement("span", {
        className: "inline-embeded"
      }, /*#__PURE__*/_react["default"].createElement(_CircleLoader["default"], {
        size: "1.5em",
        color: "#6c757d"
      })))), !_this.state.loading && /*#__PURE__*/_react["default"].createElement("div", {
        className: "d-flex justify-content-center mx-5 mb-3"
      }, /*#__PURE__*/_react["default"].createElement("span", {
        className: "pointer-hover",
        onClick: function onClick() {
          return _this.enslogin('metamask.enslogin.eth');
        }
      }, /*#__PURE__*/_react["default"].createElement("img", {
        alt: "metamask",
        height: "30px",
        className: "rounded mx-2",
        src: "https://betoken.fund/iao/semantic/dist/themes/default/assets/images/metamask-big.png"
      })), /*#__PURE__*/_react["default"].createElement("span", {
        className: "pointer-hover",
        onClick: function onClick() {
          return _this.enslogin('authereum.enslogin.eth');
        }
      }, /*#__PURE__*/_react["default"].createElement("img", {
        alt: "authereum",
        height: "30px",
        className: "rounded mx-2",
        src: "https://miro.medium.com/fit/c/160/160/1*w__iPpsW58dKOv7ZU4tD2A.png"
      })), /*#__PURE__*/_react["default"].createElement("span", {
        className: "pointer-hover",
        onClick: function onClick() {
          return _this.enslogin('portis.enslogin.eth');
        }
      }, /*#__PURE__*/_react["default"].createElement("img", {
        alt: "portis",
        height: "30px",
        className: "rounded mx-2",
        src: "https://wallet.portis.io/805b29212ec4c056ac686d150789aeca.svg"
      })))));
    });
    return _this;
  }

  return LoginWithEthereum;
}(_react["default"].Component);

LoginWithEthereum.propTypes = {
  config: _propTypes["default"].object,
  networks: _propTypes["default"].array,
  connect: _propTypes["default"].func,
  disconnect: _propTypes["default"].func,
  noCache: _propTypes["default"].bool,
  noInjected: _propTypes["default"].bool,
  startVisible: _propTypes["default"].bool,
  className: _propTypes["default"].string
};
LoginWithEthereum.defaultProps = {
  config: {
    provider: {
      network: 'ropsten'
    },
    ipfs: {
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https'
    }
  },
  noCache: false,
  noInjected: false,
  startVisible: false,
  className: ''
};
var _default = LoginWithEthereum;
exports["default"] = _default;