const { getConnection } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const mintsAccount = new PublicKey("ARe8AvCgz19aMMxSvd2fHDDRYZCvSAdwS5u7Sc6PGejD");
const mintsAccountCountOffset = 40;
const mintOwnOffset = 112;
const mintClientOffset = 120;
const mintSize = 128;
const mintsAccountDataOffset = 44;
const mintTickerOffset = 104;
const devolOne = 1048576;
const Tickers = { "USDC": "usd-coin" };

async function tvl() {
  let tvlData = {};
  const connection = getConnection();
  const mintsInfoRaw = await connection.getAccountInfo(mintsAccount);
  const mintsInfo = mintsInfoRaw.data.subarray(mintsAccountDataOffset);
  const mintsCount = mintsInfoRaw.data.readInt32LE(mintsAccountCountOffset);
  for (let i = 0; i < mintsCount; ++i) {
    const offset = +i * mintSize;
    const ticker = getTicker(mintsInfo.subarray(offset + mintTickerOffset, offset + mintTickerOffset + 8));
    const ownFinds = toDec(mintsInfo.readBigInt64LE(offset + mintOwnOffset));
    const clientFunds = toDec(mintsInfo.readBigInt64LE(offset + mintClientOffset));
    if (Tickers.hasOwnProperty(ticker)) {
      tvlData[Tickers[ticker]] = ownFinds + clientFunds;
    }
  }
  return tvlData;
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  methodology: "To obtain the TVL of Devol we make on-chain calls"
};

function toDec(b) {
  return Number(b) / Number(devolOne);
}

function getTicker(slist) {
  let buffer = [];
  for (let j = 0; j < 8 && slist[j] !== 0; ++j) {
    buffer.push(String.fromCharCode(slist[j]));
  }
  return buffer.join("");
}
