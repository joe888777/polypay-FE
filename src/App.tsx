import { useState , ChangeEvent, useEffect, useRef } from 'react'
import './App.css'
import Web3 from 'web3';
import { ChainlinkPlugin, GoerliPriceFeeds } from '@chainsafe/web3.js-chainlink-plugin';
import { Button, Modal } from 'react-bootstrap';
import {abi, address as contractAddress } from './contract';
import { walletAddress } from './config';


function App() {
    const [targetAddress, setTargetAddress] = useState("0x400627");
    const [amountStr, setAmountStr] = useState("");
    const [error, setError] = useState("");
    const web3 = useRef<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [priceShow, setPriceShow] = useState<any>(-1);
    
    const connectWallet = async () => {
        if (window && window.ethereum) {
            try {
                await window.ethereum.request({ method: "eth_requestAccounts"});
                web3.current = new Web3(window.ethereum);
                const chainlinkPlugin = new ChainlinkPlugin();
                web3.current.registerPlugin(chainlinkPlugin);
                console.dir(web3.current);
                setIsConnected(true);
            } catch (err: Error) {
                setError(err.message);
                setIsConnected(false);
            }
            
        } else {
            alert("please install MetaMask");
        }
    }

    const getPricefeed = (priceFeed: GoerliPriceFeeds) => {
        web3.current.chainlink.getPrice(priceFeed).then((res: any) => {
            console.dir(res);
            setPriceShow(res.answer);
        });
    }

    const walletMint = () => {
        const contract = new web3.current.eth.Contract(abi, contractAddress);
        console.dir(contract.methods);
        contract.methods.mint(walletAddress, 1000000000).send({ from: walletAddress },
            (err, txHash) => {
                if (err) {
                console.error(err);
                } else {
                console.log(txHash);
                }
            }
        )
    }

  useEffect(() => {
    //set address
    console.dir(web3);
  }, []);
  useEffect(() => {
    console.log(priceShow)
  }, [priceShow])
  
  const handleSetNumber = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isNaN(parseFloat(e.target.value))) {// FIXME
      setAmountStr(e.target.value);
    }
  }

  return (
    <>
        <div>
        <h1>polyPay</h1>
        transfer <input type="text" onChange={handleSetNumber} value={amountStr} /> usdt to {targetAddress}
        <Button onClick={()=> {connectWallet(); }}>按下去連接錢包</Button>
        <Button onClick={()=> {walletMint(); }}>mint MTK token</Button>
        {isConnected &&(
            <div>
                <Button onClick={()=> {getPricefeed(GoerliPriceFeeds.BtcUsd); }}>get price feed BTC/USD</Button>
                <Button onClick={()=> {getPricefeed(GoerliPriceFeeds.BtcEth); }}>get price feed BTC/ETH</Button>
                <Button onClick={()=> {getPricefeed(GoerliPriceFeeds.EthUsd); }}>get price feed ETH/USD</Button>
                <Button onClick={()=> {getPricefeed(GoerliPriceFeeds.DaiUsd); }}>get price feed Dai/USD</Button>
            </div>
        )}
      <div>
        <font color="red">
            {error}
        </font>
        <font color="green">{`${priceShow}`}</font>
        </div>
      </div>
    </>
  )
}

export default App
