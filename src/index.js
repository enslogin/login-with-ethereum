import React from 'react';
import ReactDOM from 'react-dom';

import LoginWithEthereum from './components/LoginWithEthereum';

import config from './config/config';

ReactDOM.render(<LoginWithEthereum
	config={ config }
	connect={ (provider) => { console.info('connected:', provider) } }
	disconnect={ () => { console.info('disconnect') } }
	// noCache
	noInjected
/>, document.getElementById('app'));
