import React from 'react';
import ReactDom from 'react-dom';

import LoginWithEthereum from '../../src';

const connect = async (provider) =>
{
	console.log('connect');
	provider.send({ method: 'eth_chainId'  }, (err, { result }) => console.log('eth_chainId:',  result));
	provider.send({ method: 'eth_accounts' }, (err, { result }) => console.log('eth_accounts:', result));
}
const disconnect = async () =>
{
	console.log('disconnect');
}

const App = () =>
	<LoginWithEthereum
		config={{ provider: { network: 'goerli' } }}
		connect={connect}
		disconnect={disconnect}
		noCache={true}
		noInjected={true}
		startVisible={true}
		// networks={[
		// 	{'name': 'ropsten' },
		// 	{'name': 'rinkeby' },
		// 	{'name': 'goerli'  },
		// 	{'name': 'kovan'   },
		// ]}
	/>;

ReactDom.render(<App/>, document.getElementById('root'));
