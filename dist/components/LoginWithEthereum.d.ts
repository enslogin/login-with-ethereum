import * as React from "react";
import { types } from '@enslogin/sdk';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import '../css/LoginWithEthereum.css';
declare global {
    interface Window {
        ethereum?: types.provider;
    }
}
export interface Props {
    config: types.config;
    connect?: (provider: types.provider) => void;
    disconnect?: () => void;
    noCache?: boolean;
    noInjected?: boolean;
    startVisible?: boolean;
    className?: string;
}
export interface State {
    provider?: types.provider;
    modal?: boolean;
    loading?: boolean;
    details?: string;
}
export interface Cache {
    module: string;
    details?: any;
}
export declare class LoginWithEthereum extends React.Component<Props, State> {
    state: State;
    componentDidMount: () => void;
    setProvider: (provider: types.provider) => Promise<void>;
    clearProvider: () => Promise<void>;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    walletconnect: () => Promise<void>;
    enslogin: (username: string) => Promise<void>;
    setCache: (value: Cache) => Promise<Cache>;
    getCache: () => Promise<Cache>;
    clearCache: () => Promise<void>;
    toggle: () => void;
    submit: (ev: any) => void;
    render: () => JSX.Element;
}
