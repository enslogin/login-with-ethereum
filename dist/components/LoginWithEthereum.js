"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mdbreact_1 = require("mdbreact");
const sdk_1 = __importDefault(require("@enslogin/sdk"));
const localforage_1 = __importDefault(require("localforage"));
require("bootstrap-css-only/css/bootstrap.min.css");
require("mdbreact/dist/css/mdb.css");
require("../css/LoginWithEthereum.css");
const USERNAME_STORE = 'enslogin-username';
class LoginWithEthereum extends react_1.default.Component {
    constructor(props) {
        super(props);
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
                this.setState({ provider: null }, () => {
                    if (this.props.disconnect) {
                        this.props.disconnect();
                    }
                    resolve();
                });
            });
        };
        this.autoconnect = () => {
            return new Promise((resolve, reject) => {
                if (!this.props.noCache) {
                    this.loadLogin()
                        .then((username) => {
                        this.tryConnect(username)
                            .then(resolve)
                            .catch(reject);
                    })
                        .catch(reject);
                }
                else {
                    reject();
                }
            });
        };
        this.tryConnect = (username) => {
            return new Promise((resolve, reject) => {
                sdk_1.default.connect(username, this.props.config)
                    .then((provider) => {
                    provider.enable()
                        .then(() => {
                        this.setProvider(provider)
                            .then(() => {
                            if (!this.props.noCache) {
                                this.saveLogin(username);
                            }
                            resolve();
                        })
                            .catch(reject);
                    })
                        .catch(reject);
                })
                    .catch(() => {
                    this.clearLogin()
                        .then(reject)
                        .catch(reject);
                });
            });
        };
        this.connect = () => {
            this.autoconnect()
                .then(() => { })
                .catch(() => {
                if (!this.props.noInjected && window && window.ethereum) {
                    const injected = window.ethereum;
                    injected.enable()
                        .then(() => {
                        this.setProvider(injected);
                    })
                        .catch(() => {
                        this.setState({ display: true });
                    });
                }
                else {
                    this.setState({ display: true });
                }
            });
        };
        this.disconnect = () => {
            return new Promise((resolve, reject) => {
                if (this.state.provider && this.state.provider.disable) {
                    this.state.provider.disable();
                }
                this.clearLogin()
                    .then(() => {
                    this.clearProvider()
                        .then(resolve)
                        .catch(reject);
                })
                    .catch(reject);
            });
        };
        // Cache
        this.saveLogin = (username) => {
            return localforage_1.default.setItem(USERNAME_STORE, username, (err) => !!err);
        };
        this.loadLogin = () => {
            return localforage_1.default.getItem(USERNAME_STORE, (value, err) => (err ? null : value));
        };
        this.clearLogin = () => {
            return localforage_1.default.clear();
        };
        // UI
        this.toggle = () => {
            this.setState({ display: !this.state.display });
        };
        this.submit = (ev) => {
            this.tryConnect(ev.target.value)
                .then(() => { })
                .catch(() => { });
        };
        this.render = () => {
            return (react_1.default.createElement("div", { id: 'LoginWithEthereum' },
                this.state.provider
                    ? react_1.default.createElement("button", { onClick: this.disconnect }, "Disconnect")
                    : react_1.default.createElement("button", { onClick: this.connect }, "Login with Ethereum"),
                react_1.default.createElement(mdbreact_1.MDBModal, { isOpen: this.state.display, toggle: this.toggle, centered: true },
                    react_1.default.createElement(mdbreact_1.MDBModalBody, null,
                        react_1.default.createElement(mdbreact_1.MDBInput, { onChange: this.submit, label: 'username' }),
                        react_1.default.createElement("a", { href: 'https://get-an-enslogin.com', target: '_blank', rel: 'noopener noreferrer', className: 'd-block w-100 text-right small' }, "Get an ENS Login")))));
        };
        this.state = {
            display: false,
            provider: null,
        };
        this.props.config.__callbacks = this.props.config.__callbacks || {};
        const resolved_super = this.props.config.__callbacks.resolved;
        this.props.config.__callbacks.resolved = (username, addr, descr) => {
            this.setState({ display: false }, () => {
                if (resolved_super) {
                    resolved_super(username, addr, descr);
                }
            });
        };
    }
}
exports.LoginWithEthereum = LoginWithEthereum;
