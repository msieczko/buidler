import type { Artifacts, BoundExperimentalHardhatNetworkMessageTraceHook, EIP1193Provider, EthereumProvider, NetworkConfig, ProjectPaths, UserHDAccountsConfig, UserHttpNetworkAccountsConfig } from "../../../types";
export declare function isHDAccountsConfig(accounts?: UserHttpNetworkAccountsConfig): accounts is UserHDAccountsConfig;
export declare function createProvider(networkName: string, networkConfig: NetworkConfig, paths?: ProjectPaths, artifacts?: Artifacts, experimentalHardhatNetworkMessageTraceHooks?: BoundExperimentalHardhatNetworkMessageTraceHook[]): EthereumProvider;
export declare function applyProviderWrappers(provider: EIP1193Provider, netConfig: Partial<NetworkConfig>): EIP1193Provider;
//# sourceMappingURL=construction.d.ts.map