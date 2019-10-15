import React from 'react';
import PropTypes from 'prop-types';

import {
	MDBBtn,
	MDBIcon,
	MDBInput,
	MDBModal,
	MDBModalBody,
} from 'mdbreact';

import ENSLoginSDK from '@enslogin/sdk';
import localforage from 'localforage';

// import ethereum from '../assets/ethereum.svg';

import '@fortawesome/fontawesome-free/css/all.min.css';
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

	componentDidMount = () => {
		if (!this.props.noCache)
		{
			this.loadLogin().then(this.connect)
		}
	}

	// Connect/Disconnect
	connect = (username) => {
		ENSLoginSDK.connect(username, this.props.config)
		.then((provider) => {
			this.setState({ provider, display: false })
			if (!this.props.noCache)
			{
				this.saveLogin(username)
			}
			if (this.props.connect)
			{
				this.props.connect(provider)
			}
			console.log('Connected with', username)
		})
		.catch(() => {
			this.disconnect()
		})
	}

	disconnect = () => {
		this.clearLogin().then(() => {
			this.setState({ provider: null })
			if (this.props.disconnect)
			{
				this.props.disconnect()
			}
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
		this.connect(ev.target.value)
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
						<MDBBtn onClick={ this.toggle } color='blue' className='btn-sm'>
							<MDBIcon icon='paper-plane' className='mr-2' />
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
