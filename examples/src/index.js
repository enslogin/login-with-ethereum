import React from 'react';
import ReactDom from 'react-dom';

import LoginWithEthereum from '../../dist';

const params_eth_sign = (accounts, chainId) => [
	accounts[0],
	'0x68656c6c6f2c20776f726c6421',
];
const params_eth_signTypedData_v3 = (accounts, chainId) => [
	accounts[0],
	JSON.stringify({
		types:
		{
			EIP712Domain:
			[
				{ type: 'string',  name: 'name'    },
				{ type: 'string',  name: 'version' },
				{ type: 'uint256', name: 'chainId' },
			],
			Message:
			[
				{ type: 'address', name: 'from'    },
				{ type: 'string',  name: 'message' },
			],
		},
		primaryType: 'Message',
		domain:
		{
			name:    'MessageProtocol',
			version: '0.0.1',
			chainId: chainId,
		},
		message:
		{
			from:    accounts[0],
			message: 'Hello, world!',
		}
	}),
];

const App = () =>
{
	const [ provider, setProvider ] = React.useState(null);
	const [ chainId,  setChainId  ] = React.useState(0);
	const [ accounts, setAccounts ] = React.useState([]);

	React.useEffect(() => {
		const configure = () => {
			provider.send({ method: 'eth_chainId'  }, (err, { result }) => setChainId(result));
			provider.send({ method: 'eth_accounts' }, (err, { result }) => setAccounts(result));
		}
		if (provider)
		{
			configure();
			provider.on('accountsChanged', configure);
			provider.on('networkChanged',  configure);
		}
	}, [ provider ])

	const methods = {
		eth_sign:          () => provider.send({ method: 'eth_sign',             params: params_eth_sign(accounts, chainId)             }, (err, { result }) => err ? console.error(err) : console.log('eth_sign:',             result)),
		personal_sign:     () => provider.send({ method: 'personal_sign',        params: params_eth_sign(accounts, chainId)             }, (err, { result }) => err ? console.error(err) : console.log('personal_sign:',        result)),
		eth_signTypedData: () => provider.send({ method: 'eth_signTypedData_v3', params: params_eth_signTypedData_v3(accounts, chainId) }, (err, { result }) => err ? console.error(err) : console.log('eth_signTypedData_v3:', result)),
	}

	return (
		<>

			<LoginWithEthereum
				config={{
					provider: {
						resolutionNetwork: 'goerli',
					},
					__callbacks: {
						resolved: (username, addr, descr) => console.info(`[resolved] ${username} → ${descr}`),
						loading:  (protocol, path       ) => console.info(`[loading]  ${protocol}://${path}`),
						loaded:   (protocol, path       ) => console.info(`[loaded]   ${protocol}://${path}`),
					},
				}}
				connect      = { (provider) => setProvider(provider) }
				disconnect   = { ()         => setProvider(null)     }
				noCache      = { true }
				noInjected   = { true }
				startVisible = { true }
				networks     = {[
					{ name: 'mainnet' },
					{ name: 'ropsten' },
					{ name: 'rinkeby' },
					{ name: 'goerli'  },
					{ name: 'kovan'   },
				]}
			/>

			{
				provider &&
				<ul>
					<li>
						<b>chainId:</b> { chainId }
					</li>
					<li>
						<b>accounts:</b> { JSON.stringify(accounts) }
					</li>
					{
						Object.entries(methods).map(([ method, func ], i) => <li key={i}><b>test:</b> method <a href='#' onClick={func}><code>{method}</code></a></li>)
					}
				</ul>
			}

		</>
	);
}

ReactDom.render(<App/>, document.getElementById('root'));
