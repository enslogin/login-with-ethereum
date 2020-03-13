import * as React from "react"
import { MDBIcon, MDBInput, MDBModal } from 'mdbreact';

import { ENSLoginSDK, types } from '@enslogin/sdk';
// import WalletConnectProvider from '@walletconnect/web3-provider';

import ClipLoader  from 'react-spinners/ClipLoader';
import LocalForage from 'localforage';

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
	config        : types.config;
	connect      ?: (provider: types.provider) => void;
	disconnect   ?: () => void;
	noCache      ?: boolean;
	noInjected   ?: boolean;
	startVisible ?: boolean;
	className    ?: string;
}

export interface State
{
	provider ?: types.provider;
	modal    ?: boolean;
	loading  ?: boolean;
	details  ?: string;
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
	state: State = {}

	/**
	 * component configuration
	 */
	componentDidMount = () : void => {
		this.props.config.__callbacks = this.props.config.__callbacks || {}


		const super_resolved = this.props.config.__callbacks.resolved
		this.props.config.__callbacks.resolved = (username, addr, descr) => {
			this.setState({ details: 'username resolved' }, () => {
				if (super_resolved) super_resolved(username, addr, descr)
			})
		}

		const super_loading = this.props.config.__callbacks.loading
		this.props.config.__callbacks.loading = (protocol, path) => {
			this.setState({ details: 'fetching wallet' }, () => {
				if (super_loading) super_loading(protocol, path)
			})
		}

		const super_loaded = this.props.config.__callbacks.loaded
		this.props.config.__callbacks.loaded = (protocol, path) => {
			this.setState({ details: 'instanciating wallet' }, () => {
				if (super_loaded) super_loaded(protocol, path)
			})
		}

		this.setState({ modal: this.props.startVisible })
	}

	/**
	 * State (provider) management
	 */
	setProvider = (provider: types.provider): Promise<void> => {
		return new Promise((resolve, reject) => {
			this.setState({
				provider,
				modal:    false,
				loading:  false,
			}, () => {
				if (this.props.connect) this.props.connect(provider)
				resolve()
			})
		})
	}

	clearProvider = (): Promise<void> => {
		return new Promise((resolve, reject) => {
			this.setState({
				provider: undefined,
				modal:    this.props.startVisible,
				loading:  false,
			}, () => {
				if (this.props.disconnect) this.props.disconnect()
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
						return // connection established → return
					}

					case 'walletconnect':
					{
						await this.walletconnect()
						return // connection established → return
					}

					default:
						console.error(`Unsuported module ${cache.module}`)
						break // no connection → skip
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
				return // connection established → return
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
				reject('walletconnect no supported yet')
				// TODO WalletConnect
				// // connect using walletconnect
				// let provider: types.provider = new WalletConnectProvider({ infuraId: this.state.config._infura?.key || "27e484dcd9e3efcfd25a83a78777cdf1" }) // TODO infura
				// provider.disable = provider.close // to make it compatible with the disconnect function
				//
				// // enable provider
				// await provider.enable()
				//
				// // set provider
				// await this.setProvider(provider)
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
				// show loading (forces modal up)
				this.setState({ loading: true, details: undefined })

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
			finally
			{
				// clears loading
				this.setState({ loading: false, details: undefined })
			}
		})
	}

	/**
	 * Cache tooling
	 */
	setCache = (value: Cache): Promise<Cache> => {
		return LocalForage.setItem(STORE, value, (err) => !!err)
	}

	getCache = (): Promise<Cache> => {
		return LocalForage.getItem(STORE, (value, err) => (err ? null : value))
	}

	clearCache = (): Promise<void> => {
		return LocalForage.clear()
	}

	/**
	 * UI
	 */
	toggle = () : void => {
		this.setState({ modal: !this.state.modal })
	}

	submit = (ev : any): void => {
		ev.preventDefault()
		this.enslogin(ev.target.username.value)
		.then(() => {})
		.catch(console.error)
	}

	// Render
	render = () => {
		return (
			<>
				<div id='LoginWithEthereum-Button' className={ this.props.className || '' }>
					{
						this.state.provider
						? <button onClick={ this.disconnect }>Disconnect</button>
						: <button onClick={ this.connect    }>Login with Ethereum</button>
					}
				</div>

				<MDBModal id='LoginWithEthereum-Modal' isOpen={ this.state.modal || this.state.loading } toggle={ this.toggle } centered>

					<ul className="nav nav-tabs d-flex">
						<li className="nav-item flex-auto text-center">
							<a className="nav-link active">
								Login
							</a>
						</li>
						<li className="nav-item flex-auto text-center">
							<a className="nav-link text-muted" href='https://get-an-enslogin.com' target='_blank' rel='noopener noreferrer'>
								Sign-up
							</a>
						</li>
					</ul>

					<div className="m-5" >

						{
							!this.state.loading &&
							<form onSubmit={ this.submit }>
								<MDBInput outline name='username' label='username' className="m-0"/>
								<a className="inline-embeded" href="#" onClick={ this.walletconnect }>
									<MDBIcon icon="qrcode"/>
								</a>
							</form>
						}
						{
							this.state.loading &&
							<div className='d-flex align-items-center text-muted mx-2'>
								<span className='flex-auto font-weight-bolder'>
									Loading { this.state.details && `(${this.state.details})` } ...
								</span>
								<ClipLoader size={ '1.5em' } color={ '#6c757d' }/>
							</div>
						}

					</div>

					{
						false &&
						<div className="d-flex justify-content-center mx-5 mb-3">
							<a href="#" onClick={ () => this.enslogin('authereum.enslogin.eth') }>
								<img height="30px" className="rounded mx-2" src="https://miro.medium.com/fit/c/160/160/1*w__iPpsW58dKOv7ZU4tD2A.png"/>
							</a>
							<a href="#" onClick={ () => this.enslogin('metamask.enslogin.eth') }>
								<img height="30px" className="rounded mx-2" src="https://betoken.fund/iao/semantic/dist/themes/default/assets/images/metamask-big.png"/>
							</a>
							<a href="#" onClick={ () => this.enslogin('portis.enslogin.eth') }>
								<img height="30px" className="rounded mx-2" src="https://wallet.portis.io/805b29212ec4c056ac686d150789aeca.svg"/>
							</a>
							<a href="#" onClick={ () => this.enslogin('torus.enslogin.eth') }>
								<img height="30px" className="rounded mx-2" src="https://gblobscdn.gitbook.com/spaces%2F-LcdiG7_Iag-nhSbPQK2%2Favatar.png"/>
							</a>
						</div>
					}

				</MDBModal>

			</>
		)
	}
}
