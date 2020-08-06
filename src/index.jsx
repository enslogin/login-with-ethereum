import React from 'react';
import PropTypes from 'prop-types';

import { MDBIcon, MDBInput, MDBModal, MDBModalBody } from 'mdbreact';
import CircleLoader    from 'react-spinners/CircleLoader';
import LocalForage     from 'localforage';
import _               from 'lodash';
import { ENSLoginSDK } from '@enslogin/sdk';

import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import './index.css';

const STORE = 'login-with-ethereum-cache';

class LoginWithEthereum extends React.Component
{
	state = {}

	/**
	 * component configuration
	 */
	componentDidMount = () => this.setState(
		{
			config: _.defaultsDeep(
				this.props.config,
				{
					provider:
					{
						network: this.props.networks && this.props.networks.find(Boolean).name
					},
					__callbacks:
					{
						resolved: (username, addr, descr) => this.setState(
							{ details: 'username resolved' },
							() => this.props.config.__callbacks.resolved && this.props.config.__callbacks.resolved(username, addr, descr)
						),

						loading: (protocol, path) => this.setState(
							{ details: 'fetching wallet' },
							() => this.props.config.__callbacks.loading && this.props.config.__callbacks.loading(protocol, path)
						),

						loaded: (protocol, path) => this.setState(
							{ details: 'instanciating wallet' },
							() => this.props.config.__callbacks.loaded && this.props.config.__callbacks.loaded(protocol, path)
						),
					}
				}
			)
		},
		() => this.props.startVisible && this.setState({ modal: true }, this.connect)
	)

	/**
	 * State (provider) management
	 */
	setProvider = (provider) => new Promise((resolve, reject) => {
		this.setState({
			provider,
			modal:   false,
			loading: false,
		}, () => {
			this.props.connect && this.props.connect(provider);
			provider.on('accountsChanged', (accounts) => (accounts.length === 0) && this.disconnect());
			resolve();
		});
	})

	clearProvider = () => new Promise((resolve, reject) => {
		this.setState({
			provider: undefined,
			modal:    this.props.startVisible,
			loading:  false,
		}, () => {
			this.props.disconnect && this.props.disconnect();
			resolve();
		})
	})

	/**
	 * Connect / Disconnect
	 */
	connect = async () => {
		let cache    = !this.props.noCache    && await this.getCache();
		let injected = !this.props.noInjected && window.ethereum;

		if (cache)
		{
			try
			{
				await this.enslogin(cache);
				return;
			}
			catch
			{
				console.warn(`Failed to load from cache: ${cache}`)
			}
		}

		if (injected)
		{
			try
			{
				injected.enable && await injected.enable();
				await this.setProvider(injected);
				return;
			}
			catch {}
		}

		this.setState({ modal: true });
	}

	disconnect = async () => {
		this.state.provider.disable && await this.state.provider.disable();
		await this.clearCache();
		await this.clearProvider();
	}

	/**
	 * Provider instanciation mechanism - EnsLogin
	 */
	enslogin = (username) => new Promise(async (resolve, reject) => {
		try
		{
			// show loading
			this.setState({ loading: true, details: undefined });

			// connect with enslogin's sdk
			console.info('trying enlogin connect with:', username, this.state.config);
			let provider = await ENSLoginSDK.connect(username, this.state.config);
			provider.enable && await provider.enable();

			// set provider
			await this.setProvider(provider);

			// set cache
			!this.props.noCache && this.setCache(username);

			// done
			resolve();
		}
		catch (error)
		{
			await this.clearCache();
			reject(error);
		}
		finally
		{
			this.setState({ loading: false, details: undefined });
		}
	})

	/**
	 * Cache tooling
	 */
	setCache   = (value) => LocalForage.setItem(STORE, value, (err) => !!err);
	getCache   = ()      => LocalForage.getItem(STORE, (value, err) => (err ? null : value));
	clearCache = ()      => LocalForage.clear();

	/**
	 * UI
	 */
	toggle = () => {
		this.setState({ modal: !this.state.modal });
	}

