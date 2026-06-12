import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import * as dotenv from "dotenv";
dotenv.config({ path: '.env.local' });

// Placeholder private key for testing, or use environment variables
const PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    base_sepolia: {
      type: "http",
      url: "https://sepolia.base.org",
      accounts: [PRIVATE_KEY]
    }
  }
};

export default config;
