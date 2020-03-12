"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mdbreact_1 = require("mdbreact");
const sdk_1 = require("@enslogin/sdk");
const localforage_1 = __importDefault(require("localforage"));
require("bootstrap-css-only/css/bootstrap.min.css");
require("mdbreact/dist/css/mdb.css");
require("../css/LoginWithEthereum.css");
const STORE = 'login-with-ethereum-cache';
class LoginWithEthereum extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.state = {
            provider: undefined,
            modal: false,
        };
        this.componentDidMount = () => {
            this.props.config.__callbacks = this.props.config.__callbacks || {};
            const resolved_super = this.props.config.__callbacks.resolved;
            this.props.config.__callbacks.resolved = (username, addr, descr) => {
                this.setState({ modal: false }, () => {
                    if (resolved_super) {
                        resolved_super(username, addr, descr);
                    }
                });
            };
        };
        this.setProvider = (provider) => {
            return new Promise((resolve, reject) => {
                this.setState({ provider }, () => {
                    if (this.props.connect) {
                        this.props.connect(provider);
                    }
                    resolve();
                });
            });
        };
        this.clearProvider = () => {
            return new Promise((resolve, reject) => {
                this.setState({ provider: undefined }, () => {
                    if (this.props.disconnect) {
                        this.props.disconnect();
                    }
                    resolve();
                });
            });
        };
        this.connect = () => __awaiter(this, void 0, void 0, function* () {
            let cache = !this.props.noCache ? yield this.getCache() : undefined;
            let injected = !this.props.noInjected ? window.ethereum : undefined;
            if (cache) {
                try {
                    switch (cache.module) {
                        case 'enslogin':
                            {
                                yield this.enslogin(cache.details);
                                return;
                            }
                        case 'walletconnect':
                            {
                                yield this.walletconnect();
                                return;
                            }
                        default:
                            console.error(`Unsuported module ${cache.module}`);
                            break;
                    }
                }
                catch (_a) {
                    console.warn(`Failled to load from cache ${JSON.stringify(cache)}`);
                }
            }
            if (injected) {
                try {
                    if (injected.enable) {
                        yield injected.enable();
                    }
                    yield this.setProvider(injected);
                    return;
                }
                catch (_b) { }
            }
            this.setState({ modal: true });
        });
        this.disconnect = () => __awaiter(this, void 0, void 0, function* () {
            var _c;
            if ((_c = this.state.provider) === null || _c === void 0 ? void 0 : _c.disable) {
                yield this.state.provider.disable();
            }
            yield this.clearCache();
            yield this.clearProvider();
        });
        this.walletconnect = () => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    console.error('walletconnect no supported yet');
                    reject();
                }
                catch (error) {
                    yield this.clearCache();
                    reject(error);
                }
            }));
        };
        this.enslogin = (username) => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let provider = yield sdk_1.ENSLoginSDK.connect(username, this.props.config);
                    if (provider.enable) {
                        yield provider.enable();
                    }
                    yield this.setProvider(provider);
                    if (!this.props.noCache) {
                        this.setCache({ module: "enslogin", details: username });
                    }
                    resolve();
                }
                catch (error) {
                    yield this.clearCache();
                    reject(error);
                }
            }));
        };
        this.setCache = (value) => {
            return localforage_1.default.setItem(STORE, value, (err) => !!err);
        };
        this.getCache = () => {
            return localforage_1.default.getItem(STORE, (value, err) => (err ? null : value));
        };
        this.clearCache = () => {
            return localforage_1.default.clear();
        };
        this.toggle = () => {
            this.setState({ modal: !this.state.modal });
        };
        this.submit = (ev) => {
            this.enslogin(ev.target.value)
                .then(() => { })
                .catch(() => { });
        };
        this.render = () => {
            return (react_1.default.createElement("div", { id: 'LoginWithEthereum', className: this.props.className || '' },
                this.state.provider
                    ? react_1.default.createElement("button", { onClick: this.disconnect }, "Disconnect")
                    : react_1.default.createElement("button", { onClick: this.connect }, "Login with Ethereum"),
                react_1.default.createElement(mdbreact_1.MDBModal, { isOpen: this.state.modal, toggle: this.toggle, centered: true },
                    react_1.default.createElement(mdbreact_1.MDBModalBody, null,
                        react_1.default.createElement(mdbreact_1.MDBInput, { onChange: this.submit, label: 'username' }),
                        react_1.default.createElement("a", { href: 'https://get-an-enslogin.com', target: '_blank', rel: 'noopener noreferrer', className: 'd-block w-100 text-right small' }, "Get an ENS Login")))));
        };
    }
}
exports.LoginWithEthereum = LoginWithEthereum;
//# sourceMappingURL=LoginWithEthereum.js.map