import React from "react";
import { MDBBtn, MDBInput, MDBModal, MDBModalBody } from 'mdbreact';
import { ENSLoginSDK, types } from '@enslogin/sdk';
// import WalletConnectProvider from '@walletconnect/web3-provider';
import localforage from 'localforage';

import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import '../css/LoginWithEthereum.css';

const STORE = 'login-with-ethereum-cache';

/*****************************************************************************
 *                        declaration and interfaces                         *
 *****************************************************************************/
declare global
{
	interface Window
	{
		ethereum ?: types.provider;
	}
}

export interface Props
{
	config      : types.config;
	connect    ?: (provider: types.provider) => void;
	disconnect ?: () => void;
	noCache    ?: boolean;
	noInjected ?: boolean;
	className  ?: string;
}

export interface State
{
	provider ?: types.provider;
	modal     : boolean;
}

export interface Cache
{
	module   : string;
	details ?: any;
}

/*****************************************************************************
 *                              React component                              *
 *****************************************************************************/
export class LoginWithEthereum extends React.Component<Props, State>
{
	state: State = {
		provider: undefined,
		modal:    false,
	}

	/**
	 * component configuration
	 */
	componentDidMount = () : void => {
		this.props.config.__callbacks = this.props.config.__callbacks || {}
		// inject modal management into the enslogin callback for resolution
		const resolved_super = this.props.config.__callbacks.resolved
		this.props.config.__callbacks.resolved = (username, addr, descr) => {
			this.setState({ modal: false }, () => {
				if (resolved_super)
				{
					resolved_super(username, addr, descr)
				}
			})
		}
	}

	/**
	 * State (provider) management
	 */
	setProvider = (provider: types.provider): Promise<void> => {
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
			this.setState({ provider: undefined }, () => {
				if (this.props.disconnect)
				{
					this.props.disconnect()
				}
				resolve()
			})
		})
	}

	/**
	 * Connect / Disconnect endpoints
	 */
	connect = async () : Promise<void> => {
		let cache:    Cache          | undefined = !this.props.noCache    ? await this.getCache() : undefined
		let injected: types.provider | undefined = !this.props.noInjected ? window.ethereum       : undefined

		// Try connecting to a cached provider
		if (cache)
		{
			try
			{
				switch (cache.module)
				{
					case 'enslogin':
					{
						await this.enslogin(cache.details as string)
						return; // connection established → return
					}

					case 'walletconnect':
					{
						await this.walletconnect()
						return; // connection established → return
					}

					default:
						console.error(`Unsuported module ${cache.module}`)
						break; // no connection → skip
				}
			}
			catch
			{
				console.warn(`Failled to load from cache ${JSON.stringify(cache)}`)
			}
		}

		// connect to injected web3
		if (injected)
		{
			try
			{
				if (injected.enable)
				{
					await injected.enable()
				}
				await this.setProvider(injected)
				return; // connection established → return
			}
			catch {}
		}

		// show modal
		this.setState({ modal: true })
	}

	disconnect = async () : Promise<void> => {
		if (this.state.provider?.disable)
		{
			await this.state.provider.disable()
		}
		await this.clearCache()
		await	this.clearProvider()
	}

	/**
	 * Provider instanciation mechanism - WalletConnect
	 */
	walletconnect = () : Promise<void> => {
		return new Promise(async (resolve, reject) => {
			try
			{
				console.error('walletconnect no supported yet')
				reject()
				// TODO WalletConnect
				// // connect using walletconnect
				// let provider: types.provider = new WalletConnectProvider({ infuraId: "27e484dcd9e3efcfd25a83a78777cdf1" }) // TODO infura
				// provider.disable = provider.close; // to make it compatible with the disconnect function
				//
				// // enable provider
				// await provider.enable()
				//
				// // set provider
				// await this.setProvider(provider);
				//
				// // set cache
				// if (!this.props.noCache)
				// {
				// 	this.setCache({ module: "walletconnect" })
				// }
				//
				// // done
				// resolve()
			}
			catch (error)
			{
				await this.clearCache()
				reject(error)
			}
		})
	}

	/**
	 * Provider instanciation mechanism - EnsLogin
	 */
	enslogin = (username: string) : Promise<void> => {
		return new Promise<void>(async (resolve, reject) => {
			try
			{
				// connect using enslogin
				let provider: types.provider = await ENSLoginSDK.connect(username, this.props.config)

				// enable provider
				if (provider.enable)
				{
					await provider.enable()
				}

				// set provider
				await this.setProvider(provider)

				// set cache
				if (!this.props.noCache)
				{
					this.setCache({ module: "enslogin", details: username })
				}

				// done
				resolve()
			}
			catch (error)
			{
				await this.clearCache()
				reject(error)
			}
		})
	}

	/**
	 * Cache tooling
	 */
	setCache = (value: Cache): Promise<Cache> => {
		return localforage.setItem(STORE, value, (err) => !!err)
	}

	getCache = (): Promise<Cache> => {
		return localforage.getItem(STORE, (value, err) => (err ? null : value))
	}

	clearCache = (): Promise<void> => {
		return localforage.clear()
	}

	/**
	 * UI
	 */
	toggle = () : void => {
		this.setState({ modal: !this.state.modal })
	}

	submit = (ev : any): void => {
		this.enslogin(ev.target.value)
		.then(() => {})
		.catch(() => {})
	}

	// Render
	render = () => {
		return (
			<div id='LoginWithEthereum' className={ this.props.className || '' }>
				{
					this.state.provider
					? <button onClick={ this.disconnect }>Disconnect</button>
					: <button onClick={ this.connect    }>Login with Ethereum</button>
				}
				<MDBModal isOpen={ this.state.modal } toggle={ this.toggle } centered>
					<MDBModalBody>
						<MDBInput onChange={ this.submit } label='username'>
						</MDBInput>
						<a href='https://get-an-enslogin.com' target='_blank' rel='noopener noreferrer' className='d-block w-100 text-right small'>
							Get an ENS Login
						</a>
					</MDBModalBody>
				</MDBModal>
			</div>
		)
	}
}