	submit = (ev) => {
		ev.preventDefault();
		this.enslogin(ev.target.username.value)
		.then(() => {})
		.catch(console.error);
	}

	/**
	 * Render
	 */
	render = () =>
		<>
			<div id='LoginWithEthereum-Button' className={ this.props.className }>
				{
					this.state.provider
					? <button onClick={ this.disconnect }>Disconnect</button>
					: <button onClick={ this.connect    }>Login with Ethereum</button>
				}
			</div>

			<MDBModal
				id='LoginWithEthereum-Modal'
				isOpen={ this.state.modal || this.state.loading }
				toggle={ this.toggle }
				centered
			>
				<ul className='nav nav-tabs d-flex'>
					<li className='nav-item flex-1 text-center'>
						<span className='nav-link active'>
							Login
						</span>
					</li>
					<li className='nav-item flex-1 text-center'>
						<a className='nav-link text-muted' href='https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2525.md' target='_blank' rel='noopener noreferrer'>
							About ENSLogin
						</a>
					</li>
				</ul>

				<MDBModalBody className='m-5'>
					{
						!this.state.loading &&
						<form onSubmit={ this.submit }>
							<div className='d-flex'>
								{
									this.props.networks &&
										<select
											className='md-form md-outline'
											defaultValue={ this.state.config && this.state.config.provider.network }
											onChange={ (ev) => this.state.config.provider.network = ev.target.value }
										>
										{
											this.props.networks.map(({name, endpoint}, i) => <option key={i} value={ endpoint || name }>{name}</option>)
										}
										</select>
								}
								<MDBInput outline name='username' label='username' className='m-0'>
									<MDBIcon icon='qrcode' className='input-embeded pointer-hover text-muted' onClick={ () => this.enslogin('walletconnect.enslogin.eth') }/>
								</MDBInput>
							</div>
							<small className='form-text text-muted ml-1'>
								Enter your username and press [enter].
							</small>
						</form>
					}
					{
						this.state.loading &&
						<div className='d-flex align-items-center text-muted mx-2'>
							<span className='flex-auto text-center font-weight-bolder'>
								Loading { this.state.details && `(${this.state.details})` }
							</span>
							<span className='inline-embeded'>
								<CircleLoader size='1.5em' color='#6c757d'/>
							</span>
						</div>
					}
				</MDBModalBody>

				{
					!this.state.loading && (
						this.props.customSection? (this.props.customSection) : (
							<div className='d-flex justify-content-center mx-5 mb-3'>
							<span className='pointer-hover' onClick={ () => this.enslogin('metamask.enslogin.eth') }>
								<img alt='metamask' height='30px' className='rounded mx-2' src='https://betoken.fund/iao/semantic/dist/themes/default/assets/images/metamask-big.png'/>
							</span>
							<span className='pointer-hover' onClick={ () => this.enslogin('authereum.enslogin.eth') }>
								<img alt='authereum' height='30px' className='rounded mx-2' src='https://miro.medium.com/fit/c/160/160/1*w__iPpsW58dKOv7ZU4tD2A.png'/>
							</span>
							<span className='pointer-hover' onClick={ () => this.enslogin('portis.enslogin.eth') }>
								<img alt='portis' height='30px' className='rounded mx-2' src='https://pbs.twimg.com/profile_images/979366213817176064/BvhTIDm0_400x400.jpg'/>
							</span>
							</div>
						)
					)
				}
			</MDBModal>
		</>
}

LoginWithEthereum.propTypes = {
	config:       PropTypes.object,
	networks:     PropTypes.array,
	connect:      PropTypes.func,
	disconnect:   PropTypes.func,
	noCache:      PropTypes.bool,
	noInjected:   PropTypes.bool,
	startVisible: PropTypes.bool,
	className:    PropTypes.string,
}

LoginWithEthereum.defaultProps = {
	config: {
		provider: {
			network: 'ropsten',
		},
		ipfs: {
			host: 'ipfs.infura.io',
			port: 5001,
			protocol: 'https',
		},
	},
	noCache:      false,
	noInjected:   false,
	startVisible: false,
	className:    '',
}

export default LoginWithEthereum;
