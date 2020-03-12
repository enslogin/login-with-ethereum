import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
	MDBBtn,
	MDBIcon,
	MDBInput,
	MDBModal,
	MDBModalBody,
	MDBModalHeader,
} from 'mdbreact';

import { ethers } from 'ethers';
import IERC20 from 'openzeppelin-solidity/build/contracts/IERC20.json'

class TransferModal extends Component
{
	state = {
		modal: false,
	}

	toggle = () => {
		this.setState({ modal: !this.state.modal });
	}

	toAddress = async (address) => {
		try
		{
			return ethers.utils.getAddress(address);
		}
		catch (e)
		{
			return false;
			// return this.props.services.sdk.resolveName(address);
		}
	}

	transfer = async (ev) => {
		ev.preventDefault();

		const dest  = ev.target.dest.value;
		const value = ev.target.value.value;
		const to    = (await this.toAddress(dest));
		const from  = (await this.props.services.web3.eth.getAccounts())[0];

		if (!to)
		{
			this.props.services.emitter.emit('Notify', 'error', 'Failled to resolve destination address');
			return;
		}
		if (value === "")
		{
			this.props.services.emitter.emit('Notify', 'error', 'Missing arguments');
			return;
		}

		const amount = Math.floor(parseFloat(value)*10**this.props.asset[4]).toString();

		this.props.services.web3.eth.sendTransaction(this.props.asset[0] ? {
			from:  from,
			to:    this.props.asset[0],
			value: 0,
			data:  new ethers.utils.Interface(IERC20.abi).functions.transfer.encode([ to, amount ]),
		} : {
			from:  from,
			to:    to,
			value: amount,
		})
		.then ((nonce) => {
			this.setState({ modal: false });
			this.props.services.emitter.emit('Notify', 'success', 'Transaction succesfull');
			this.props.services.emitter.emit('tx');
		})
		.catch((e) => {
			this.props.services.emitter.emit('Notify', 'error', `Error during transaction ${e}`);
			console.error(e);
		});
	}

	render()
	{
		return (
			<>
				<a href="#!" onClick={this.toggle.bind(this)}>
					<MDBIcon icon="paper-plane" className="ml-1" />
				</a>
				<MDBModal isOpen={this.state.modal} toggle={this.toggle.bind(this)} centered>
					<MDBModalHeader toggle={this.toggle.bind(this)}>
						Send {this.props.asset[1]}
					</MDBModalHeader>
					<MDBModalBody>
						<form onSubmit={this.transfer.bind(this)}>
							<MDBInput label="to"  name="dest"/>
							<MDBInput label={"value ("+this.props.asset[2]+")"} name="value"/>
							<button gradient="blue" className="m-3 py-2" type="submit">
								Send
								<MDBIcon icon="paper-plane" className="ml-1" />
							</button>
						</form>
					</MDBModalBody>
				</MDBModal>
			</>
		);
	}
}

TransferModal.propTypes =
{
	services: PropTypes.object,
};

export default TransferModal;
