/// <reference types="node" />
import { HardhatNetworkAccountConfig, UserHardhatNetworkHDAccountsConfig } from "../../../types";
export declare function derivePrivateKeys(mnemonic: string, hdpath: string, initialIndex: number, count: number): Buffer[];
export declare function normalizeHardhatNetworkAccountsConfig(accountsConfig: Required<UserHardhatNetworkHDAccountsConfig>): HardhatNetworkAccountConfig[];
//# sourceMappingURL=util.d.ts.map