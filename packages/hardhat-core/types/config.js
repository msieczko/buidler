"use strict";
// This file defines the different config types.
//
// For each possible kind of config value, we have two type:
//
// One that starts with User, which represent the config as written in the
// user config.
//
// The other one, with the same name except for the User prefix, represents
// the resolved value as used during the hardhat execution.
//
// Note that while many declarations are repeated here (i.e. network types'
// fields), we don't use `extends` as that can interfere with plugin authors
// trying to augment the config types.
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=config.js.map