import React, { Component } from "react";
import {EventEmitter} from 'fbemitter';
import Web3 from 'web3';

import LoginWithEthereum from '../../lib';

import Notifications from './Notifications';
import Loading       from './Loading';
import Main          from './Main';
import config        from '../config/config';

class App extends Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			loading: false,
			provider: null,
			web3: null,
			emitter: new EventEmitter(),
			config: {
				...config,
				__callbacks:
				{
					resolved: (username, addr, descr) => {
						console.info(`Resolved ${username} (${addr}) ${descr}`);
						this.state.emitter.emit("Notify", "info", `Connecting to ${username}`)
						this.setState({ loading: true })
					},
					loading: (protocol, path) => {
						console.info(`Loading ${protocol}://${path} ...`);
						this.setState({ loading: true })
					},
					loaded: (protocol, path) => {
						console.info(`${protocol}://${path} loaded`);
						this.setState({ loading: true })
					}
				}
			}
		}
	}

	connect = (provider) => {
		this.state.emitter.emit("Notify", "success", "You are connected")
		this.setState({
			provider,
			web3: new Web3(provider),
			loading: false,
		})
	}

	disconnect = () => {
		this.state.emitter.emit("Notify", "warning", "You are disconnect")
		this.setState({
			provider: null,
			web3: null,
		})
	}

	render = () => {
		return (
			<>
				{ this.state.loading && <Loading/> }
				<Notifications emitter={this.state.emitter}/>
				<LoginWithEthereum
					className  = { this.state.provider ? 'connected' : '' }
					config     = { this.state.config }
					connect    = { this.connect }
					disconnect = { this.disconnect }
					noInjected = { true  }
					noCache    = { false }
				/>
				{ this.state.provider && <Main services={this.state}/> }
			</>
		);
	}
}

export default App;
