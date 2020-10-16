/// <reference types="mocha" />
export interface UserNetworksConfig {
    hardhat?: UserHardhatNetworkConfig;
    [networkName: string]: UserNetworkConfig | undefined;
}
export declare type UserNetworkConfig = UserHardhatNetworkConfig | UserHttpNetworkConfig;
export interface UserHardhatNetworkConfig {
    chainId?: number;
    from?: string;
    gas?: "auto" | number;
    gasPrice?: "auto" | number;
    gasMultiplier?: number;
    hardfork?: string;
    accounts?: UserHardhatNetworkAccountsConfig;
    blockGasLimit?: number;
    throwOnTransactionFailures?: boolean;
    throwOnCallFailures?: boolean;
    allowUnlimitedContractSize?: boolean;
    initialDate?: string;
    loggingEnabled?: boolean;
    forking?: UserHardhatNetworkForkingConfig;
}
export declare type UserHardhatNetworkAccountsConfig = UserHardhatNetworkAccountConfig[] | UserHardhatNetworkHDAccountsConfig;
export interface UserHardhatNetworkAccountConfig {
    privateKey: string;
    balance: string;
}
export interface UserHardhatNetworkHDAccountsConfig {
    mnemonic?: string;
    initialIndex?: number;
    count?: number;
    path?: string;
    accountsBalance?: string;
}
export interface UserHDAccountsConfig {
    mnemonic: string;
    initialIndex?: number;
    count?: number;
    path?: string;
}
export interface UserHardhatNetworkForkingConfig {
    enabled?: boolean;
    url: string;
    blockNumber?: number;
}
export declare type UserHttpNetworkAccountsConfig = "remote" | string[] | UserHDAccountsConfig;
export interface UserHttpNetworkConfig {
    chainId?: number;
    from?: string;
    gas?: "auto" | number;
    gasPrice?: "auto" | number;
    gasMultiplier?: number;
    url?: string;
    timeout?: number;
    httpHeaders?: {
        [name: string]: string;
    };
    accounts?: UserHttpNetworkAccountsConfig;
}
export interface NetworksConfig {
    hardhat: HardhatNetworkConfig;
    localhost: HttpNetworkConfig;
    [networkName: string]: NetworkConfig;
}
export declare type NetworkConfig = HardhatNetworkConfig | HttpNetworkConfig;
export interface HardhatNetworkConfig {
    chainId: number;
    from?: string;
    gas: "auto" | number;
    gasPrice: "auto" | number;
    gasMultiplier: number;
    hardfork: string;
    accounts: HardhatNetworkAccountsConfig;
    blockGasLimit: number;
    throwOnTransactionFailures: boolean;
    throwOnCallFailures: boolean;
    allowUnlimitedContractSize: boolean;
    initialDate?: string;
    loggingEnabled: boolean;
    forking?: HardhatNetworkForkingConfig;
}
export declare type HardhatNetworkAccountsConfig = HardhatNetworkAccountConfig[];
export interface HardhatNetworkAccountConfig {
    privateKey: string;
    balance: string;
}
export interface HardhatNetworkForkingConfig {
    enabled: boolean;
    url: string;
    blockNumber?: number;
}
export interface HttpNetworkConfig {
    chainId?: number;
    from?: string;
    gas: "auto" | number;
    gasPrice: "auto" | number;
    gasMultiplier: number;
    url: string;
    timeout: number;
    httpHeaders: {
        [name: string]: string;
    };
    accounts: HttpNetworkAccountsConfig;
}
export declare type HttpNetworkAccountsConfig = "remote" | string[] | HttpNetworkHDAccountsConfig;
export interface HttpNetworkHDAccountsConfig {
    mnemonic: string;
    initialIndex: number;
    count: number;
    path: string;
}
export interface UserProjectPaths {
    root?: string;
    cache?: string;
    artifacts?: string;
    sources?: string;
    tests?: string;
}
export interface ProjectPaths {
    root: string;
    configFile: string;
    cache: string;
    artifacts: string;
    sources: string;
    tests: string;
}
export declare type UserSolidityConfig = string | UserSolcConfig | UserMultiSolcConfig;
export interface UserSolcConfig {
    version: string;
    settings?: any;
}
export interface UserMultiSolcConfig {
    compilers: UserSolcConfig[];
    overrides?: Record<string, UserSolcConfig>;
}
export interface SolcConfig {
    version: string;
    settings: any;
}
export interface SolidityConfig {
    compilers: SolcConfig[];
    overrides: Record<string, SolcConfig>;
}
export interface UserHardhatConfig {
    defaultNetwork?: string;
    paths?: UserProjectPaths;
    networks?: UserNetworksConfig;
    solidity?: UserSolidityConfig;
    mocha?: Mocha.MochaOptions;
}
export interface HardhatConfig {
    defaultNetwork: string;
    paths: ProjectPaths;
    networks: NetworksConfig;
    solidity: SolidityConfig;
    mocha: Mocha.MochaOptions;
}
export declare type ConfigExtender = (config: HardhatConfig, userConfig: Readonly<UserHardhatConfig>) => void;
//# sourceMappingURL=config.d.ts.map