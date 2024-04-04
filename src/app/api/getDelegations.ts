import { getApiData } from "@/utils/getApiData";
import { encode } from "url-safe-base64";

interface Delegations {
  data: Delegation[];
  pagination: Pagination;
}

export interface Delegation {
  staking_tx_hash_hex: string;
  staker_pk_hex: string;
  finality_provider_pk_hex: string;
  state: string;
  staking_value: number;
  staking_tx: StakingTx;
}

export interface StakingTx {
  tx_hex: string;
  output_index: number;
  start_timestamp: string;
  start_height: number;
  timelock: number;
}

interface Pagination {
  next_key: string;
}

export const getDelegations = async (
  key: string,
  publicKeyNoCoord?: string,
): Promise<Delegations> => {
  if (!publicKeyNoCoord) {
    throw new Error("No public key provided");
  }

  const limit = 100;
  const reverse = true;

  const params = {
    "pagination.key": encode(key),
    "pagination.reverse": reverse,
    "pagination.limit": limit,
    staker_btc_pk: encode(publicKeyNoCoord),
  };

  return getApiData(
    "/v1/staker/delegations",
    "Error getting delegations",
    params,
  );
};
