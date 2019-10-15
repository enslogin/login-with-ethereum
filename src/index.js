import React from 'react';
import ReactDOM from 'react-dom';

import LoginWithEthereum from './components/LoginWithEthereum';

import config from './config/config';

const extendedconfig = {
	...config,
	__callbacks: {
		resolved: (username, addr, descr) => {
			console.info(`Resolved ${username} (${addr}): ${descr}`);
		},
		loading: (protocol, path) => {
			console.info(`Loading ${protocol}://${path} ...`);
		},
		loaded: (protocol, path) => {
			console.info(`${protocol}://${path} loaded`);
		}
	}
}

function connected(provider)
{
	console.info('→ connected')
	provider.enable()
	.then(console.info)
	.catch(console.error)
}
function disconnected()
{
	console.info('→ disconnected')
}

ReactDOM.render(
	<LoginWithEthereum
		config={extendedconfig}
		connect={connected}
		disconnect={disconnected}
		// noCache
		noInjected
	/>,
	document.getElementById('app')
);
