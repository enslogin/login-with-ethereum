import React from 'react';
import PropTypes from 'prop-types';

import {
	MDBBtn,
	MDBInput,
	MDBModal,
	MDBModalBody,
} from 'mdbreact';

import ENSLoginSDK from '@enslogin/sdk';
import localforage from 'localforage';

import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import '../css/LoginWithEthereum.css';

const USERNAME_STORE = 'enslogin-username';

class LoginWithEthereum extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			display: false,
			provider: null,
		};
	}

	setProvider = (provider) => {
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

	clearProvider = (provider) => {
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

	autoconnect = () => {
		return new Promise((resolve, reject) => {
			if (!this.props.noCache)
			{
				this.loadLogin()
				.then((username) => {
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

	tryConnect = (username) => {
		return new Promise((resolve, reject) => {
			ENSLoginSDK.connect(username, this.props.config)
			.then((provider) => {
				this.setProvider(provider)
				.then(() => {
					if (!this.props.noCache)
					{
						this.saveLogin(username)
					}
					this.setState({ display: false }, () => {
						resolve()
					})
				})
				.catch(reject)
			})
			.catch(() => {
				this.clearLogin().then(reject).catch(reject)
			})
		})
	}

	connect = () => {
		this.autoconnect()
		.then(() => {})
		.catch(() => {
			if (!this.props.noInjected && window && window.ethereum)
			{
				window.ethereum.enable()
				.then(() => {
					this.setProvider(window.ethereum)
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

	disconnect = () => {
		return new Promise((resolve, reject) => {
			if (this.provider && this.provider.disconnect)
			{
				this.provider.disconnect()
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
	saveLogin = (username) => {
		return localforage.setItem(USERNAME_STORE, username, (err) => !!err)
	}

	loadLogin = () => {
		return localforage.getItem(USERNAME_STORE, (value, err) => (err ? null : value))
	}

	clearLogin = () => {
		return localforage.clear()
	}

	// UI
	toggle = () => {
		this.setState({ display: !this.state.display })
	}

	submit = (ev) => {
		this.tryConnect(ev.target.value)
		.then(() => {})
		.catch(() => {})
	}

	render = () => {
		return (
			<div name='LoginWithEthereum'>
				{
					this.state.provider
					?
						<MDBBtn onClick={ this.disconnect } color='blue' className='btn-sm'>
							Disconnect
						</MDBBtn>
					:
						<MDBBtn onClick={ this.connect } color='blue' className='btn-sm'>
							Login with Ethereum
						</MDBBtn>
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

LoginWithEthereum.propTypes =
{
	services: PropTypes.object
};

export default LoginWithEthereum;
