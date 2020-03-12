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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const LoginWithEthereumLoading_1 = __importDefault(require("./LoginWithEthereumLoading"));
const mdbreact_1 = require("mdbreact");
const sdk_1 = require("@enslogin/sdk");
const localforage_1 = __importDefault(require("localforage"));
require("bootstrap-css-only/css/bootstrap.min.css");
require("mdbreact/dist/css/mdb.css");
require("../css/LoginWithEthereum.css");
const STORE = 'login-with-ethereum-cache';
class LoginWithEthereum extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            provider: undefined,
            loading: false,
            modal: false,
        };
        this.componentDidMount = () => {
            this.props.config.__callbacks = this.props.config.__callbacks || {};
            const super_resolved = this.props.config.__callbacks.resolved;
            this.props.config.__callbacks.resolved = (username, addr, descr) => {
                this.setState({ loading: true, modal: false }, () => {
                    if (super_resolved)
                        super_resolved(username, addr, descr);
                });
            };
            const super_loading = this.props.config.__callbacks.loading;
            this.props.config.__callbacks.loading = (protocol, path) => {
                this.setState({ loading: true, modal: false }, () => {
                    if (super_loading)
                        super_loading(protocol, path);
                });
            };
            const super_loaded = this.props.config.__callbacks.loaded;
            this.props.config.__callbacks.loaded = (protocol, path) => {
                this.setState({ loading: true, modal: false }, () => {
                    if (super_loaded)
                        super_loaded(protocol, path);
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
                    reject('walletconnect no supported yet');
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
                finally {
                    this.setState({ loading: false });
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
            ev.preventDefault();
            this.enslogin(ev.target.username.value)
                .then(() => { })
                .catch(console.error);
        };
        this.render = () => {
            return (React.createElement(React.Fragment, null,
                this.state.loading && React.createElement(LoginWithEthereumLoading_1.default, null),
                React.createElement("div", { id: 'LoginWithEthereum-Button', className: this.props.className || '' }, this.state.provider
                    ? React.createElement("button", { onClick: this.disconnect }, "Disconnect")
                    : React.createElement("button", { onClick: this.connect }, "Login with Ethereum")),
                React.createElement(mdbreact_1.MDBModal, { id: 'LoginWithEthereum-Modal', isOpen: this.state.modal, toggle: this.toggle, centered: true },
                    React.createElement("ul", { className: "nav nav-tabs d-flex" },
                        React.createElement("li", { className: "nav-item flex-auto text-center" },
                            React.createElement("a", { className: "nav-link active" }, "Loggin")),
                        React.createElement("li", { className: "nav-item flex-auto text-center" },
                            React.createElement("a", { className: "nav-link", href: 'https://get-an-enslogin.com', target: '_blank', rel: 'noopener noreferrer' }, "Sign-up"))),
                    React.createElement("form", { className: "m-5", onSubmit: this.submit },
                        React.createElement(mdbreact_1.MDBInput, { outline: true, name: 'username', label: 'username', className: "m-0" }),
                        React.createElement("a", { className: "inline-embeded", href: "#", onClick: this.walletconnect },
                            React.createElement(mdbreact_1.MDBIcon, { icon: "qrcode" }))),
                    React.createElement("div", { className: "d-flex justify-content-center mx-5 mb-3" },
                        React.createElement("a", { href: "#", onClick: () => this.enslogin('authereum.enslogin.eth') },
                            React.createElement("img", { height: "30px", className: "rounded mx-2", src: "https://miro.medium.com/fit/c/160/160/1*w__iPpsW58dKOv7ZU4tD2A.png" })),
                        React.createElement("a", { href: "#", onClick: () => this.enslogin('metamask.enslogin.eth') },
                            React.createElement("img", { height: "30px", className: "rounded mx-2", src: "https://betoken.fund/iao/semantic/dist/themes/default/assets/images/metamask-big.png" })),
                        React.createElement("a", { href: "#", onClick: () => this.enslogin('portis.enslogin.eth') },
                            React.createElement("img", { height: "30px", className: "rounded mx-2", src: "https://wallet.portis.io/805b29212ec4c056ac686d150789aeca.svg" })),
                        React.createElement("a", { href: "#", onClick: () => this.enslogin('torus.enslogin.eth') },
                            React.createElement("img", { height: "30px", className: "rounded mx-2", src: "https://gblobscdn.gitbook.com/spaces%2F-LcdiG7_Iag-nhSbPQK2%2Favatar.png" }))))));
        };
    }
}
exports.LoginWithEthereum = LoginWithEthereum;
//# sourceMappingURL=LoginWithEthereum.js.map