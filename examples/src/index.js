import React from 'react';
import ReactDom from 'react-dom';

import LoginWithEthereum from '../../src';

const App = () =>
	<LoginWithEthereum
		connect={console.log}
		disconnect={console.log}
	/>;

ReactDom.render(<App/>, document.getElementById('root'));
