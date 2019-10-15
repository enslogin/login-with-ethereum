import React from 'react';

import LoginWithEthereum from './LoginWithEthereum';
import Loading from './Loading';

import config from '../config/config';


class App extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			loading: false,
		};

		this.extendedconfig = {
			...config,
			__callbacks: {
				resolved: (username, addr, descr) => {
					console.info(`Resolved ${username} (${addr}): ${descr}`);
				},
				loading: (protocol, path) => {
					console.info(`Loading ${protocol}://${path} ...`);
					this.setState({ loading: true })
				},
				loaded: (protocol, path) => {
					console.info(`${protocol}://${path} loaded`);
					this.setState({ loading: false })
				}
			}
		}
	}

	connected = (provider) => {
		console.info('→ connected')
		console.info(provider)
	}

	disconnected = () => {
		console.info('→ disconnected')
	}

	render = () => {
		return (
			<>
				{
					this.state.loading && <Loading/>
				}
				<LoginWithEthereum
					config={this.extendedconfig}
					connect={this.connected}
					disconnect={this.disconnected}
					// noCache
					noInjected
				/>
			</>
		);
	}
}

export default App;
