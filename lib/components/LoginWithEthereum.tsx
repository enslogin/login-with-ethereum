import React from 'react';
import {MDBBtn, MDBInput, MDBModal, MDBModalBody} from 'mdbreact';
import ENSLoginSDK from '@enslogin/sdk';
import localforage from 'localforage';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import '../css/LoginWithEthereum.css';

const USERNAME_STORE = 'enslogin-username';

import { config   } from '@enslogin/sdk/lib/types/config';
import { provider } from '@enslogin/sdk/lib/types/ethereum';

export interface providerExtended extends provider
{
	enable  ?: () => Promise<void>;
	disable ?: () => Promise<void>;
}

declare global
{
	interface Window
	{
		ethereum ?: providerExtended;
	}
}

export interface LoginWithEthereumProps
{
	config      : config;
	connect    ?: (provider: providerExtended) => void;
	disconnect ?: () => void;
	noCache    ?: boolean;
	noInjected ?: boolean;
}
export interface LoginWithEthereumState
{
	display  ?: boolean;
	provider ?: providerExtended;
}

export class LoginWithEthereum extends React.Component<LoginWithEthereumProps, LoginWithEthereumState>
{
	constructor(props)
	{
		super(props);
		this.state = {
			display: false,
			provider: null,
		};

		this.props.config.__callbacks = this.props.config.__callbacks || {};
		this.props.config.__callbacks.resolved = (username, addr, descr) => {
			this.setState({ display: false }, () => {
				this.props.config.__callbacks.resolved(username, addr, descr);
			})
		};
	}

	setProvider = (provider: providerExtended): Promise<void> => {
		return new Promise((resolve, reject) => {
			this.setState({ provider }, () => {
				if (this.props.connect)
				{
					this.props.connect(provider)
				}
				resolve()
			})
		})
	}

	clearProvider = (): Promise<void> => {
		return new Promise((resolve, reject) => {
			this.setState({ provider: null }, () => {
				if (this.props.disconnect)
				{
					this.props.disconnect()
				}
				resolve()
			})
		})
	}

	autoconnect = (): Promise<void> => {
		return new Promise((resolve, reject) => {
			if (!this.props.noCache)
			{
				this.loadLogin()
				.then((username: string) => {
					this.tryConnect(username)
					.then(resolve)
					.catch(reject)
				})
				.catch(reject)
			}
			else
			{
				reject()
			}
		})
	}

	tryConnect = (username: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			ENSLoginSDK.connect(username, this.props.config)
			.then((provider: providerExtended) => {
				provider.enable()
				.then(() => {
					this.setProvider(provider)
					.then(() => {
						if (!this.props.noCache)
						{
							this.saveLogin(username)
						}
						resolve()
					})
					.catch(reject)
				})
				.catch(reject)
			})
			.catch(() => {
				this.clearLogin()
				.then(reject)
				.catch(reject)
			})
		})
	}

	connect = (): void => {
		this.autoconnect()
		.then(() => {})
		.catch(() => {
			if (!this.props.noInjected && window && window.ethereum)
			{
				const injected: providerExtended = window.ethereum;
				injected.enable()
				.then(() => {
					this.setProvider(injected)
				})
				.catch(() => {
					this.setState({ display: true })
				});
			}
			else
			{
				this.setState({ display: true })
			}
		})
	}

	disconnect = (): Promise<void> => {
		return new Promise((resolve, reject) => {
			if (this.state.provider && this.state.provider.disable)
			{
				this.state.provider.disable()
			}
			this.clearLogin()
			.then(() => {
				this.clearProvider()
				.then(resolve)
				.catch(reject)
			})
			.catch(reject)
		})
	}

	// Cache
	saveLogin = (username: string): Promise<string> => {
		return localforage.setItem(USERNAME_STORE, username, (err) => !!err)
	}

	loadLogin = (): Promise<string> => {
		return localforage.getItem(USERNAME_STORE, (value, err) => (err ? null : value))
	}

	clearLogin = (): Promise<void> => {
		return localforage.clear()
	}

	// UI
	toggle = (): void => {
		this.setState({ display: !this.state.display })
	}

	submit = (ev): void => {
		this.tryConnect(ev.target.value)
		.then(() => {})
		.catch(() => {})
	}

	render = () => {
		return (
			<div id='LoginWithEthereum'>
				{
					this.state.provider
					? <button onClick={ this.disconnect }>Disconnect</button>
					: <button onClick={ this.connect    }>Login with Ethereum</button>
				}
				<MDBModal isOpen={ this.state.display } toggle={ this.toggle } centered>
					<MDBModalBody>
						<MDBInput onChange={ this.submit } label='username'>
						</MDBInput>
						<a href='https://get-an-enslogin.com' target='_blank' rel='noopener noreferrer' className='d-block w-100 text-right small'>
							Get an ENS Login
						</a>
					</MDBModalBody>
				</MDBModal>
			</div>
		);
	}
}
