import React from 'react';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import '../css/LoginWithEthereum.css';
import { config } from '@enslogin/sdk/lib/types/config';
import { provider } from '@enslogin/sdk/lib/types/ethereum';
export interface providerExtended extends provider {
    enable?: () => Promise<void>;
    disable?: () => Promise<void>;
}
declare global {
    interface Window {
        ethereum?: providerExtended;
    }
}
export interface LoginWithEthereumProps {
    config: config;
    connect?: (provider: providerExtended) => void;
    disconnect?: () => void;
    noCache?: boolean;
    noInjected?: boolean;
}
export interface LoginWithEthereumState {
    display?: boolean;
    provider?: providerExtended;
}
export declare class LoginWithEthereum extends React.Component<LoginWithEthereumProps, LoginWithEthereumState> {
    constructor(props: any);
    setProvider: (provider: providerExtended) => Promise<void>;
    clearProvider: () => Promise<void>;
    autoconnect: () => Promise<void>;
    tryConnect: (username: string) => Promise<void>;
    connect: () => void;
    disconnect: () => Promise<void>;
    saveLogin: (username: string) => Promise<string>;
    loadLogin: () => Promise<string>;
    clearLogin: () => Promise<void>;
    toggle: () => void;
    submit: (ev: any) => void;
    render: () => JSX.Element;
}
