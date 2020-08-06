# ENS Login - Login With Ethereum Button

The Login With Ethereum Button is an ENS Login solution the that integrate all wallets in a single react component

## Installation

```
yarn add @enslogin/login-with-ethereum
```

## Setting up on your Dapp

```
import LoginWithEthereum from '@enslogin/login-with-ethereum'
const config = {
	provider:
	{
		network: 'goerli',
	},
	ipfs:{
		host: 'ipfs.infura.io',
		port: 5001,
		protocol: 'https',
	}
}

<LoginWithEthereum config={config} ...options/>

```

## Options

- **config:** (mandatory)
	ENSLogin config file (see @enslogin/sdk)

- **connect:** (function, default=null)
	Function that will be called when upon successfull connection. The provider is passed as an argument.

- **disconnect:** (function, default=null)
	Function that will be called when upon disconnection.

- **noCache:** (boolean, defaut=false)
	Bypass the cache, will ask the user to reconnect everytime *recommanded to leave untouched, for debuging only*

- **noInjected:** (boolean, defaut=false)
	By default LoginWithEthereum looks for an injected web3 provider before using ENSLogin. Setting this options will skip that step and move directly to ENSLogin.

-- **customSection** (optional)
	If you pass component, you can override the section where it has the list of provider icons